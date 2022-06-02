const {addRoleToUser, hasRole} = require('../../src/discord/role_manager');
test('Should add role to user ', () => {
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
      },
    },
  };

  addRoleToUser(message, 12);

  expect(mockedAdd).toHaveBeenCalledTimes(1);
  expect(mockedAdd).toHaveBeenCalledWith(12);
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
