import {Message} from "discord.js";
import MessageUtils from "../discord/MessageUtils";
import MessageSender from "../discord/MessageSender";
import Globals from "../Globals";
import LoggerFactory from "../logging/LoggerFactory";
import RoleAdder from "../discord/RoleAdder";
import ChannelUtils from "../discord/ChannelUtils";
import MessageFetcher from "../discord/MessageFetcher";

const WRONG_MESSAGE_FORMAT_ERROR = Error('WRONG_MESSAGE_FORMAT');
const WRONG_NUMBER_POSTED_ERROR = Error('WRONG_NUMBER');

export default class Verifications {
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

  extractLastUserMessagesFrom(messages, count) {
    return Array.from(messages.reverse().filter((msg) => this.messageUtils.isSentFromUser(msg)).values()).slice(-count);
  }

  getDuplicatedNumbers(messages, currentNumber) {
    return Array.from(messages.filter((msg) => this.messageUtils.isSentFromUser(msg) && msg.content.includes(currentNumber)).values());
  }

  extractNumbersForChecks(messages) {
    return this.extractLastUserMessagesFrom(messages, this.globals.getReadMessagesCount()).map((message) => this.messageUtils.extractNumberFromMessage(message));
  }

  isNewlyPostedNumberCorrect(checkedNumbers) {
    return checkedNumbers.currentNumber - 1 === checkedNumbers.previousNumber;
  }

  handleWrongMessageFormat(channel, lastMessage) {
    this.messageSender.notifyWrongMessageFormat(channel, lastMessage.author.id);
    this.messageSender.deleteMessage(lastMessage);
  }

  handleWrongNumber(channel, lastMessage) {
    this.messageFetcher.fetchMessage(lastMessage).then(() => {
      this.messageSender.notifyWrongNumberProvided(channel, lastMessage.author.id);
      this.messageSender.deleteMessage(lastMessage);
    });
  }

  handlePrizedNumberPosted(number, lastMessage) {
    const wonRoleId = this.globals.getRanks()[number];
    this.roleAdder.addRoleToUser(lastMessage, wonRoleId);
  }

  handleGameOver(channel) {
    new Promise((resolve) => {
      setTimeout(resolve.bind(null, this.messageSender.notifyGameOver(channel)), 3000);
    }).then(() => {
      this.channelUtils.removeSendMessagePermissions(channel);
    });
  }

  handleDuplicatedLastMessages(checkedNumbers, lastTwoNumbers, messages) {
    this.logger.debug('Last two numbers are the same, checking further');
    const previousValidNumber = checkedNumbers.filter((number) => number !== lastTwoNumbers.currentNumber).pop();
    this.logger.debug(`Last valid number: ${previousValidNumber}`);
    const duplicatedMessages = this.getDuplicatedNumbers(messages, lastTwoNumbers.currentNumber);
    const correctedLastMessage = duplicatedMessages.shift();
    duplicatedMessages.forEach((msg: Message) => {
      this.logger.debug(`Removing message=${msg.content} from ${msg.author.username}`);
      this.handleWrongNumber(msg.channel, msg);
    });
    lastTwoNumbers['previousNumber'] = previousValidNumber;
    return correctedLastMessage;
  }

  verifySentMessage(lastMessage, messages) {
    const checkedNumbers = this.extractNumbersForChecks(messages);
    const lastTwoNumbers = {
      'previousNumber': checkedNumbers[checkedNumbers.length - 2],
      'currentNumber': checkedNumbers[checkedNumbers.length - 1],
    };
    if (isNaN(lastTwoNumbers.previousNumber) && isNaN(lastTwoNumbers.currentNumber)) {
      if (messages.every((msg) => !this.messageUtils.isContainingNumber(msg))) {
        this.logger.info('Skipping further validation as counting doesn\'t start yet');
        return;
      } else {
        this.logger.error('Something really bad happen: two messages without numbers when there are other numbers in channel!');
        throw WRONG_MESSAGE_FORMAT_ERROR;
      }
    }
    if ((isNaN(lastTwoNumbers.previousNumber)) && lastTwoNumbers.currentNumber !== 1) {
      this.logger.error(`${lastMessage.author.username} tried to start game with value higher than 1!`);
      throw WRONG_NUMBER_POSTED_ERROR;
    }
    if (isNaN(lastTwoNumbers.currentNumber)) {
      this.logger.error(`${lastMessage.author.username} sent message not starting with number.`);
      throw WRONG_MESSAGE_FORMAT_ERROR;
    }
    if (lastTwoNumbers.previousNumber === lastTwoNumbers.currentNumber) {
      this.logger.error(`${lastMessage.author.username} posted number equal to previous, proceeding to deal with duplicate.`);
      lastMessage = this.handleDuplicatedLastMessages(checkedNumbers, lastTwoNumbers, messages);
    }
    if (!isNaN(lastTwoNumbers.previousNumber) && !this.isNewlyPostedNumberCorrect(lastTwoNumbers)) {
      this.logger.error(`${lastMessage.author.username} posted wrong number!`);
      throw WRONG_NUMBER_POSTED_ERROR;
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

  tryMessageVerifications(lastMessage, messages, channel) {
    try {
      this.verifySentMessage(lastMessage, messages);
    } catch (error) {
      switch (error) {
        case WRONG_MESSAGE_FORMAT_ERROR:
          this.handleWrongMessageFormat(channel, lastMessage);
          break;
        case WRONG_NUMBER_POSTED_ERROR:
          this.handleWrongNumber(channel, lastMessage);
          break;
        default:
          this.logger.error('Unknown error occurred: ', error);
          break;
      }
    }
  }

  verifyNewMessage(lastMessage, client) {
    this.logger = this.loggerFactory.getLogger(lastMessage.guild.name);
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
}
