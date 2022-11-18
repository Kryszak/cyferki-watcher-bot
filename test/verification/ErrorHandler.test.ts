import ErrorHandler from "../../src/verification/ErrorHandler";
import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import MessageSender from "../../src/discord/MessageSender";
import MessageFetcher from "../../src/discord/MessageFetcher";
import MessageDeleter from "../../src/discord/MessageDeleter";
import TestUtils from "../TestUtils";
import {GuildChannel, Message} from "discord.js";
import mocked = jest.mocked;
import MessageUtils from "../../src/discord/MessageUtils";

jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");
jest.mock("../../src/discord/MessageDeleter");

const channel: GuildChannel = {} as GuildChannel;
const lastMessage = {
    'guild': {
        'name': 'test guild'
    },
    'author': {
        'id': 'id'
    }
} as Message;

const mockGlobals: jest.Mocked<Globals> = {
    getClientToken: jest.fn().mockReturnValue('token'),
    getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
    getGameoverNumber: jest.fn().mockReturnValue(20),
    getLogLevel: jest.fn().mockReturnValue('debug'),
    getRankWonMessageContent: jest.fn().mockReturnValue('rankWonMsg'),
    getRanks: jest.fn().mockReturnValue({'10': '123'}),
    getReadMessagesCount: jest.fn().mockReturnValue(20),
    getWatchedChannel: jest.fn().mockReturnValue('channelName'),
    getWrongIncrementMessage: jest.fn().mockReturnValue('wrongIncrementMsg'),
    getWrongMessageContent: jest.fn().mockReturnValue('wrongMsg')
}

const loggerFactory = new LoggerFactory(mockGlobals);
const mockMessageSender = mocked(new MessageSender(mockGlobals));
const mockMessageFetcher = mocked(new MessageFetcher(mockGlobals, mocked(new MessageUtils())));
const mockMessageDeleter = mocked(new MessageDeleter(loggerFactory));
const errorHandler = new ErrorHandler(mockMessageFetcher, mockMessageSender, mockMessageDeleter, loggerFactory);

afterEach(() => {
    mockMessageDeleter.deleteMessage.mockClear();
});

test('Should handle WRONG_MESSAGE_FORMAT', async () => {
    const error = new Error('WRONG_MESSAGE_FORMAT');

    await errorHandler.handleError(error, channel, lastMessage);

    expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledTimes(1);
    expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledWith(channel, lastMessage.author.id);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledTimes(1);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Should handle WRONG_NUMBER', async () => {
    const error = new Error('WRONG_NUMBER');

    mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve({} as Message));

    errorHandler.handleError(error, channel, lastMessage);
    await TestUtils.waitForAsyncCalls(1);

    expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(1);
    expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledWith(channel, lastMessage.author.id);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledTimes(1);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledWith(lastMessage);
});
