import { Cell } from './Cell';
import { Director } from '../Director';
import { MergeConflictResolver } from 'model/conflicts/MergeConflictResolver';
// import { User } from './User';

/**
 * represents the table of a spreadsheet application
 */
export class SpreadSheet {
  private grid: Map<string, Cell>;
  //private users : User = [];

  /**
   * constructor for the spreadsheet
   * @param grid a map of a unique index to its cell (ex: A7 to a cell)
   */
  public constructor(grid: Map<string, Cell>) {
    this.grid = grid;
  }

  /**
   * getter for a cell given its identifier
   * @param address the address of the cell
   * @returns the Cell
   */
  public getCell(address: string): Cell {
    const cell = this.grid.get(address);
    if (cell === undefined) {
      throw new Error(`Cell at ${address} is empty`);
    }
    return cell;
  }

  /**
   * inserts a blank row into the spreadsheet and updates the other addresses and references
   * @param index the index at which the row is to be inserted
   */
  public insertRow(index: number): void {
    this.updateReferences(index, 0, 1);
    const digits = Array.from(this.grid.keys());
    let keys: string[] = [];
    let ans: Map<string, Cell> = new Map<string, Cell>;
    for (let i = 0; i < digits.length; i += 1) {
      const [letter, digit] = digits[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (parseInt(digit) >= index) {
        if (parseInt(digit) === index) {
          keys.push(digits[i]);
        }
        ans.set(letter! + (parseInt(digit) + 1), this.grid.get(digits[i])!);
      } else {
        ans.set(digits[i], this.grid.get(digits[i])!);
      }
    }
    for (let i = 0; i < keys.length; i += 1) {
      ans.set(keys[i], new Director().makeCell('', this));
    }
    this.grid = ans;
  }

  /**
   * deletes a row and updates the other addresses and references
   * @param index the index at which the row is to be deleted
   */
  public deleteRow(index: number): void {
    this.updateReferences(index, 0, -1);
    const digits = Array.from(this.grid.keys());
    let ans: Map<string, Cell> = new Map<string, Cell>;
    for (let i = 0; i < digits.length; i += 1) {
      const [letter, digit] = digits[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (parseInt(digit) > index) {
        ans.set(letter! + (parseInt(digit) - 1), this.grid.get(digits[i])!);
      } else {
        ans.set(digits[i], this.grid.get(digits[i])!);
      }
    }
    this.grid = ans;
  }

  /**
   * inserts a blank column into the spreadsheet and updates the other addresses and references
   * @param index the index at which the column is to be inserted
   */
  public insertColumn(index: number): void {
    this.updateReferences(index, 1, 0);
    const digits = Array.from(this.grid.keys());
    let keys: string[] = [];
    let ans: Map<string, Cell> = new Map<string, Cell>;
    for (let i = 0; i < digits.length; i += 1) {
      const [letter, digit] = digits[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (this.columnLetterToNumber(letter!) >= index) {
        if (this.columnLetterToNumber(letter!) === index) {
          keys.push(digits[i]);
        }
        ans.set(this.numberToColumnLetter(this.columnLetterToNumber(letter!) + 1) + 
        digit, this.grid.get(digits[i])!);
      } else {
        ans.set(digits[i], this.grid.get(digits[i])!);
      }
    }
    for (let i = 0; i < keys.length; i += 1) {
      ans.set(keys[i], new Director().makeCell('', this));
    }
    this.grid = ans;
  }

  /**
   * deletes a column and updates the other addresses and references
   * @param index the index at which the column is to be deleted
   */
  public deleteColumn(index: number): void {
    this.updateReferences(index, -1, 0);
    const digits = Array.from(this.grid.keys());
    let ans: Map<string, Cell> = new Map<string, Cell>;
    for (let i = 0; i < digits.length; i += 1) {
      const [letter, digit] = digits[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (this.columnLetterToNumber(letter!) > index) {
        ans.set(this.numberToColumnLetter(this.columnLetterToNumber(letter!) - 1) + 
        digit, this.grid.get(digits[i])!);
      } else {
        ans.set(digits[i], this.grid.get(digits[i])!);
      }
    }
    this.grid = ans;
  }

  /**
   * clears the contents of a cell
   * @param address the address of the cell to be cleared
   */
  public clearCell(address: string): void {
    this.getCell(address).updateContents('');
  }

  /**
   * refreshes the table
   */
  public recalculate(): void {
    const keys = Array.from(this.grid.keys());
    for (let i = 0; i < keys.length; i += 1) {
      this.grid.get(keys[i])?.getValue();
    }
  }

  private updateReferences(point: number, x: number, y: number): void {
    const digits = Array.from(this.grid.keys());
    const refRegex = /REF\(([A-Za-z]+\d+)\)/g;
    for (let i = 0; i < digits.length; i += 1) {
      let curr: string = this.grid.get(digits[i])!.getInput();
      curr.replace(refRegex, (match, reference) => {
        const column = reference.match(/[A-Za-z]+/)[0];
        const row = parseInt(reference.match(/\d+/)[0]);
        if (x === 0) {
          if (row >= point) {
            return `REF(${column}${row + y})`;
          }
        } else {
          if (column >= this.numberToColumnLetter(point)) {
            return `REF(${this.numberToColumnLetter(point + x)}${row})`;
          }
        }
        return match;
      });
      if (!(curr === this.grid.get(digits[i])!.getInput())) {
        this.grid.get(digits[i])!.updateContents(curr);
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

  /**
   * converts a number to char(s) in context of a spreadsheet (ex: 3 -> C)
   * @param num the number
   * @returns a char(s) in case of 27 -> AA so it's not always single letter
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

  public import(sheet: SpreadSheet): void {
    const newGrid = new CollaborationManager(this, sheet).resolve();
    this.recalculate();
  }
}
