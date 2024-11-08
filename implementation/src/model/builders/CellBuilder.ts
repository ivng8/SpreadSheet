import { Cell } from '../components/Cell';
import { IBuilder } from '../interfaces/IBuilder';
import { SpreadSheet } from 'model/components/SpreadSheet';
// import { VersionEntry } from 'model/version/VersionEntry';
// import { VersionHistory } from '../version/VersionHistory';

/**
 * Constructs a cell given its relevant context and then resets itself
 */
export class CellBuilder implements IBuilder {
  private address: string;
  private input: string;
  private sheet: SpreadSheet;

  /**
   * constructs a cellbuilder with the spreadsheet that it belongs to
   * @param reference the instance of the spreadsheet it belongs to
   */ 
  public constructor(reference: SpreadSheet) {
    this.address = '';
    this.input = '';
    this.sheet = reference;
  }

  /**
   * creates an instance of the cell and returns it
   * @returns the cell using context in the builder 
   */
  public getProduct(): Cell {
    let cell: Cell = new Cell(this.address, this.input, this.sheet);
    // let history: VersionHistory = new VersionHistory();
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
