import { Cell } from '../Cell';
import { IBuilder } from '../interfaces/IBuilder'
import { VersionEntry } from '../version/VersionEntry';
import { VersionHistory } from '../version/VersionHistory';

export class CellBuilder implements IBuilder {
    private address : string;
    private input : string;
    
    public constructor() {
        this.address = '';
        this.input = '';
    }

    public getProduct(): Cell {
        let cell: Cell = new Cell(this.address, this.input);
        let create: VersionEntry = new VersionEntry('');
        let history: VersionHistory = new VersionHistory();
        history.addEntry(create);
        this.address = '';
        return cell;
    }

    public reset(): void {
        this.address = '';
        this.input = '';
    }

    public setContext(text: string[]): void {
        this.address = text[0];
        this.input = text[1];
    }
}