import { Cell } from './components/Cell';
import { Director } from './Director';
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
    for (let i = 0; i < letters.length; i += 1) {
      this.grid.set(index + '', new Director().makeCell(index + '', '', this));
    }
  }

  public deleteRow(index: number): void {

  }

  public insertColumn(index: number): void {

  }

  public deleteColumn(index: number): void {

  }

  public clearCell(address: string): void {

  }

  public recalculate(): void {
    
  }

  public display(): void {

  }
}