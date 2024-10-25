import { Cell } from '../Cell';
import { IBuilder } from '../interfaces/IBuilder'

export class CellBuilder implements IBuilder {
    private address : string;
    
    constructor() {
        this.address = '';
    }

    public getProduct(): Cell {
        let cell: Cell = new Cell(this.address);
        this.address = '';
        return cell;
    }

    public reset(): void {
        this.address = '';
    }

    public setContext(text: string): void {
        this.address = text;
    }
}