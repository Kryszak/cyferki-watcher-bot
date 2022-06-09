import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import MessageSender from "../../src/discord/MessageSender";
import MessageFetcher from "../../src/discord/MessageFetcher";
import RoleAdder from "../../src/discord/RoleAdder";
import ChannelUtils from "../../src/discord/ChannelUtils";
import MessageVerificator from "../../src/verification/MessageVerificator";
import MessageUtils from "../../src/discord/MessageUtils";
import mocked = jest.mocked;
import PrizeManager from "../../src/verification/PrizeManager";
import ErrorHandler from "../../src/verification/ErrorHandler";

jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");

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
const errorHandler = new ErrorHandler(mockMessageFetcher, mockMessageSender,loggerFactory);
const subject = new MessageVerificator(
  mockGlobals,
  messageUtils,
  mockMessageSender,
  mockMessageFetcher,
  mockChannelUtils,
  prizeManager,
  errorHandler,
  loggerFactory
);

test('Verify message handling', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '3',
  };
  const messages = [{...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage];
  mockMessageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  expect(async () => await subject.verifyNewMessage(lastMessage, client)).not.toThrowError();
});

