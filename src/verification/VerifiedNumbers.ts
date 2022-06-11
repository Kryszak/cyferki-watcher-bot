export default class VerifiedNumbers {
  previousNumber: number;
  currentNumber: number;

  constructor(previousNumber: number,
              currentNumber: number) {
    this.previousNumber = previousNumber;
    this.currentNumber = currentNumber;
  }

  areBothNumbersAbsent(): boolean {
    return isNaN(this.previousNumber) && isNaN(this.currentNumber);
  }

  isCurrentNumberInvalidStartingNumber(): boolean {
    return isNaN(this.previousNumber) && this.currentNumber !== 1;
  }

  isCurrentNumberAbsent(): boolean {
    return isNaN(this.currentNumber);
  }

  areBothNumbersEqual(): boolean {
    return this.previousNumber === this.currentNumber;
  }

  isCurrentNumberIncorrect(): boolean {
    return !isNaN(this.previousNumber) && (this.currentNumber - 1 !== this.previousNumber);
  }
}