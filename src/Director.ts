import { CellBuilder } from "./builders/CellBuilder";
import { Cell } from "./Cell"
import { IBuilder } from "./interfaces/IBuilder";

export class Director {
    
    public makeCell(address: string): Cell {
        let builder : IBuilder = new CellBuilder();
        builder.setContext(address);
        let cell : Cell = builder.getProduct();
        builder.reset();
        return cell;
    }

    public makeExpression(expression: string): IExpression {
        
    }
}