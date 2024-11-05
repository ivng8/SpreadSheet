import { Cell } from '../Cell';
import { IBuilder } from '../interfaces/IBuilder';
import { SpreadSheet } from '../SpreadSheet';
import { VersionEntry } from '../version/VersionEntry';
import { VersionHistory } from '../version/VersionHistory';

export class CellBuilder implements IBuilder {
  private address: string;
  private input: string;
  private sheet: SpreadSheet;

  public constructor(reference: SpreadSheet) {
    this.address = '';
    this.input = '';
    this.sheet = reference;
  }

  public getProduct(): Cell {
    let cell: Cell = new Cell(this.address, this.input, this.sheet);
    let history: VersionHistory = new VersionHistory();
    this.address = '';
    return cell;
  }

  public reset(): void {
    this.address = '';
    this.input = '';
  }

  public setContext(text: string[]): void {
    this.address = text[0];
    this.input = text[1];
  }
}
