import ErrorHandler from "../../src/verification/ErrorHandler";
import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import MessageSender from "../../src/discord/MessageSender";
import MessageFetcher from "../../src/discord/MessageFetcher";
import mocked = jest.mocked;

jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");

const channel = {};
const lastMessage = {
  'guild': {
    'name': 'test guild'
  },
  'author': {
    'id': 'id'
  }
};

const mockGlobals: jest.Mocked<Globals> = {
  getClientToken: undefined,
  getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
  getGameoverNumber: jest.fn().mockReturnValue(20),
  getLogLevel: jest.fn().mockReturnValue('debug'),
  getRankWonMessageContent: jest.fn().mockReturnValue('rankWonMsg'),
  getRanks: jest.fn().mockReturnValue({'10': '123'}),
  getReadMessagesCount: jest.fn().mockReturnValue(20),
  getWatchedChannel: undefined,
  getWrongIncrementMessage: jest.fn().mockReturnValue('wrongIncrementMsg'),
  getWrongMessageContent: jest.fn().mockReturnValue('wrongMsg')
}

const loggerFactory = new LoggerFactory(mockGlobals);
const mockMessageSender = mocked(new MessageSender(mockGlobals, undefined));
const mockMessageFetcher = mocked(new MessageFetcher(mockGlobals, undefined));
const errorHandler = new ErrorHandler(mockMessageFetcher, mockMessageSender, loggerFactory);

afterEach(() => {
  mockMessageSender.deleteMessage.mockClear();
});

test('Should handle WRONG_MESSAGE_FORMAT', () => {
  const error = new Error('WRONG_MESSAGE_FORMAT');

  errorHandler.handleError(error, channel, lastMessage);

  expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyWrongMessageFormat).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});

test('Should handle WRONG_NUMBER', async () => {
  const error = new Error('WRONG_NUMBER');

  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  errorHandler.handleError(error, channel, lastMessage);
  await Promise.resolve();

  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyWrongNumberProvided).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});