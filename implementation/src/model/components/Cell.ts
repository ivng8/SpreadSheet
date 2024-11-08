import { IExpression } from '../interfaces/IExpression';
import { VersionHistory } from "./version/VersionHistory";
// import { EmptyExpression } from "./expressions/EmptyExpression";
import { Director } from '../Director';
import { SpreadSheet } from './SpreadSheet';
import { IError } from '../interfaces/IError';

export class Cell {
  private address: string;
  private input: string;
  private expression: IExpression;
  private versionHistory: VersionHistory;
  private sheet: SpreadSheet;

  public constructor(address: string, input: string, reference: SpreadSheet) {
    this.address = address;
    this.input = input;
    this.sheet = reference;
    this.expression = new Director().makeExpression(this.input, this.sheet, this);
  }

  public getAddress(): string {
    return this.address;
  }

  public getInput(): string {
    return this.input;
  }

  public updateContents(newText: string): void {
    this.input = newText;
    this.expression = new Director().makeExpression(this.input, this.sheet, this);
    this.versionHistory.addEntry(new VersionEntry());
  }

  public catchErrors(error: IError): void {
    this.expression = error;
  }

  public getValue(): any {
    return this.expression.evaluate();
  }
}
