import { CellBuilder } from './builders/CellBuilder';
import { ExpressionBuilder } from './builders/ExpressionBuilder';
import { SpreadSheetBuilder } from './builders/SpreadSheetBuilder';
import { Cell } from './Cell';
import { IBuilder } from './interfaces/IBuilder';
import { IExpression } from './interfaces/IExpression';
import { SpreadSheet } from './SpreadSheet';

export class Director {
  public makeCell(address: string, input: string, reference: SpreadSheet): Cell {
    let builder: IBuilder = new CellBuilder(reference);
    let text: string[] = [address, input];
    builder.setContext(text);
    let cell: Cell = builder.getProduct();
    builder.reset();
    return cell;
  }

  public makeExpression(expression: string, reference: SpreadSheet): IExpression {
    let builder: IBuilder = new ExpressionBuilder(reference);
    let text: string[] = [expression];
    builder.setContext(text);
    let ans: IExpression = builder.getProduct();
    builder.reset();
    return ans;
  }

  public makeSpreadSheet(): SpreadSheet {
    let builder: IBuilder = new SpreadSheetBuilder();
    let ans: SpreadSheet = builder.getProduct();
    builder.reset();
    return ans;
  }
}
