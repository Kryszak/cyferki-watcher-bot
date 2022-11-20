import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import MessageSender from "../../src/discord/MessageSender";
import MessageFetcher from "../../src/discord/MessageFetcher";
import RoleAdder from "../../src/discord/RoleAdder";
import ChannelUtils from "../../src/discord/ChannelUtils";
import MessageVerificator from "../../src/verification/MessageVerificator";
import MessageUtils from "../../src/discord/MessageUtils";
import PrizeManager from "../../src/verification/PrizeManager";
import ErrorHandler from "../../src/verification/ErrorHandler";
import GameoverManager from "../../src/verification/GameoverManager";
import MessageDeleter from "../../src/discord/MessageDeleter";
import TestUtils from "../TestUtils";
import { Client, Message } from "discord.js";
import mocked = jest.mocked;

jest.useFakeTimers();
jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");
jest.mock("../../src/discord/MessageDeleter");
jest.mock("../../src/discord/RoleAdder");

const channelName = 'watched channel';
const channel = {
    'name': channelName,
    'messages': {
        'fetch': () => Promise.resolve(),
    }
};
const messageWithoutContent = {
    'guild': {
        'name': 'test guild',
    },
    'author': {
        'id': 'id',
        'bot': false,
        'username': 'test username',
    },
    'channel': channel,
};

const getMessageWithoutContent = () => {
    return { ...messageWithoutContent, 'id': TestUtils.generateMessageId() }
}

const client = {
    'channels': {
        'cache': {
            'get': () => {
                return channel;
            },
        },
    },
} as unknown as Client;

const mockGlobals: jest.Mocked<Globals> = {
    getClientToken: jest.fn().mockReturnValue('token'),
    getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
    getGameoverNumber: jest.fn().mockReturnValue(20),
    getLogLevel: jest.fn().mockReturnValue('debug'),
    getRankWonMessageContent: jest.fn().mockReturnValue('rankWonMsg'),
    getRanks: jest.fn().mockReturnValue({ '10': '123' }),
    getReadMessagesCount: jest.fn().mockReturnValue(20),
    getWatchedChannel: jest.fn().mockReturnValue(channelName),
    getWrongIncrementMessage: jest.fn().mockReturnValue('wrongIncrementMsg'),
    getWrongMessageContent: jest.fn().mockReturnValue('wrongMsg')
}
const loggerFactory = new LoggerFactory(mockGlobals);
const messageUtils = new MessageUtils();
const mockMessageSender = mocked(new MessageSender(mockGlobals));
const mockMessageFetcher = mocked(new MessageFetcher(mockGlobals, messageUtils));
const mockMessageDeleter = mocked(new MessageDeleter(loggerFactory));
const roleAdder = new RoleAdder(mockMessageFetcher, mockMessageSender, loggerFactory);
const mockChannelUtils = mocked(new ChannelUtils(mockGlobals, loggerFactory));
const prizeManager = new PrizeManager(mockGlobals, roleAdder, mockMessageFetcher);
const gameoverManager = new GameoverManager(mockGlobals, mockChannelUtils, mockMessageSender);
const errorHandler = new ErrorHandler(mockMessageFetcher, mockMessageSender, mockMessageDeleter, loggerFactory);
const subject = new MessageVerificator(
    messageUtils,
    mockMessageFetcher,
    mockChannelUtils,
    prizeManager,
    gameoverManager,
    errorHandler,
    loggerFactory
);

afterEach(() => {
    mockMessageDeleter.deleteMessage.mockClear();
    mockMessageSender.notifyWrongNumberProvided.mockClear();
    mockMessageSender.notifyWrongMessageFormat.mockClear();
});

test('Verify message handling', () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': '3',
    } as unknown as Message;
    const messages = [{ ...getMessageWithoutContent(), 'content': '1' },
    { ...getMessageWithoutContent(), 'content': '2' },
        lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

    expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify wrong message format handling', async () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': 'qwe',
    } as unknown as Message;

    const messages = [
        { ...getMessageWithoutContent(), 'content': '1' },
        { ...getMessageWithoutContent(), 'content': '2' },
        lastMessage] as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));
    mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve(lastMessage));

    await subject.verifyNewMessage(lastMessage, client);
    await TestUtils.waitForAsyncCalls(1);

    expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledTimes(1);
    expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledWith(channel, lastMessage.author.id);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledTimes(1);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify wrong number posted handling', async () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': '4',
    } as unknown as Message;

    const messages = [
        { ...getMessageWithoutContent(), 'content': '1' },
        { ...getMessageWithoutContent(), 'content': '2' },
        lastMessage
    ] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));
    mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve(lastMessage));

    await subject.verifyNewMessage(lastMessage, client);
    await TestUtils.waitForAsyncCalls(2);

    expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(1);
    expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledWith(channel, lastMessage.author.id);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledTimes(1);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify empty channel - writing rules', async () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': 'Rules and so on',
    } as unknown as Message;
    const messages = [lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

    expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify writing rules', () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': 'Rules and so on',
    } as unknown as Message;

    const messages = [
        { ...getMessageWithoutContent(), 'content': 'Rules line 1' },
        { ...getMessageWithoutContent(), 'content': 'Rules line 2' },
        lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

    expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify first number posted', () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': '1',
    } as unknown as Message;

    const messages = [lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

    expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify error thrown on wrong channel state', async () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': 'Rules and so on',
    } as unknown as Message;

    const messages = [
        { ...getMessageWithoutContent(), 'content': 'Rules line 1' },
        { ...getMessageWithoutContent(), 'content': '1' },
        { ...getMessageWithoutContent(), 'content': 'Rules line 2' },
        lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

    subject.verifyNewMessage(lastMessage, client);
    await TestUtils.waitForAsyncCalls(2);

    expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledTimes(1);
    expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledWith(channel, lastMessage.author.id);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledTimes(1);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify first number posted after rules', () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': '1',
    } as unknown as Message;

    const messages = [
        { ...getMessageWithoutContent(), 'content': 'Rules line 1' },
        { ...getMessageWithoutContent(), 'content': 'Rules line 2' },
        lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

    expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify error thrown on wrong first number', async () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': '2',
    } as unknown as Message;

    const messages = [
        { ...getMessageWithoutContent(), 'content': 'Rules line 1' },
        { ...getMessageWithoutContent(), 'content': 'Rules line 2' },
        lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

    subject.verifyNewMessage(lastMessage, client);
    await TestUtils.waitForAsyncCalls(3);

    expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(1);
    expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledWith(channel, lastMessage.author.id);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledTimes(1);
    expect(mockMessageDeleter.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify rank granted for prized number', async () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': '10',
    } as unknown as Message;

    const messages = [
        { ...getMessageWithoutContent(), 'content': '8' },
        { ...getMessageWithoutContent(), 'content': '9' },
        lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));
    mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve(lastMessage));

    await subject.verifyNewMessage(lastMessage, client);
    await TestUtils.waitForAsyncCalls(1);

    expect(roleAdder.addRoleToUser).toHaveBeenCalledTimes(1);
});

test('Verify gameover for last number', async () => {
    const lastMessage = {
        ...getMessageWithoutContent(),
        'content': '20',
    } as unknown as Message;

    const messages = [
        { ...getMessageWithoutContent(), 'content': '18' },
        { ...getMessageWithoutContent(), 'content': '19' },
        lastMessage] as unknown as Array<Message>;
    mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

    await subject.verifyNewMessage(lastMessage, client);

    expect(mockMessageSender.notifyGameOver).toHaveBeenCalledTimes(1);
});
