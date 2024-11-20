import { Cell } from "model/components/Cell";

export class MergeConflict {
    private cellId: string;
    private sheet1: Cell;
    private sheet2: Cell;

    public constructor(cellId: string, sheet1: Cell, sheet2: Cell) {
        this.cellId = cellId;
        this.sheet1 = sheet1;
        this.sheet2 = sheet2;
    }

    public getCell(): string {
        return this.cellId;
    }

    public use(value: boolean): Cell {
        if (value) {
            return this.sheet1;
        } else {
            return this.sheet2
        }
    }
}