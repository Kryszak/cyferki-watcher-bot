const {verifySentMessage} = require('../../src/verification/verifications');
const globals = require('../../src/globals');
const roleManager = require('../../src/discord/roleManager');

jest.mock('../../src/globals');
jest.mock('../../src/discord/roleManager');
jest.mock('../../src/discord/channelUtils');
jest.mock('../../src/discord/messageSender');

const messageWithoutContent = {
  'guild': {
    'name': 'test guild',
  },
  'author': {
    'bot': false,
  },
  'channel': {
    'messages': {
      'fetch': () => Promise.resolve(),
    },
  },
};

beforeAll(() => {
  globals.getReadMessagesCount.mockReturnValue(20);
  globals.getRanks.mockReturnValue(JSON.parse('{"10": "973271221112291409", "15": "973282436047839262"}'));
  globals.getGameoverNumber.mockReturnValue(20);
});

test('Verify empty channel - writing rules', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'Rules and so on',
  };

  const messages = [lastMessage].reverse();

  expect(() => verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify writing rules', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'Rules and so on',
  };

  const messages = [{...messageWithoutContent, 'content': 'Rules line 1'}, {
    ...messageWithoutContent,
    'content': 'Rules line 2',
  }, lastMessage].reverse();

  expect(() => verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify first number posted', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '1',
  };

  const messages = [lastMessage].reverse();

  expect(() => verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify first number posted after rules', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '1',
  };

  const messages = [{...messageWithoutContent, 'content': 'Rules line 1'}, {
    ...messageWithoutContent,
    'content': 'Rules line 2',
  }, lastMessage].reverse();

  expect(() => verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify error thrown on wrong first number', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '2',
  };

  const messages = [{...messageWithoutContent, 'content': 'Rules line 1'}, {
    ...messageWithoutContent,
    'content': 'Rules line 2',
  }, lastMessage].reverse();

  expect(() => verifySentMessage(lastMessage, messages)).toThrowError('WRONG_NUMBER');
});

test('Verify error thrown on wrong message format', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': 'qwe',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'}, {...messageWithoutContent, 'content': '2'}, lastMessage,
  ].reverse();

  expect(() => verifySentMessage(lastMessage, messages)).toThrowError('WRONG_MESSAGE_FORMAT');
});

test('Verify handling of duplicates', () => {
  // TODO
});

test('Verify error thrown on wrong posted number', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '4',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'}, {...messageWithoutContent, 'content': '2'}, lastMessage,
  ].reverse();

  expect(() => verifySentMessage(lastMessage, messages)).toThrowError('WRONG_NUMBER');
});

test('Verify correct message sent', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '3',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '1'}, {...messageWithoutContent, 'content': '2'}, lastMessage,
  ].reverse();

  expect(() => verifySentMessage(lastMessage, messages)).not.toThrowError();
});

test('Verify rank granted for prized number', async () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '10',
  };

  // discord returns messages in order from last one
  const messages = [
    {...messageWithoutContent, 'content': '8'}, {...messageWithoutContent, 'content': '9'}, lastMessage,
  ].reverse();

  await verifySentMessage(lastMessage, messages);
  expect(roleManager.addRoleToUser).toHaveBeenCalledTimes(1);
});
