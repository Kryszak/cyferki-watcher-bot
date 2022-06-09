import RoleAdder from '../../src/discord/RoleAdder';
import MessageFetcher from "../../src/discord/MessageFetcher";
import MessageSender from "../../src/discord/MessageSender";
import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import mocked = jest.mocked;
import MessageUtils from "../../src/discord/MessageUtils";

jest.mock("../../src/discord/MessageFetcher");
jest.mock("../../src/discord/MessageSender");

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
const messageUtils = new MessageUtils();
const mockMessageFetcher = mocked(new MessageFetcher(mockGlobals, messageUtils));
const mockMessageSender = mocked(new MessageSender(mockGlobals, new LoggerFactory(mockGlobals)));

const subject = new RoleAdder(mockMessageFetcher, mockMessageSender, new LoggerFactory(mockGlobals));

test('Should add role to user if user doesn\'t have it yet', async () => {
  const mockedAdd = jest.fn();
  const roleId = 12;
  const message = {
    'channel': {},
    'guild': {
      'name': 'test guild',
    },
    'author': {
      'id': 'id',
      'username': 'test author',
    },
    'member': {
      'roles': {
        'add': mockedAdd,
        'cache': {
          'find': jest.fn(() => false),
        },
      },
    },
  };
  mockMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await subject.addRoleToUser(message, roleId);

  expect(mockMessageSender.notifyPrizedNumber).toHaveBeenCalledTimes(1);
  expect(mockMessageSender.notifyPrizedNumber).toHaveBeenCalledWith({}, 'id', roleId);
  expect(mockedAdd).toHaveBeenCalledTimes(1);
  expect(mockedAdd).toHaveBeenCalledWith(roleId);
});

test('Should not add role to user if user already has it', async () => {
  const mockedAdd = jest.fn();
  const message = {
    'guild': {
      'name': 'test guild',
    },
    'author': {
      'username': 'test author',
    },
    'member': {
      'roles': {
        'add': mockedAdd,
        'cache': {
          'find': jest.fn(() => true),
        },
      },
    },
  };

  await subject.addRoleToUser(message, 12);

  expect(mockedAdd).not.toHaveBeenCalled();
});
