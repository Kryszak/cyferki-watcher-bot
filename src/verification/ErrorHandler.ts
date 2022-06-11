import MessageFetcher from "../discord/MessageFetcher";
import MessageSender from "../discord/MessageSender";
import LoggerFactory from "../logging/LoggerFactory";
import {injectable} from "inversify";
import "reflect-metadata";
import MessageDeleter from "../discord/MessageDeleter";
import {GuildChannel, Message} from "discord.js";
import {Logger} from "loglevel";

@injectable()
export default class ErrorHandler {
  private messageFetcher: MessageFetcher;
  private messageSender: MessageSender;
  private messageDeleter: MessageDeleter;
  private loggerFactory: LoggerFactory;
  private logger: Logger;

  constructor(messageFetcher: MessageFetcher,
              messageSender: MessageSender,
              messageDeleter: MessageDeleter,
              loggerFactory: LoggerFactory) {
    this.messageFetcher = messageFetcher;
    this.messageSender = messageSender;
    this.messageDeleter = messageDeleter;
    this.loggerFactory = loggerFactory;
    this.logger = this.loggerFactory.getLogger('root');
  }

  handleError(error: Error, channel: GuildChannel, lastMessage: Message): void {
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

  handleWrongNumber(channel: GuildChannel, lastMessage: Message): void {
    this.messageFetcher.fetchMessage(lastMessage).then(() => {
      this.messageSender.notifyWrongNumberProvided(channel, lastMessage.author.id);
      this.messageDeleter.deleteMessage(lastMessage);
    });
  }

  private handleWrongMessageFormat(channel: GuildChannel, lastMessage: Message): void {
    this.messageSender.notifyWrongMessageFormat(channel, lastMessage.author.id);
    this.messageDeleter.deleteMessage(lastMessage);
  }
}