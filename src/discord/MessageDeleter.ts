import {injectable} from "inversify";
import "reflect-metadata";
import LoggerFactory from "../logging/LoggerFactory";
import {DiscordAPIError, Message} from "discord.js";
import {Logger} from "loglevel";

@injectable()
export default class MessageDeleter {
    private loggerFactory: LoggerFactory;

    constructor(loggerFactory: LoggerFactory) {
        this.loggerFactory = loggerFactory;
    }

    deleteMessage(message: Message): void {
        const logger: Logger = this.loggerFactory.getLogger(message.guild.name);
        logger.info(`Removing message from ${message.author.username}: ${message.content}`);
        message.delete()
            .then(() => logger.info(`Successfully removed message: ${message.content} from ${message.author.username}`))
            .catch((error: DiscordAPIError) => {
                if (error.status !== 404) {
                    logger.error('Error while removing message: %o', error);
                }
            });
    }
}