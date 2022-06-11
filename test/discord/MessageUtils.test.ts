import MessageUtils from '../../src/discord/MessageUtils';
import {Message} from "discord.js";

const subject = new MessageUtils();

test('Should return true for message sent from user', () => {
  const message = {
    'author': {
      'bot': false,
    },
  };

  expect(subject.isSentFromUser(message as Message)).toBeTruthy();
});

test('Should return false for message sent from bot', () => {
  const message = {
    'author': {
      'bot': true,
    },
  };

  expect(subject.isSentFromUser(message as Message)).toBeFalsy();
});

test('Should return true if message contains valid number', () => {
  const message = {
    'content': '123 asdf testing correct message',
  };

  expect(subject.isContainingNumber(message as Message)).toBeTruthy();
});

test('Should return false if message doesn\'t contain valid number', () => {
  const message = {
    'content': 'asdf testing incorrect message',
  };

  expect(subject.isContainingNumber(message as Message)).toBeFalsy();
});

test('Should return number if message contains valid number', () => {
  const message = {
    'content': '123 asdf testing correct message',
  };

  expect(subject.extractNumberFromMessage(message as Message)).toBe(123);
});

test('Should return NaN if message doesn\'t contain valid number', () => {
  const message = {
    'content': 'asdf testing incorrect message',
  };

  expect(subject.extractNumberFromMessage(message as Message)).toBeNaN();
});
