import {injectable} from "inversify";
import "reflect-metadata";
import LoggerFactory from "../logging/LoggerFactory";
import {Message} from "discord.js";

@injectable()
export default class MessageDeleter {
  private loggerFactory: LoggerFactory;

  constructor(loggerFactory: LoggerFactory) {
    this.loggerFactory = loggerFactory;
  }

  deleteMessage(message: Message): void {
    const logger = this.loggerFactory.getLogger(message.guild.name);
    logger.info(`Removing message from ${message.author.username}: ${message.content}`);
    message.delete()
      .then(() => logger.info(`Successfully removed message: ${message.content} from ${message.author.username}`))
      .catch((error) => {
        if (error.httpStatus !== 404) {
          logger.error('Error while removing message: %o', error);
        }
      });
  }
}