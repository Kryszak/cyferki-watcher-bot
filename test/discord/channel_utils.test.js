const {isSentToWatchedChannel, removeSendMessagePermissions, getChannel} = require('../../src/discord/channel_utils');
const globals = require('../../src/globals');

jest.mock('../../src/globals');

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

test('Should return false for not watched channel', () => {
  const channel = {
    'name': 'general',
  };
  expect(isSentToWatchedChannel(channel)).toBeFalsy();
});

test('Should override permissions for channel', () => {
  const mockedEdit = jest.fn(() => Promise.resolve());
  const channel = {
    'permissionOverwrites': {
      'edit': mockedEdit,
    },
    'guild': {
      'name': 'test guild',
      'roles': {'everyone': true},
    },
  };
  removeSendMessagePermissions(channel);

  expect(mockedEdit.mock.calls.length).toBe(1);
});

test('Should return requested channel', () => {
  const mockedGetChannel = jest.fn();
  const client = {
    'channels': {
      'cache': {
        'get': mockedGetChannel,
      },
    },
  };

  const message = {
    'channelId': 123456,
  };

  getChannel(client, message);

  expect(mockedGetChannel).toHaveBeenCalledTimes(1);
  expect(mockedGetChannel).toHaveBeenCalledWith(123456);
});
