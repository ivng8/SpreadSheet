import { Cell } from "./Cell";

export class SpreadSheet {
    private grid : Map<string, Cell>;

    public getCell(address : string): Cell {
        const cell = this.grid.get(address);
        if (cell === undefined) {
            throw new Error(`Cell at ${address} is empty`);
        }
        return cell;
    }

    public insertRow(index: number): void {
        const letters = Array.from(this.grid.keys());
        for (let i = 0; i < letters.length; i += 1) {
            this.grid.set(, new CellBuilder());
        }
    }
}