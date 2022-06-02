const {isSentFromUser, isContainingNumber, extractNumberFromMessage} = require('../../src/discord/messageUtils');

test('Should return true for message sent from user', () => {
  const message = {
    'author': {
      'bot': false,
    },
  };

  expect(isSentFromUser(message)).toBeTruthy();
});

test('Should return false for message sent from bot', () => {
  const message = {
    'author': {
      'bot': true,
    },
  };

  expect(isSentFromUser(message)).toBeFalsy();
});

test('Should return true if message contains valid number', () => {
  const message = {
    'content': '123 asdf testing correct message',
  };

  expect(isContainingNumber(message)).toBeTruthy();
});

test('Should return false if message doesn\'t contain valid number', () => {
  const message = {
    'content': 'asdf testing incorrect message',
  };

  expect(isContainingNumber(message)).toBeFalsy();
});

test('Should return number if message contains valid number', () => {
  const message = {
    'content': '123 asdf testing correct message',
  };

  expect(extractNumberFromMessage(message)).toBe(123);
});

test('Should return NaN if message doesn\'t contain valid number', () => {
  const message = {
    'content': 'asdf testing incorrect message',
  };

  expect(extractNumberFromMessage(message)).toBeNaN();
});
