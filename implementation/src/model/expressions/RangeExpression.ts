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
  private referencedCells: Cell[] = [];
  private func: string;
  private start: string;
  private end: string;
  private reference: SpreadSheet;
  private cell: Cell;
  private addresses: string[] = [];
  private visited: Set<string> = new Set();

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
    const pair1 = this.start.match(/^([A-Z]+)([0-9]+)$/)!;
    const pair2 = this.end.match(/^([A-Z]+)([0-9]+)$/)!;
    for (
      let i = Utility.columnLetterToNumber(pair1[1]);
      i <= Utility.columnLetterToNumber(pair2[1]);
      i += 1
    ) {
      for (let j = parseInt(pair1[2]); j <= parseInt(pair2[2]); j += 1) {
        this.referencedCells.push(this.reference.getCell(Utility.numberToColumnLetter(i) + j));
        this.addresses.push(Utility.numberToColumnLetter(i) + j);
      }
    }
    for (let i = 0; i < this.referencedCells.length; i += 1) {
      this.cell.addDependency(this.referencedCells[i]);
    }
  }

  public evaluate(): unknown {
    let values: unknown[] = [];
    this.visited.clear;
    for (let i = 0; i < this.referencedCells.length; i += 1) {
      try {
        const value = this.referencedCells[i].getValue();
        if (value === null) {
          this.cell.catchErrors(new InvalidRange());
        }
        values.push(value);
      } catch (error) {
        if (error instanceof InvalidExpression) {
          this.cell.catchErrors(error);
        }
        throw error;
      }
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
}