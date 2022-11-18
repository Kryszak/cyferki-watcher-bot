import MessageFetcher from "../discord/MessageFetcher";
import MessageSender from "../discord/MessageSender";
import LoggerFactory from "../logging/LoggerFactory";
import { injectable } from "inversify";
import "reflect-metadata";
import MessageDeleter from "../discord/MessageDeleter";
import { GuildChannel, Message } from "discord.js";
import { Logger } from "loglevel";

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

    async handleError(error: Error, channel: GuildChannel, lastMessage: Message): Promise<void> {
        this.logger = this.loggerFactory.getLogger(lastMessage.guild.name);
        switch (error.message) {
            case 'WRONG_MESSAGE_FORMAT':
                this.logger.debug('Handling wrong format error');
                return await this.handleWrongMessageFormat(channel, lastMessage);
            case 'WRONG_NUMBER':
                this.logger.debug('Handling wrong number error');
                return await this.handleWrongNumber(channel, lastMessage);
            default:
                this.logger.error('Unknown error occurred: ', error);
                return Promise.resolve();
        }
    }

    private async handleWrongNumber(channel: GuildChannel, lastMessage: Message): Promise<void> {
        await this.messageFetcher.fetchMessage(lastMessage).then(async () => {
            await this.messageSender.notifyWrongNumberProvided(channel, lastMessage.author.id);
            await this.messageDeleter.deleteMessage(lastMessage);
        });
    }

    private async handleWrongMessageFormat(channel: GuildChannel, lastMessage: Message): Promise<void> {
        await this.messageSender.notifyWrongMessageFormat(channel, lastMessage.author.id);
        await this.messageDeleter.deleteMessage(lastMessage);
    }
}