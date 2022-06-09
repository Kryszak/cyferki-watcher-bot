import {Message} from "discord.js";
import MessageUtils from "../discord/MessageUtils";
import MessageSender from "../discord/MessageSender";
import Globals from "../Globals";
import LoggerFactory from "../logging/LoggerFactory";
import RoleAdder from "../discord/RoleAdder";
import ChannelUtils from "../discord/ChannelUtils";
import MessageFetcher from "../discord/MessageFetcher";
import NumbersUnderVerification from "./NumbersUnderVerification";

export default class MessageVerificator {
  private readonly WRONG_MESSAGE_FORMAT_ERROR = Error('WRONG_MESSAGE_FORMAT');
  private readonly WRONG_NUMBER_POSTED_ERROR = Error('WRONG_NUMBER');

  private globals: Globals;
  private messageUtils: MessageUtils;
  private messageSender: MessageSender;
  private messageFetcher: MessageFetcher;
  private roleAdder: RoleAdder;
  private channelUtils: ChannelUtils;
  private loggerFactory: LoggerFactory;
  private logger;

  constructor(globals: Globals,
              messageUtils: MessageUtils,
              messageSender: MessageSender,
              messageFetcher: MessageFetcher,
              roleAdder: RoleAdder,
              channelUtils: ChannelUtils,
              loggerFactory: LoggerFactory) {
    this.globals = globals;
    this.messageUtils = messageUtils;
    this.messageSender = messageSender;
    this.messageFetcher = messageFetcher;
    this.roleAdder = roleAdder;
    this.channelUtils = channelUtils;
    this.loggerFactory = loggerFactory;
    this.logger = this.loggerFactory.getLogger('root');
  }

  verifyNewMessage(lastMessage, client) {
    this.logger = this.loggerFactory.getLogger(lastMessage.guild.name);
    this.logger.info(`channel from message: ${lastMessage.channel.name}`)
    const channel = this.channelUtils.getChannel(client, lastMessage);
    if (this.channelUtils.isSentToWatchedChannel(channel) && this.messageUtils.isSentFromUser(lastMessage)) {
      this.logger.info(`Verifying message="${lastMessage.content}" sent to channel ${this.globals.getWatchedChannel()} by ${lastMessage.author.username}`);
      this.messageFetcher.getLastMessagesFromWatchedChannel(channel)
        .then((messages) => {
          this.tryMessageVerifications(lastMessage, messages, channel);
        })
        .catch((error) => this.logger.error('Error while fetching last channel messages:', error))
        .finally(() => this.logger.info(`Finished verification of message="${lastMessage.content}" from ${lastMessage.author.username}`));
    }
  }

  tryMessageVerifications(lastMessage, messages, channel) {
    try {
      this.runMessageVerifications(lastMessage, messages);
    } catch (error) {
      switch (error) {
        case this.WRONG_MESSAGE_FORMAT_ERROR:
          this.handleWrongMessageFormat(channel, lastMessage);
          break;
        case this.WRONG_NUMBER_POSTED_ERROR:
          this.handleWrongNumber(channel, lastMessage);
          break;
        default:
          this.logger.error('Unknown error occurred: ', error);
          break;
      }
    }
  }

