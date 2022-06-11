import MessageDeleter from "../../src/discord/MessageDeleter";
import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";

const mockGlobals: jest.Mocked<Globals> = {
  getClientToken: undefined,
  getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
  getGameoverNumber: undefined,
  getLogLevel: jest.fn().mockReturnValue('debug'),
  getRankWonMessageContent: jest.fn().mockReturnValue('rankWonMsg'),
  getRanks: undefined,
  getReadMessagesCount: undefined,
  getWatchedChannel: undefined,
  getWrongIncrementMessage: jest.fn().mockReturnValue('wrongIncrementMsg'),
  getWrongMessageContent: jest.fn().mockReturnValue('wrongMsg')
}
const subject = new MessageDeleter(new LoggerFactory(mockGlobals))

test('Should delete message', () => {
  const mockedDelete = jest.fn(() => Promise.resolve());
  const message = {
    'guild': {
      'name': 'test guild',
    },
    'author': {
      'username': 'test author',
    },
    'content': 'test content',
    'delete': mockedDelete,
  };

  subject.deleteMessage(message);

  expect(mockedDelete).toHaveBeenCalledTimes(1);
});