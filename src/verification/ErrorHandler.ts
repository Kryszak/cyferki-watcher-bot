import MessageFetcher from "../discord/MessageFetcher";
import MessageSender from "../discord/MessageSender";
import LoggerFactory from "../logging/LoggerFactory";
import {injectable} from "inversify";
import "reflect-metadata";

@injectable()
export default class ErrorHandler {
  private messageFetcher: MessageFetcher;
  private messageSender: MessageSender;
  private loggerFactory: LoggerFactory;
  private logger;

  constructor(messageFetcher: MessageFetcher,
              messageSender: MessageSender,
              loggerFactory: LoggerFactory) {
    this.messageFetcher = messageFetcher;
    this.messageSender = messageSender;
    this.loggerFactory = loggerFactory;
    this.logger = this.loggerFactory.getLogger('root');
  }

  handleError(error: Error, channel, lastMessage) {
    this.logger = this.loggerFactory.getLogger(lastMessage.guild.name);
    switch (error.message) {
      case 'WRONG_MESSAGE_FORMAT':
        this.logger.debug('Handling wrong format error');
        this.handleWrongMessageFormat(channel, lastMessage);
        break;
      case 'WRONG_NUMBER':
        this.logger.debug('Handling wrong number error');
        this.handleWrongNumber(channel, lastMessage);
        break;
      default:
        this.logger.error('Unknown error occurred: ', error);
        break;
    }
  }

  handleWrongNumber(channel, lastMessage) {
    this.messageFetcher.fetchMessage(lastMessage).then(() => {
      this.messageSender.notifyWrongNumberProvided(channel, lastMessage.author.id);
      this.messageSender.deleteMessage(lastMessage);
    });
  }

  private handleWrongMessageFormat(channel, lastMessage) {
    this.messageSender.notifyWrongMessageFormat(channel, lastMessage.author.id);
    this.messageSender.deleteMessage(lastMessage);
  }
}