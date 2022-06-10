import NumbersUnderVerification from "../../src/verification/NumbersUnderVerification";

test('Should return true if both numbers are absent', () => {
  const numbers = new NumbersUnderVerification(NaN, NaN);

  expect(numbers.areBothNumbersAbsent()).toBeTruthy();
});

test('Should return false if both numbers aren\'t absent', () => {
  const numbers = new NumbersUnderVerification(NaN, 1);

  expect(numbers.areBothNumbersAbsent()).toBeFalsy();
});

test('Should return true if current number is not valid starting number', () => {
  const numbers = new NumbersUnderVerification(NaN, 2);

  expect(numbers.isCurrentNumberInvalidStartingNumber()).toBeTruthy();
});

test('Should return false if current number is valid starting number', () => {
  const numbers = new NumbersUnderVerification(NaN, 1);

  expect(numbers.isCurrentNumberInvalidStartingNumber()).toBeFalsy();
});

test('Should return true if current number is absent', () => {
  const numbers = new NumbersUnderVerification(1, NaN);

  expect(numbers.isCurrentNumberAbsent()).toBeTruthy();
});

test('Should return false if current number is present', () => {
  const numbers = new NumbersUnderVerification(1, 2);

  expect(numbers.isCurrentNumberAbsent()).toBeFalsy();
});

test('Should return true if both numbers are equal', () => {
  const numbers = new NumbersUnderVerification(2, 2);

  expect(numbers.areBothNumbersEqual()).toBeTruthy();
});

test('Should return false if both numbers are not equal', () => {
  const numbers = new NumbersUnderVerification(1, 2);

  expect(numbers.areBothNumbersEqual()).toBeFalsy();
});

test('Should return true if current number is not correct', () => {
  const numbers = new NumbersUnderVerification(1, 3);

  expect(numbers.isCurrentNumberIncorrect()).toBeTruthy();
});

test('Should return true if current number is not correct', () => {
  const numbers = new NumbersUnderVerification(1, 2);

  expect(numbers.isCurrentNumberIncorrect()).toBeFalsy();
});