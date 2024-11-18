import { MergeConflictResolver } from "model/conflicts/MergeConflictResolver";
import { Cell } from "./Cell";
import { SpreadSheet } from "./SpreadSheet";
import { MergeConflict } from "model/conflicts/MergeConflict";

export class CollaborationManager {
    private import1: SpreadSheet;
    private import2: SpreadSheet;

    public constructor(import1: SpreadSheet, import2: SpreadSheet) {
        this.import1 = import1;
        this.import2 = import2;
    }

    async merge(): Promise<Map<string, Cell>> {
        let conflicts: MergeConflict[] = this.findConflicts();
        let resolver: MergeConflictResolver = new MergeConflictResolver(conflicts);
        resolver.finish 
    }

    private findConflicts(): MergeConflict[] {
        let conflicts: MergeConflict[] = [];
        const grid1 = this.import1.copyGrid();
        const grid2 = this.import2.copyGrid();
        return conflicts;
    }
}