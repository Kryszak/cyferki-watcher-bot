const {isSentToWatchedChannel} = require('../src/discord/channel_utils');
const globals = require('../src/globals');

jest.mock('../src/globals');

const channelName = 'watched';

beforeAll(() => {
  globals.getWatchedChannel.mockReturnValue(channelName);
});

test('Should return true for watched channel', () => {
  const channel = {
    'name': channelName,
  };

  expect(isSentToWatchedChannel(channel)).toBeTruthy();
});
