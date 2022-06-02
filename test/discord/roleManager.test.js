const {addRoleToUser, hasRole} = require('../../src/discord/roleManager');
const messageFetcher = require('../../src/discord/messageFetcher');
const messageSender = require('../../src/discord/messageSender');

jest.mock('../../src/discord/messageFetcher');
jest.mock('../../src/discord/messageSender');

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
  messageFetcher.fetchMessage.mockReturnValue(Promise.resolve());

  await addRoleToUser(message, roleId);

  expect(messageSender.notifyPrizedNumber).toHaveBeenCalledTimes(1);
  expect(messageSender.notifyPrizedNumber).toHaveBeenCalledWith({}, 'id', roleId);
  expect(mockedAdd).toHaveBeenCalledTimes(1);
  expect(mockedAdd).toHaveBeenCalledWith(roleId);
});

test('Should not add role to user if user already has it', () => {
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

  addRoleToUser(message, 12);

  expect(mockedAdd).not.toHaveBeenCalled();
});

test('Should return true if user has role', () => {
  const mockedFind = jest.fn(() => true);
  const member = {
    'roles': {
      'cache': {
        'find': mockedFind,
      },
    },
  };

  expect(hasRole(member, 12)).toBeTruthy();
});

test('Should return false if user does\'t have role', () => {
  const mockedFind = jest.fn(() => false);
  const member = {
    'roles': {
      'cache': {
        'find': mockedFind,
      },
    },
  };

  expect(hasRole(member, 12)).toBeFalsy();
});
