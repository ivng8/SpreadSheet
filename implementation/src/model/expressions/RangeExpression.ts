import { IExpression } from '../interfaces/IExpression';
import { SpreadSheet } from '../SpreadSheet';

export class RangeExpression implements IExpression {
  private func: string;
  private start: string;
  private end: string;
  private reference: SpreadSheet;

  public constructor(func: string, start: string, end: string, reference: SpreadSheet) {
    this.func = func;
    this.start = start;
    this.end = end;
    this.reference = reference;
  }

  public evaluate(): any {
    let values: any[] = [];
    const [column1, row1] = this.start.match(/^[A-Z]+[0-9]+$/)!;
    const [column2, row2] = this.end.match(/^[A-Z]+[0-9]+$/)!;
    for (
      let i = this.columnLetterToNumber(column1);
      i < this.columnLetterToNumber(column2);
      i += 1
    ) {
      for (let j = parseInt(row1); j < parseInt(row2); j += 1) {
        let value: any = this.reference.getCell(this.numberToColumnLetter(i) + j).getValue();
        if (value === null) {
        } else {
          values.push(value);
        }
      }
    }
    if (values.length === 0) {
      return null;
    }

    const allNumbers = values.every(value => typeof value === 'number');
    const allStrings = values.every(value => typeof value === 'string');

    switch (this.func) {
      case 'SUM':
        if (allNumbers) {
          return values.reduce((sum, value) => sum + value, 0);
        } else if (allStrings) {
          return values.reduce((sum, value) => sum + Number(value), 0);
        } else {
          throw new Error('SUM operation cannot be performed on a mix of numbers and strings');
        }
      case 'AVG':
        if (allNumbers) {
          return values.reduce((sum, value) => sum + value, 0) / values.length;
        } else {
          throw new Error('AVG operation can only be performed on numbers');
        }
      case 'MIN':
        if (allNumbers) {
          return Math.min(...values);
        } else {
          throw new Error('MIN operation can only be performed on numbers');
        }
      case 'MAX':
        if (allNumbers) {
          return Math.max(...values);
        } else {
          throw new Error('MAX operation can only be performed on numbers');
        }
    }
  }

  private columnLetterToNumber(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result *= 26;
      result += column.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
    }
    return result;
  }

  private numberToColumnLetter(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode('A'.charCodeAt(0) + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  public display(): string {
    return this.evaluate() + '';
  }
}
