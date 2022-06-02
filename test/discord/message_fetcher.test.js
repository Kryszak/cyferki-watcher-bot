const globals = require('../../src/globals');
const {getLastMessagesFromWatchedChannel} = require('../../src/discord/message_fetcher');

jest.mock('../../src/globals');

beforeAll(() => {
  globals.getReadMessagesCount.mockReturnValue(20);
});

test('Should fetch messages with given limit', () => {
  const mockedFetch = jest.fn();
  const channel = {
    'messages': {
      'fetch': mockedFetch,
    },
  };

  getLastMessagesFromWatchedChannel(channel);

  expect(mockedFetch).toHaveBeenCalledTimes(1);
  expect(mockedFetch).toHaveBeenCalledWith({'limit': 20});
});
