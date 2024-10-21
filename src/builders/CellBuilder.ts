import { Cell } from '../Cell';
import { IBuilder } from '../interfaces/IBuilder'

export class CellBuilder implements IBuilder {
    private cell : Cell;
    
    constructor() {
        this.cell = new Cell();
    }

    public getProduct(): Cell {
        return this.cell;
    }

    public reset(): void {
        this.cell = new Cell();
    }

    setContext(text: string): void {
        this.cell.
    }
    
}