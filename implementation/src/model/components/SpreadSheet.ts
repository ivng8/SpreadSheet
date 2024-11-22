import { Cell } from './Cell';
import { Director } from '../Director';
import { MergeConflictResolver } from 'model/conflicts/MergeConflictResolver';
import { CollaborationManager } from './CollaborationManager';
import { Utility } from 'model/Utility';
import { User } from './User';

/**
 * represents the table of a spreadsheet application
 */
export class SpreadSheet {
  private grid: Map<string, Cell>;
  private resolver: MergeConflictResolver;

  /**
   * constructor for the spreadsheet
   * @param grid a map of a unique index to its cell (ex: A7 to a cell)
   */
  public constructor(grid: Map<string, Cell>) {
    this.grid = grid;
    this.resolver = new MergeConflictResolver();
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

  public copyGrid(): Map<string, Cell> {
    const ans = this.grid;
    return ans;
  }

  /**
   * inserts a blank row into the spreadsheet and updates the other addresses and references
   * @param index the index at which the row is to be inserted
   * @param user the user
   */
  public insertRow(index: number, user: User): void {
    this.updateReferences(index, 0, 1, user);
    const digits = Array.from(this.grid.keys());
    let keys: string[] = [];
    let ans: Map<string, Cell> = new Map<string, Cell>;
    for (let i = 0; i < digits.length; i += 1) {
      const key = digits[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (parseInt(key[2]) >= index) {
        if (parseInt(key[2]) === index) {
          keys.push(digits[i]);
        }
        ans.set(key[1]! + (parseInt(key[2]) + 1), this.grid.get(digits[i])!);
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
   * @param user the user
   */
  public deleteRow(index: number, user: User): void {
    this.updateReferences(index, 0, -1, user);
    const digits = Array.from(this.grid.keys());
    let ans: Map<string, Cell> = new Map<string, Cell>;
    for (let i = 0; i < digits.length; i += 1) {
      const key = digits[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (parseInt(key[2]) > index) {
        ans.set(key[1]! + (parseInt(key[2]) - 1), this.grid.get(digits[i])!);
      } else {
        ans.set(digits[i], this.grid.get(digits[i])!);
      }
    }
    this.grid = ans;
  }

  /**
   * inserts a blank column into the spreadsheet and updates the other addresses and references
   * @param index the index at which the column is to be inserted
   * @param user the user
   */
  public insertColumn(index: number, user: User): void {
    this.updateReferences(index, 1, 0, user);
    const digits = Array.from(this.grid.keys());
    let keys: string[] = [];
    let ans: Map<string, Cell> = new Map<string, Cell>;
    for (let i = 0; i < digits.length; i += 1) {
      const key = digits[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (Utility.columnLetterToNumber(key[1]!) >= index) {
        if (Utility.columnLetterToNumber(key[1]!) === index) {
          keys.push(digits[i]);
        }
        ans.set(Utility.numberToColumnLetter(Utility.columnLetterToNumber(key[1]!) + 1) + 
        key[2], this.grid.get(digits[i])!);
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
   * @param user the user
   */
  public deleteColumn(index: number, user: User): void {
    this.updateReferences(index, -1, 0, user);
    const digits = Array.from(this.grid.keys());
    let ans: Map<string, Cell> = new Map<string, Cell>;
    for (let i = 0; i < digits.length; i += 1) {
      const key = digits[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (Utility.columnLetterToNumber(key[1]!) > index) {
        ans.set(Utility.numberToColumnLetter(Utility.columnLetterToNumber(key[1]!) - 1) + 
        key[2], this.grid.get(digits[i])!);
      } else {
        ans.set(digits[i], this.grid.get(digits[i])!);
      }
    }
    this.grid = ans;
  }

  /**
   * clears the contents of a cell
   * @param address the address of the cell to be cleared
   * @param user the user
   */
  public clearCell(address: string, user: User): void {
    this.getCell(address).updateContents('', user);
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

  /**
   * updates the references to all the cells that were shifted due to some translation
   * in the x or y direction depending on row or column mutation
   * @param point the reference row or col that is the pivot of the mutation
   * @param x the col direction 1 being add -1 being deletion
   * @param y the row direction 1 being add -1 being deletion
   * @param user the user
   */
  private updateReferences(point: number, x: number, y: number, user: User): void {
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
          if (column >= Utility.numberToColumnLetter(point)) {
            return `REF(${Utility.numberToColumnLetter(point + x)}${row})`;
          }
        }
        return match;
      });
      if (!(curr === this.grid.get(digits[i])!.getInput())) {
        this.grid.get(digits[i])!.updateContents(curr, user);
      }
    }
  }

  /**
   * imports an xlsx file onto the sheet using a pivot point as the drag and drop location
   * @param filePath the filepath to the other spreadsheet
   * @param originPoint the location of the drag and drop
   * @param user the user doing it
   */
  async import(filePath: string, originPoint: string, user: User): Promise<void> {
    const sheet = Utility.xlsxImport(filePath);
    const [letter, digit] = originPoint.match(/^([A-Za-z]+)(\d+)$/)!;
    for (let i = 1; i < Utility.columnLetterToNumber(letter); i += 1) {
      sheet.insertColumn(0, user);
    }
    for (let j = 1; j < parseInt(digit); j += 1) {
      sheet.insertRow(0, user);
    }
    const newGrid = await new CollaborationManager(this, sheet).merge(this.resolver);
    this.grid = newGrid;
    this.recalculate();
  }

  public export(outputPath: string): void {
    let outputs: Map<string, string> = new Map<string, string>;
    const toString = (value: string | number | null): string =>
      value === null ? '' : String(value);
    const curr = this.copyGrid();
    const keys = [...curr.keys()];
    for (let i = 0; i < keys.length; i += 1) {
      outputs.set(keys[i], toString(curr.get(keys[i])!.getValue()));
    }
    Utility.xlsxExport(outputs, outputPath);
  }
}
