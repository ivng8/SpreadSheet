import { Cell } from '../Cell';
import { IBuilder } from '../interfaces/IBuilder'
import { VersionHistory } from '../version/VersionHistory';

export class CellBuilder implements IBuilder {
    private address : string;
    
    constructor() {
        this.address = '';
    }

    public getProduct(): Cell {
        let cell: Cell = new Cell(this.address);
        let create: VersionEntry = new VersionEntry('');
        let history: VersionHistory = new VersionHistory();
        history.addEntry(create);
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