import { Cell } from 'model/components/Cell';
import { IExpression } from '../interfaces/IExpression';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { MixedValues } from 'model/errors/MixedValues';
import { IllegalOperands } from 'model/errors/IllegalOperands';
import { InvalidRange } from 'model/errors/InvalidRange';
import { InvalidExpression } from 'model/errors/InvalidExpression';

/**
 * represents an aggregate function
 */
export class RangeExpression implements IExpression {
  private func: string;
  private start: string;
  private end: string;
  private reference: SpreadSheet;
  private cell: Cell;

  /**
   * constructor for a Range Expression
   * @param func the aggregate function
   * @param start the left bound
   * @param end the right bound
   * @param reference the SpreadSheet it is referencing
   * @param cell the cell it belongs to
   */
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
      default:
        this.cell.catchErrors(new InvalidExpression());
        return null;
    }
  }

  /**
   * converts a column letter to a respective number (ex: C -> 3)
   * @param column the char(s)
   * @returns a number
   */
  private columnLetterToNumber(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result *= 26;
      result += column.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
    }
    return result;
  }

  /**
   * converts a number to a string in context of a spreadsheet
   * @param num the number
   * @returns char(s) that represents the number
   */
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
