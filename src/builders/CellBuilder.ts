import { Cell } from '../Cell';
import { IBuilder } from '../interfaces/IBuilder'

export class CellBuilder implements IBuilder {

    private cell : Cell;
    private address : string;
    
    constructor() {
        this.cell = new Cell();
        this.address = '';
    }

    public getProduct(): Cell {
        
        this.address = '';
        return this.cell;
    }

    public reset(): void {
        this.cell = new Cell();
    }

    public setContext(text: string): void {
        this.address = text;
    }
}