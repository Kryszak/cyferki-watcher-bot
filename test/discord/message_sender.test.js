const globals = require('../../src/globals');
const {
  notifyWrongNumberProvided,
  notifyWrongMessageFormat,
  notifyPrizedNumber,
  notifyGameOver,
  deleteMessage,
} = require('../../src/discord/message_sender');

jest.mock('../../src/globals');

beforeAll(() => {
  globals.getWrongIncrementMessage.mockReturnValue('wrongIncrementMsg');
  globals.getWrongMessageContent.mockReturnValue('wrongMsg');
  globals.getRankWonMessageContent.mockReturnValue('rankWonMsg');
  globals.getGameOverMessageContent.mockReturnValue('gameOverMsg');
});

test('Should send message about wrong number', () => {
  const mockedSend = jest.fn();
  const channel = {
    'send': mockedSend,
  };

  notifyWrongNumberProvided(channel, 123456);

  expect(mockedSend.mock.calls.length).toBe(1);
  expect(mockedSend.mock.calls[0][0]).toBe('<@123456> wrongIncrementMsg');
});

test('Should send message about wrong message format', () => {
  const mockedSend = jest.fn();
  const channel = {
    'send': mockedSend,
  };

  notifyWrongMessageFormat(channel, 123456);

  expect(mockedSend.mock.calls.length).toBe(1);
  expect(mockedSend.mock.calls[0][0]).toBe('<@123456> wrongMsg');
});

test('Should send message about won rank', () => {
  const mockedSend = jest.fn();
  const channel = {
    'send': mockedSend,
  };

  notifyPrizedNumber(channel, 123456, 12);

  expect(mockedSend.mock.calls.length).toBe(1);
  expect(mockedSend.mock.calls[0][0]).toBe('<@123456>, rankWonMsg <@&12>!');
});

test('Should send message about game over', () => {
  const mockedSend = jest.fn();
  const channel = {
    'send': mockedSend,
  };

  notifyGameOver(channel);

  expect(mockedSend.mock.calls.length).toBe(1);
  expect(mockedSend.mock.calls[0][0]).toBe('gameOverMsg');
});

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

  deleteMessage(message);

  expect(mockedDelete.mock.calls.length).toBe(1);
});
