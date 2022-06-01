const {isSentToWatchedChannel} = require('../src/discord/channel_utils');
const globals = require('../src/globals');

jest.mock('../src/globals');

test('Should return true for watched channel', () => {
  const channelName = 'watched';
  globals.getWatchedChannel.mockReturnValue(channelName);
  const channel = {
    'name': 'watched',
  };
  expect(isSentToWatchedChannel(channel)).toBeTruthy();
});
