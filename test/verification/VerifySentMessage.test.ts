import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import MessageSender from "../../src/discord/MessageSender";
import MessageFetcher from "../../src/discord/MessageFetcher";
import RoleAdder from "../../src/discord/RoleAdder";
import ChannelUtils from "../../src/discord/ChannelUtils";
import Verifications from "../../src/verification/Verifications";
import MessageUtils from "../../src/discord/MessageUtils";
import mocked = jest.mocked;

jest.useFakeTimers();
jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");
jest.mock("../../src/discord/RoleAdder");

const channelName = 'watched channel';

const messageWithoutContent = {
  'guild': {
    'name': 'test guild',
  },
  'author': {
    'bot': false,
    'username': 'test username',
  },
  'channel': {
    'name': channelName,
    'messages': {
      'fetch': () => Promise.resolve(),
    },
  },
};

const messageFromBot = {
  'guild': {
    'name': 'test guild',
  },
  'author': {
    'bot': true,
    'username': 'bot user',
  },
};

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
const mockMessageSender = mocked(new MessageSender(mockGlobals, loggerFactory));
const mockMessageFetcher = mocked(new MessageFetcher(mockGlobals));
const mockRoleAdder = mocked(new RoleAdder(mockMessageFetcher, mockMessageSender, loggerFactory));
const mockChannelUtils = mocked(new ChannelUtils(mockGlobals, loggerFactory));

const subject = new Verifications(
  mockGlobals,
  new MessageUtils(),
  mockMessageSender,
  mockMessageFetcher,
  mockRoleAdder,
  mockChannelUtils,
  loggerFactory
);

test('Verify empty channel - writing rules', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'Rules and so on',
  };

  const messages = [lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify writing rules', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'Rules and so on',
  };

  const messages = [
    {...messageWithoutContent, 'content': 'Rules line 1'},
    {...messageWithoutContent, 'content': 'Rules line 2'},
    lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify first number posted', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '1',
  };

  const messages = [lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify error thrown on wrong channel state', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'Rules and so on',
  };

  const messages = [
    {...messageWithoutContent, 'content': 'Rules line 1'},
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': 'Rules line 2'},
    lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).toThrowError('WRONG_MESSAGE_FORMAT');
});

test('Verify first number posted after rules', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '1',
  };

  const messages = [
    {...messageWithoutContent, 'content': 'Rules line 1'},
    {...messageWithoutContent, 'content': 'Rules line 2'},
    lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify error thrown on wrong first number', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '2',
  };

  const messages = [
    {...messageWithoutContent, 'content': 'Rules line 1'},
    {...messageWithoutContent, 'content': 'Rules line 2'},
    lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).toThrowError('WRONG_NUMBER');
});

test('Verify error thrown on wrong message format', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'qwe',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).toThrowError('WRONG_MESSAGE_FORMAT');
});

test('Verify handling of duplicates', async () => {
  const lastMessage = {...messageWithoutContent, 'content': '2 posted'};
  const firstMessage = {...messageWithoutContent, 'content': '1'};
  const lastValidMessage = {...messageWithoutContent, 'content': '2 last valid'};

  // discord returns messages in order from last one
  const messages = [
    firstMessage,
    lastValidMessage,
    {...messageWithoutContent, 'content': '2 duplicated'},
    lastMessage].reverse();

  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await subject.verifySentMessage(lastMessage, messages);

  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(2);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(2);
  expect(mockMessageSender.deleteMessage).not.toHaveBeenCalledWith(firstMessage, lastMessage);
});

test('Verify error thrown on wrong posted number', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '4',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).toThrowError('WRONG_NUMBER');
});

test('Verify correct message sent', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '3',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify correct message sent with previous bot messages', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '3',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'},
    {...messageFromBot, 'content': 'bot talk'},
    {...messageWithoutContent, 'content': '2'},
    {...messageFromBot, 'content': 'another bot talk'},
    lastMessage].reverse();

  expect(() => subject.verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify rank granted for prized number', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '10',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '8'},
    {...messageWithoutContent, 'content': '9'},
    lastMessage].reverse();

  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await subject.verifySentMessage(lastMessage, messages);

  expect(mockRoleAdder.addRoleToUser).toHaveBeenCalledTimes(1);
});

test('Verify gameover for last number', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '20',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '18'},
    {...messageWithoutContent, 'content': '19'},
    lastMessage].reverse();

  await subject.verifySentMessage(lastMessage, messages);

  expect(mockMessageSender.notifyGameOver).toHaveBeenCalledTimes(1);
});
