import { CellBuilder } from './builders/CellBuilder';
import { ExpressionBuilder } from './builders/ExpressionBuilder';
import { SpreadSheetBuilder } from './builders/SpreadSheetBuilder';
import { Cell } from './components/Cell';
import { IBuilder } from './interfaces/IBuilder';
import { IExpression } from './interfaces/IExpression';
import { SpreadSheet } from 'model/components/SpreadSheet';

/**
 * represents the director from the builder pattern which initiates the construction
 * of an object using their respective builder implementation class
 */
export class Director {

  /**
   * constructs a cell using the CellBuilder
   * @param address the address of the Cell in the spreadsheet
   * @param input the user input inside of the cell
   * @param reference the spreadsheet that the cell is contained in
   * @returns a cell
   */
  public makeCell(address: string, input: string, reference: SpreadSheet): Cell {
    let builder: IBuilder = new CellBuilder(reference);
    let text: string[] = [address, input];
    builder.setContext(text);
    let cell: Cell = builder.getProduct();
    builder.reset();
    return cell;
  }

  /**
   * constructs an expression using the ExpressionBuilder
   * @param expression the string input to be parsed
   * @param reference the spreadSheet that the expression potentially references
   * @param cell the cell that the expression is contained in
   * @returns an IExpression
   */
  public makeExpression(expression: string, reference: SpreadSheet, cell: Cell): IExpression {
    let builder: IBuilder = new ExpressionBuilder(reference, cell);
    let text: string[] = [expression];
    builder.setContext(text);
    let ans: IExpression = builder.getProduct();
    builder.reset();
    return ans;
  }

  /**
   * creates a blank SpreadSheet that defaults as the stretch from about A-Y and 1-50
   * @returns a spreadsheet
   */
  public makeSpreadSheet(): SpreadSheet {
    let builder: IBuilder = new SpreadSheetBuilder();
    let ans: SpreadSheet = builder.getProduct();
    builder.reset();
    return ans;
  }
}
