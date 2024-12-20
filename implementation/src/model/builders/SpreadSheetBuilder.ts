import { Cell } from 'model/components/Cell';
import { IBuilder } from '../interfaces/IBuilder';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { Utility } from 'model/Utility';

/**
 * Constructs a blank SpreadSheet
 */
export class SpreadSheetBuilder implements IBuilder {
  private map: Map<string, Cell>;
  private context: Map<string, string>;
  private spreadsheet: SpreadSheet;

  /**
   * constructor for a blank SpreadSheet
   */
  public constructor() {
    this.map = new Map<string, Cell>();
    this.context = new Map<string, string>();
    this.spreadsheet = new SpreadSheet(this.map);
  }

  public getProduct(): SpreadSheet {
    for (let i = 0; i < 25; i += 1) {
      for (let j = 0; j < 50; j += 1) {
        let index: string = Utility.numberToColumnLetter(i) + j;
        this.map.set(index, new Cell(this.context.get(index) || '', this.spreadsheet));
      }
    }
    return this.spreadsheet;
  }

  public reset(): void {
    this.map.clear();
  }

  public setContext(text: string[]): void {
    for (let i = 0; i < text.length; i += 2) {
      this.context.set(text[i], text[i + 1]);
    }
  }
}
