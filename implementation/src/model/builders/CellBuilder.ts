import { Cell } from '../components/Cell';
import { IBuilder } from '../interfaces/IBuilder';
import { SpreadSheet } from 'model/components/SpreadSheet';
// import { VersionEntry } from 'model/version/VersionEntry';
// import { VersionHistory } from '../version/VersionHistory';

/**
 * Constructs a cell given its relevant context and then resets itself
 */
export class CellBuilder implements IBuilder {
  private input: string;
  private sheet: SpreadSheet;

  /**
   * constructs a cellbuilder with the spreadsheet that it belongs to
   * @param reference the instance of the spreadsheet it belongs to
   */
  public constructor(reference: SpreadSheet) {
    this.input = '';
    this.sheet = reference;
  }

  public getProduct(): Cell {
    let cell: Cell = new Cell(this.input, this.sheet);
    return cell;
  }

  public reset(): void {
    this.input = '';
  }

  public setContext(text: string[]): void {
    this.input = text[0];
  }
}
