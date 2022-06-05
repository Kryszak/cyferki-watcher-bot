const globals = require('../../src/globals');
const {verifyNewMessage} = require('../../src/verification/verifications');
const messageFetcher = require('../../src/discord/messageFetcher');

jest.mock('../../src/globals');
jest.mock('../../src/discord/roleManager');
jest.mock('../../src/discord/messageSender');
jest.mock('../../src/discord/messageFetcher');

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

const client = {
  'channels': {
    'cache': {
      'get': () => {
        return {'name': 'watched channel'};
      },
    },
  },
};

beforeAll(() => {
  globals.getLogLevel.mockReturnValue('debug');
  globals.getReadMessagesCount.mockReturnValue(20);
  globals.getRanks.mockReturnValue(JSON.parse('{"10": "973271221112291409", "15": "973282436047839262"}'));
  globals.getGameoverNumber.mockReturnValue(20);
  globals.getWatchedChannel.mockReturnValue('watched channel');
});

test('Verify message handling', () => {
  const lastMessage = {
    ...messageWithoutContent,
    'content': '3',
  };
  const messages = [{...messageWithoutContent, 'content': '1'},
    {...messageWithoutContent, 'content': '2'},
    lastMessage].reverse();
  messageFetcher.getLastMessagesFromWatchedChannel.mockReturnValue(Promise.resolve(messages));

  expect(async () => await verifyNewMessage(lastMessage, client)).not.toThrowError();
});
