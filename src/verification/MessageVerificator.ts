import {Client, GuildChannel, Message} from "discord.js";
import MessageUtils from "../discord/MessageUtils";
import LoggerFactory from "../logging/LoggerFactory";
import ChannelUtils from "../discord/ChannelUtils";
import MessageFetcher from "../discord/MessageFetcher";
import VerifiedNumbers from "./VerifiedNumbers";
import PrizeManager from "./PrizeManager";
import ErrorHandler from "./ErrorHandler";
import GameoverManager from "./GameoverManager";
import {injectable} from "inversify";
import "reflect-metadata";
import {Logger} from "loglevel";

@injectable()
export default class MessageVerificator {
    private readonly WRONG_MESSAGE_FORMAT_ERROR: Error = Error('WRONG_MESSAGE_FORMAT');
    private readonly WRONG_NUMBER_POSTED_ERROR: Error = Error('WRONG_NUMBER');

    private messageUtils: MessageUtils;
    private messageFetcher: MessageFetcher;
    private channelUtils: ChannelUtils;
    private prizeManager: PrizeManager;
    private gameoverManager: GameoverManager;
    private errorHandler: ErrorHandler;
    private loggerFactory: LoggerFactory;
    private logger: Logger;

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

    verifyNewMessage(lastMessage: Message, client: Client): void {
        this.logger = this.loggerFactory.getLogger(lastMessage.guild.name);
        const channel: GuildChannel = this.channelUtils.getChannel(client, lastMessage);
        if (this.channelUtils.isSentToWatchedChannel(channel) && this.messageUtils.isSentFromUser(lastMessage)) {
            this.logger.info(`Verifying message="${lastMessage.content}" sent to channel ${this.channelUtils.getWatchedChannelName()} by ${lastMessage.author.username}`);
            this.tryMessageVerifications(lastMessage, channel)
                .finally(() => this.logger.info(`Finished verification of message="${lastMessage.content}" from ${lastMessage.author.username}`));
        }
    }

    private async tryMessageVerifications(lastMessage: Message, channel: GuildChannel): Promise<void> {
        try {
            await this.runMessageVerifications(lastMessage, channel);
        } catch (error) {
            await this.errorHandler.handleError(error, channel, lastMessage);
        }
    }

    private async runMessageVerifications(lastMessage: Message, channel: GuildChannel): Promise<void> {
        const messages: Array<Message> = await this.messageFetcher.getLastMessagesFromWatchedChannel(channel);
        const checkedNumbers: Array<number> = this.extractNumbersForChecks(messages);
        const lastTwoNumbers: VerifiedNumbers = new VerifiedNumbers(checkedNumbers[checkedNumbers.length - 2], checkedNumbers[checkedNumbers.length - 1]);
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
        if (lastTwoNumbers.isCurrentNumberIncorrect()) {
            this.logger.warn(`${lastMessage.author.username} posted wrong number!`);
            throw this.WRONG_NUMBER_POSTED_ERROR;
        }
        this.prizeManager.checkForWonRole(lastTwoNumbers, lastMessage);
        this.gameoverManager.checkForGameOver(lastTwoNumbers.currentNumber, lastMessage.channel as GuildChannel);
    }

    private extractNumbersForChecks(messages: Array<Message>): Array<number> {
        return messages.map((message: Message) => this.messageUtils.extractNumberFromMessage(message));
    }

    private allMessagesDoesNotContainNumbers(messages: Array<Message>): boolean {
        return messages.every((msg: Message) => !this.messageUtils.isContainingNumber(msg));
    }
}
