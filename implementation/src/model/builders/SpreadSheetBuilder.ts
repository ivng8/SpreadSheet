import { Cell } from 'model/Cell';
import { IBuilder } from '../interfaces/IBuilder';

export class SpreadSheetBuilder implements IBuilder {
  private map: Map<string, Cell>;

  public constructor() {
    this.map = new Map<string, Cell>;
  }

  public getProduct() {
    throw new Error('Method not implemented.');
  }

  public reset(): void {
    this.map.clear();
  }

  public setContext(text: string[]): void {
    throw new Error('Method not implemented.');
  }
}
