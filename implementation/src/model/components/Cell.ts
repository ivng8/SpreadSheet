import { IExpression } from '../interfaces/IExpression';
import { VersionHistory } from "./version/VersionHistory";
// import { EmptyExpression } from "./expressions/EmptyExpression";
import { Director } from '../Director';
import { SpreadSheet } from './SpreadSheet';
import { IError } from '../interfaces/IError';

/**
 * represents a cell in a spreadsheet
 */
export class Cell {
  private input: string;
  private expression: IExpression;
  private versionHistory: VersionHistory;
  private sheet: SpreadSheet;

  /**
   * constructor of a cell
   * @param input the raw user input in the cell
   * @param reference the spreadsheet the cell is contained in
   */
  public constructor(input: string, reference: SpreadSheet) {
    this.input = input;
    this.sheet = reference;
    this.expression = new Director().makeExpression(this.input, this.sheet, this);
  }

  /**
   * gets the raw input that is in the cell
   * @returns a string that is the input
   */
  public getInput(): string {
    return this.input;
  }

  /**
   * updates the input from the user in the cell
   * thus affecting the expression and the versioning of the cell
   * @param newText the new input
   */
  public updateContents(newText: string): void {
    this.input = newText;
    this.expression = new Director().makeExpression(this.input, this.sheet, this);
    this.versionHistory.addEntry(new VersionEntry());
  }

  /**
   * updates the expression of the cell to be an error upon
   * finding errors when calculating the expression
   * @param error the type of error
   */
  public catchErrors(error: IError): void {
    this.expression = error;
  }

  /**
   * returns the value of the expression inside of the cell
   * @returns a string or number or null in case of errors
   */
  public getValue(): any {
    return this.expression.evaluate();
  }
}
