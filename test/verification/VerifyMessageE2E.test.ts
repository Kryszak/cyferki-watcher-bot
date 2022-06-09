import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import MessageSender from "../../src/discord/MessageSender";
import MessageFetcher from "../../src/discord/MessageFetcher";
import RoleAdder from "../../src/discord/RoleAdder";
import ChannelUtils from "../../src/discord/ChannelUtils";
import Verifications from "../../src/verification/Verifications";
import MessageUtils from "../../src/discord/MessageUtils";
import mocked = jest.mocked;

jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");

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

const client = {
  'channels': {
    'cache': {
      'get': () => {
        return {'name': 'watched channel'};
      },
    },
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

test('Verify message handling', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '3',
  };
  const messages = [{...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage].reverse();
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  expect(async () => await subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});
