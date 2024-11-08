import { Cell } from './Cell';
import { Director } from '../Director';
import { User } from './User';

export class SpreadSheet {
  private grid: Map<string, Cell>;
  //private users : User = [];

  public constructor(grid: Map<string, Cell>) {
    this.grid = grid;
  }

  public getCell(address: string): Cell {
    const cell = this.grid.get(address);
    if (cell === undefined) {
      throw new Error(`Cell at ${address} is empty`);
    }
    return cell;
  }

  public insertRow(index: number): void {
    const letters = Array.from(this.grid.keys());
    let keys: String[] = [];
    for (let j = 0; j < letters.length; j += 1) {
      const [_, letter] = letters[j].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (!keys.includes(letter)) {
        keys.push(letter);
      }
    }
    for (let i = 0; i < letters.length; i += 1) {
      this.grid.set(keys[i] + '' + index, new Director().makeCell(index + '', '', this));
    }
  }

  public deleteRow(index: number): void {

  }

  public insertColumn(index: number): void {

  }

  public deleteColumn(index: number): void {

  }

  public clearCell(address: string): void {
    this.getCell(address).updateContents('');
  }

  public recalculate(): void {

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

  public display(): void {

  }
}
