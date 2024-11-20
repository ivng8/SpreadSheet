import { Cell } from 'model/components/Cell';
import { IExpression } from '../interfaces/IExpression';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { IllegalOperands } from 'model/errors/IllegalOperands';
import { InvalidRange } from 'model/errors/InvalidRange';
import { InvalidExpression } from 'model/errors/InvalidExpression';
import { Utility } from 'model/Utility';

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
      let i = Utility.columnLetterToNumber(column1);
      i < Utility.columnLetterToNumber(column2);
      i += 1
    ) {
      for (let j = parseInt(row1); j < parseInt(row2); j += 1) {
        let value: unknown = this.reference.getCell(Utility.numberToColumnLetter(i) + j).getValue();
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
    if (!allNumbers) {
      this.cell.catchErrors(new IllegalOperands());
      return null;
    }

    switch (this.func) {
      case 'SUM':
        return values.reduce((sum, value) => sum + value, 0);
      case 'AVG':
        return values.reduce((sum, value) => sum + value, 0) / values.length;
      case 'MIN':
        return Math.min(...values);
      case 'MAX':
        return Math.max(...values);
      default:
        this.cell.catchErrors(new InvalidExpression());
        return null;
    }
  }

  public display(): string {
    return this.evaluate() + '';
  }
}
