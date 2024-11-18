import { MergeConflict } from "./MergeConflict";

export class MergeConflictResolver {
    private conflicts: MergeConflict[];

    public constructor(conflicts: MergeConflict[]) {
        this.conflicts = conflicts;
    }

    public isFinished(): boolean {
        return this.conflicts.length === 0;
    }
}
