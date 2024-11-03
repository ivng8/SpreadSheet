import { CellBuilder } from "./builders/CellBuilder";
import { ExpressionBuilder } from "./builders/ExpressionBuilder";
import { Cell } from "./Cell"
import { IBuilder } from "./interfaces/IBuilder";
import { IExpression } from "./interfaces/IExpression";

export class Director {
    
    public makeCell(address: string, input: string): Cell {
        let builder : IBuilder = new CellBuilder();
        let text : string[] = [address, input];
        builder.setContext(text);
        let cell : Cell = builder.getProduct();
        builder.reset();
        return cell;
    }

    public makeExpression(expression: string): IExpression {
        let builder : IBuilder = new ExpressionBuilder();
        let text : string[] = [expression];
        builder.setContext(text);
        let ans : IExpression = builder.getProduct();
        builder.reset();
        return ans;
    }
}