  runMessageVerifications(lastMessage, messages) {
    const checkedNumbers = this.extractNumbersForChecks(messages);
    const lastTwoNumbers = new NumbersUnderVerification(checkedNumbers[checkedNumbers.length - 2], checkedNumbers[checkedNumbers.length - 1]);
    if (lastTwoNumbers.areBothNumbersAbsent()) {
      if (this.allMessagesDoesNotContainNumbers(messages)) {
        this.logger.warn('Skipping further validation as counting doesn\'t start yet');
        return;
      } else {
        this.logger.error('Something really bad happen: two messages without numbers when there are other numbers in channel!');
        throw this.WRONG_MESSAGE_FORMAT_ERROR;
      }
    }
    if (lastTwoNumbers.isCurrentNumberInvalidStartingNumber()) {
      this.logger.warn(`${lastMessage.author.username} tried to start game with value higher than 1!`);
      throw this.WRONG_NUMBER_POSTED_ERROR;
    }
    if (lastTwoNumbers.isCurrentNumberAbsent()) {
      this.logger.warn(`${lastMessage.author.username} sent message not starting with number.`);
      throw this.WRONG_MESSAGE_FORMAT_ERROR;
    }
    if (lastTwoNumbers.areBothNumbersEqual()) {
      this.logger.warn(`${lastMessage.author.username} posted number equal to previous, proceeding to deal with duplicate.`);
      lastMessage = this.handleDuplicatedLastMessages(checkedNumbers, lastTwoNumbers, messages);
    }
    if (lastTwoNumbers.isCurrentNumberIncorrect()) {
      this.logger.warn(`${lastMessage.author.username} posted wrong number!`);
      throw this.WRONG_NUMBER_POSTED_ERROR;
    }
    if (lastTwoNumbers.currentNumber in this.globals.getRanks()) {
      this.messageFetcher.fetchMessage(lastMessage).then(() => {
        this.handlePrizedNumberPosted(lastTwoNumbers.currentNumber, lastMessage);
      });
    }
    if (lastTwoNumbers.currentNumber === this.globals.getGameoverNumber()) {
      this.handleGameOver(lastMessage.channel);
    }
  }

  private extractNumbersForChecks(messages) {
    return this.extractLastUserMessagesFrom(messages, this.globals.getReadMessagesCount()).map((message) => this.messageUtils.extractNumberFromMessage(message));
  }

  private extractLastUserMessagesFrom(messages, count) {
    return Array.from(messages.reverse().filter((msg) => this.messageUtils.isSentFromUser(msg)).values()).slice(-count);
  }

  private allMessagesDoesNotContainNumbers(messages) {
    return messages.every((msg) => !this.messageUtils.isContainingNumber(msg));
  }

  private handleWrongMessageFormat(channel, lastMessage) {
    this.messageSender.notifyWrongMessageFormat(channel, lastMessage.author.id);
    this.messageSender.deleteMessage(lastMessage);
  }

  private handleWrongNumber(channel, lastMessage) {
    this.messageFetcher.fetchMessage(lastMessage).then(() => {
      this.messageSender.notifyWrongNumberProvided(channel, lastMessage.author.id);
      this.messageSender.deleteMessage(lastMessage);
    });
  }

  private handleDuplicatedLastMessages(checkedNumbers, lastTwoNumbers, messages) {
    this.logger.debug('Last two numbers are the same, checking further');
    const previousValidNumber = checkedNumbers.filter((number) => number !== lastTwoNumbers.currentNumber).pop();
    this.logger.debug(`Last valid number: ${previousValidNumber}`);
    const duplicatedMessages = this.getDuplicatedNumbers(messages, lastTwoNumbers.currentNumber);
    const correctedLastMessage = duplicatedMessages.shift();
    duplicatedMessages.forEach((msg: Message) => {
      this.logger.debug(`Removing message=${msg.content} from ${msg.author.username}`);
      this.handleWrongNumber(msg.channel, msg);
    });
    lastTwoNumbers.previousNumber = previousValidNumber;
    return correctedLastMessage;
  }

  private getDuplicatedNumbers(messages, currentNumber) {
    return Array.from(messages.filter((msg) => this.messageUtils.isSentFromUser(msg) && msg.content.includes(currentNumber)).values());
  }

  private handlePrizedNumberPosted(number, lastMessage) {
    const wonRoleId = this.globals.getRanks()[number];
    this.roleAdder.addRoleToUser(lastMessage, wonRoleId);
  }

  private handleGameOver(channel) {
    new Promise((resolve) => {
      setTimeout(resolve.bind(null, this.messageSender.notifyGameOver(channel)), 3000);
    }).then(() => {
      this.channelUtils.removeSendMessagePermissions(channel);
    });
  }
}
