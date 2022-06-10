import {Message} from "discord.js";
import MessageUtils from "../discord/MessageUtils";
import LoggerFactory from "../logging/LoggerFactory";
import ChannelUtils from "../discord/ChannelUtils";
import MessageFetcher from "../discord/MessageFetcher";
import NumbersUnderVerification from "./NumbersUnderVerification";
import PrizeManager from "./PrizeManager";
import ErrorHandler from "./ErrorHandler";
import GameoverManager from "./GameoverManager";

export default class MessageVerificator {
  private readonly WRONG_MESSAGE_FORMAT_ERROR = Error('WRONG_MESSAGE_FORMAT');
  private readonly WRONG_NUMBER_POSTED_ERROR = Error('WRONG_NUMBER');

  private messageUtils: MessageUtils;
  private messageFetcher: MessageFetcher;
  private channelUtils: ChannelUtils;
  private prizeManager: PrizeManager;
  private gameoverManager: GameoverManager;
  private errorHandler: ErrorHandler;
  private loggerFactory: LoggerFactory;
  private logger;

  constructor(messageUtils: MessageUtils,
              messageFetcher: MessageFetcher,
              channelUtils: ChannelUtils,
              prizeManager: PrizeManager,
              gameoverManager: GameoverManager,
              errorHandler: ErrorHandler,
              loggerFactory: LoggerFactory) {
    this.messageUtils = messageUtils;
    this.messageFetcher = messageFetcher;
    this.channelUtils = channelUtils;
    this.prizeManager = prizeManager;
    this.gameoverManager = gameoverManager;
    this.errorHandler = errorHandler;
    this.loggerFactory = loggerFactory;
    this.logger = this.loggerFactory.getLogger('root');
  }

  verifyNewMessage(lastMessage, client) {
    this.logger = this.loggerFactory.getLogger(lastMessage.guild.name);
    const channel = this.channelUtils.getChannel(client, lastMessage);
    if (this.channelUtils.isSentToWatchedChannel(channel) && this.messageUtils.isSentFromUser(lastMessage)) {
      this.logger.info(`Verifying message="${lastMessage.content}" sent to channel ${this.channelUtils.getWatchedChannelName()} by ${lastMessage.author.username}`);
      this.tryMessageVerifications(lastMessage, channel)
        .finally(() => this.logger.info(`Finished verification of message="${lastMessage.content}" from ${lastMessage.author.username}`));
    }
  }

  private async tryMessageVerifications(lastMessage, channel) {
    try {
      await this.runMessageVerifications(lastMessage, channel);
    } catch (error) {
      this.errorHandler.handleError(error, channel, lastMessage);
    }
  }

  private async runMessageVerifications(lastMessage, channel) {
    const messages = await this.messageFetcher.getLastMessagesFromWatchedChannel(channel);
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
    this.prizeManager.checkForWonRole(lastTwoNumbers, lastMessage);
    this.gameoverManager.checkForGameOver(lastTwoNumbers.currentNumber, lastMessage.channel);
  }

  private extractNumbersForChecks(messages) {
    return messages.map((message) => this.messageUtils.extractNumberFromMessage(message));
  }

  private allMessagesDoesNotContainNumbers(messages) {
    return messages.every((msg) => !this.messageUtils.isContainingNumber(msg));
  }

  private handleDuplicatedLastMessages(checkedNumbers, lastTwoNumbers, messages) {
    this.logger.debug('Last two numbers are the same, checking further');
    const previousValidNumber = checkedNumbers.filter((number) => number !== lastTwoNumbers.currentNumber).pop();
    this.logger.debug(`Last valid number: ${previousValidNumber}`);
    const duplicatedMessages = this.getDuplicatedNumbers(messages, lastTwoNumbers.currentNumber);
    const correctedLastMessage = duplicatedMessages.shift();
    duplicatedMessages.forEach((msg: Message) => {
      this.logger.debug(`Removing message=${msg.content} from ${msg.author.username}`);
      this.errorHandler.handleWrongNumber(msg.channel, msg);
    });
    lastTwoNumbers.previousNumber = previousValidNumber;
    return correctedLastMessage;
  }

  private getDuplicatedNumbers(messages, currentNumber) {
    return Array.from(messages.filter((msg) => this.messageUtils.isSentFromUser(msg) && msg.content.includes(currentNumber)).values());
  }
}
