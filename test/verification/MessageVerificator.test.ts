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
import mocked = jest.mocked;

jest.useFakeTimers();
jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");
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

const client = {
  'channels': {
    'cache': {
      'get': () => {
        return channel;
      },
    },
  },
};

/*
 for some reason this allows to wait for nested async code, needs to be called
 seems like it needs to be called *depth* times depending on how many nested async functions are called
*/
const waitForAsyncCalls = async (depth) => {
  for (let i = 0; i < depth; i++) {
    await Promise.resolve();
  }
}

const mockGlobals: jest.Mocked<Globals> = {
  getClientToken: undefined,
  getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
  getGameoverNumber: jest.fn().mockReturnValue(20),
  getLogLevel: jest.fn().mockReturnValue('debug'),
  getRankWonMessageContent: jest.fn().mockReturnValue('rankWonMsg'),
  getRanks: jest.fn().mockReturnValue({'10': '123'}),
  getReadMessagesCount: jest.fn().mockReturnValue(20),
  getWatchedChannel: jest.fn().mockReturnValue(channelName),
  getWrongIncrementMessage: jest.fn().mockReturnValue('wrongIncrementMsg'),
  getWrongMessageContent: jest.fn().mockReturnValue('wrongMsg')
}
const loggerFactory = new LoggerFactory(mockGlobals);
const messageUtils = new MessageUtils();
const mockMessageSender = mocked(new MessageSender(mockGlobals, loggerFactory));
const mockMessageFetcher = mocked(new MessageFetcher(mockGlobals, messageUtils));
const roleAdder = new RoleAdder(mockMessageFetcher, mockMessageSender, loggerFactory);
const mockChannelUtils = mocked(new ChannelUtils(mockGlobals, loggerFactory));
const prizeManager = new PrizeManager(mockGlobals, roleAdder, mockMessageFetcher);
const gameoverManager = new GameoverManager(mockGlobals, mockChannelUtils, mockMessageSender);
const errorHandler = new ErrorHandler(mockMessageFetcher, mockMessageSender, loggerFactory);
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
  mockMessageSender.deleteMessage.mockClear();
  mockMessageSender.notifyWrongNumberProvided.mockClear();
  mockMessageSender.notifyWrongMessageFormat.mockClear();
});

test('Verify message handling', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '3',
  };
  const messages = [{...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify wrong message format handling', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'qwe',
  };

  const messages = [
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));
  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await subject.verifyNewMessage(lastMessage, client);
  await waitForAsyncCalls(1);

  expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify wrong number posted handling', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '4',
  };

  const messages = [
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));
  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await subject.verifyNewMessage(lastMessage, client);
  await waitForAsyncCalls(2);

  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify empty channel - writing rules', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'Rules and so on',
  };
  const messages = [lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify writing rules', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'Rules and so on',
  };

  const messages = [
    {...messageWithoutContent, 'content': 'Rules line 1'},
    {...messageWithoutContent, 'content': 'Rules line 2'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify first number posted', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '1',
  };

  const messages = [lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify error thrown on wrong channel state', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'Rules and so on',
  };

  const messages = [
    {...messageWithoutContent, 'content': 'Rules line 1'},
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': 'Rules line 2'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  subject.verifyNewMessage(lastMessage, client);
  await waitForAsyncCalls(1);

  expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify first number posted after rules', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '1',
  };

  const messages = [
    {...messageWithoutContent, 'content': 'Rules line 1'},
    {...messageWithoutContent, 'content': 'Rules line 2'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  expect(() => subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

test('Verify error thrown on wrong first number', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '2',
  };

  const messages = [
    {...messageWithoutContent, 'content': 'Rules line 1'},
    {...messageWithoutContent, 'content': 'Rules line 2'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  await subject.verifyNewMessage(lastMessage, client);
  await waitForAsyncCalls(1);

  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify handling of duplicates', async () => {
  const lastMessage = {...messageWithoutContent, 'content': '2 posted'};
  const firstMessage = {...messageWithoutContent, 'content': '1'};
  const lastValidMessage = {...messageWithoutContent, 'content': '2 last valid'};

  const messages = [
    firstMessage,
    lastValidMessage,
    {...messageWithoutContent, 'content': '2 duplicated'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));
  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await subject.verifyNewMessage(lastMessage, client);
  await waitForAsyncCalls(1);

  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(2);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(2);
  expect(mockMessageSender.deleteMessage).not.toHaveBeenCalledWith(firstMessage, lastMessage);
});

test('Verify rank granted for prized number', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '10',
  };

  const messages = [
    {...messageWithoutContent, 'content': '8'},
    {...messageWithoutContent, 'content': '9'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));
  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await subject.verifyNewMessage(lastMessage, client);
  await waitForAsyncCalls(1);

  expect(roleAdder.addRoleToUser).toHaveBeenCalledTimes(1);
});

test('Verify gameover for last number', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '20',
  };

  const messages = [
    {...messageWithoutContent, 'content': '18'},
    {...messageWithoutContent, 'content': '19'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  await subject.verifyNewMessage(lastMessage, client);

  expect(mockMessageSender.notifyGameOver).toHaveBeenCalledTimes(1);
});
