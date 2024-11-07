import { Cell } from 'model/Cell';
import { IExpression } from '../interfaces/IExpression';
import { SpreadSheet } from '../SpreadSheet';
import { InvalidRange } from 'model/errors/InvalidRange';
import { MixedValues } from 'model/errors/MixedValues';
import { IllegalOperands } from 'model/errors/IllegalOperands';

export class RangeExpression implements IExpression {
  private func: string;
  private start: string;
  private end: string;
  private reference: SpreadSheet;
  private cell: Cell;

  public constructor(func: string, start: string, end: string, reference: SpreadSheet, cell: Cell) {
    this.func = func;
    this.start = start;
    this.end = end;
    this.reference = reference;
    this.cell = cell;
  }

  public evaluate(): unknown {
    let values: unknown[] = [];
    const [column1, row1] = this.start.match(/^[A-Z]+[0-9]+$/)!;
    const [column2, row2] = this.end.match(/^[A-Z]+[0-9]+$/)!;
    for (
      let i = this.columnLetterToNumber(column1);
      i < this.columnLetterToNumber(column2);
      i += 1
    ) {
      for (let j = parseInt(row1); j < parseInt(row2); j += 1) {
        let value: unknown = this.reference.getCell(this.numberToColumnLetter(i) + j).getValue();
        if (value === null) {
          this.cell.catchErrors(new InvalidRange());
          return null;
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
          this.cell.catchErrors(new MixedValues());
          return null;
        }
      case 'AVG':
        if (allNumbers) {
          return values.reduce((sum, value) => sum + value, 0) / values.length;
        } else {
          this.cell.catchErrors(new IllegalOperands());
          return null;
        }
      case 'MIN':
        if (allNumbers) {
          return Math.min(...values);
        } else {
          this.cell.catchErrors(new IllegalOperands());
          return null;
        }
      case 'MAX':
        if (allNumbers) {
          return Math.max(...values);
        } else {
          this.cell.catchErrors(new IllegalOperands());
          return null;
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
