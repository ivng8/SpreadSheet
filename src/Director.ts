import { CellBuilder } from "./builders/CellBuilder";
import { ExpressionBuilder } from "./builders/ExpressionBuilder";
import { Cell } from "./Cell"
import { IBuilder } from "./interfaces/IBuilder";
import { IExpression } from "./interfaces/IExpression";

export class Director {
    
    public makeCell(address: string): Cell {
        let builder : IBuilder = new CellBuilder();
        builder.setContext(address);
        let cell : Cell = builder.getProduct();
        builder.reset();
        return cell;
    }

    public makeExpression(expression: string): IExpression {
        let builder : IBuilder = new ExpressionBuilder();
        builder.setContext(expression);
        let ans : IExpression = builder.getProduct();
        builder.reset();
        return ans;
    }
}