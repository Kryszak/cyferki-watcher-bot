import Globals from "../../src/Globals";
import MessageFetcher from "../../src/discord/MessageFetcher";
import MessageSender from "../../src/discord/MessageSender";
import LoggerFactory from "../../src/logging/LoggerFactory";
import Verifications from "../../src/verification/Verifications";
import MessageUtils from "../../src/discord/MessageUtils";
import RoleAdder from "../../src/discord/RoleAdder";
import ChannelUtils from "../../src/discord/ChannelUtils";
import mocked = jest.mocked;

jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");

const channel = {
  'send': jest.fn()
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
  'channel': {
    'messages': {
      'fetch': () => Promise.resolve(),
    },
  },
  'delete': jest.fn().mockReturnValue(Promise.resolve())
};

const mockGlobals: jest.Mocked<Globals> = {
  getClientToken: undefined,
  getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
  getGameoverNumber: jest.fn(),
  getLogLevel: jest.fn().mockReturnValue('debug'),
  getRankWonMessageContent: jest.fn().mockReturnValue('rankWonMsg'),
  getRanks: jest.fn(),
  getReadMessagesCount: jest.fn().mockReturnValue(20),
  getWatchedChannel: jest.fn(),
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

afterEach(() => {
  mockMessageSender.deleteMessage.mockClear();
});

test('Verify WRONG_MESSAGE_FORMAT_ERROR handling', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'qwe',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage].reverse();

  await subject.tryMessageVerifications(lastMessage, messages, channel);

  expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Verify WRONG_NUMBER_POSTED_ERROR handling', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '4',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage].reverse();

  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await subject.tryMessageVerifications(lastMessage, messages, channel);

  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});
