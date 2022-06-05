const {tryMessageVerifications} = require('../../src/verification/verifications');
const globals = require('../../src/globals');
const messageSender = require('../../src/discord/messageSender');

jest.mock('../../src/globals');
jest.mock('../../src/discord/roleManager');
jest.mock('../../src/discord/channelUtils');
jest.mock('../../src/discord/messageSender');

const channel = {};

const messageWithoutContent = {
  'guild': {
    'name': 'test guild',
  },
  'author': {
    'bot': false,
    'username': 'test username',
  },
  'channel': {
    'messages': {
      'fetch': () => Promise.resolve(),
    },
  },
};

beforeAll(() => {
  globals.getLogLevel.mockReturnValue('debug');
  globals.getReadMessagesCount.mockReturnValue(20);
  globals.getRanks.mockReturnValue(JSON.parse('{"10": "973271221112291409", "15": "973282436047839262"}'));
  globals.getGameoverNumber.mockReturnValue(20);
});

afterEach(() => {
  messageSender.deleteMessage.mockClear();
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

  await tryMessageVerifications(lastMessage, messages, channel);

  expect(messageSender.notifyWrongMessageFormat).toHaveBeenCalledTimes(1);
  expect(messageSender.notifyWrongMessageFormat).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(messageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(messageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
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

  await tryMessageVerifications(lastMessage, messages, channel);

  expect(messageSender.notifyWrongNumberProvided).toHaveBeenCalledTimes(1);
  expect(messageSender.notifyWrongNumberProvided).toHaveBeenCalledWith(channel, lastMessage.author.id);
  expect(messageSender.deleteMessage).toHaveBeenCalledTimes(1);
  expect(messageSender.deleteMessage).toHaveBeenCalledWith(lastMessage);
});
