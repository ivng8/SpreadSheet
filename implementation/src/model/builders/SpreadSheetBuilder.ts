import { Cell } from 'model/components/Cell';
import { IBuilder } from '../interfaces/IBuilder';

export class SpreadSheetBuilder implements IBuilder {
  private map: Map<string, Cell>;

  public constructor() {
    this.map = new Map<string, Cell>;
  }

  public getProduct() {
    for (let i = 0; i < 25; i += 1) {
       for (let j = 0; j < 50 ; j += 1) {
        this.map.set('', new Cell());
       }
    }
  }

  public reset(): void {
    this.map.clear();
  }

  public setContext(text: string[]): void {
    throw new Error('Method not implemented.');
  }
}
