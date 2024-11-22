import { MergeConflict } from "./MergeConflict";
import { Cell } from "model/components/Cell";

export type ConflictResolutionCallback = (
    conflict: MergeConflict,
    resolve: (value: boolean) => void
) => void;

export class MergeConflictResolver {
    private conflicts: MergeConflict[];
    private conflictCallback?: ConflictResolutionCallback;
    private resolutionPromises: Map<string, (value: boolean) => void>;

    public constructor() {
        this.conflicts = [];
        this.resolutionPromises = new Map();
    }

    public addConflicts(conflicts: MergeConflict[]) {
        this.conflicts = conflicts;
        this.resolutionPromises.clear();
    }

    public onConflict(callback: ConflictResolutionCallback) {
        this.conflictCallback = callback;
    }

    public resolveConflict(cellAddress: string, useOriginal: boolean) {
        const resolveCallback = this.resolutionPromises.get(cellAddress);
        if (resolveCallback) {
            resolveCallback(useOriginal);
            this.resolutionPromises.delete(cellAddress);
        }
    }

    public async resolve(): Promise<Map<string, Cell>> {
        if (this.conflicts.length === 0) {
            return new Map<string, Cell>();
        }

        if (!this.conflictCallback) {
            return new Map<string, Cell>();
        }

        const resolutions = this.conflicts.map(conflict =>
            new Promise<[string, Cell]>((resolvePromise) => {
                const resolutionHandler = (value: boolean) => {
                    resolvePromise([conflict.getCell(), conflict.use(value)]);
                };

                // Store the resolution callback
                this.resolutionPromises.set(conflict.getCell(), resolutionHandler);

                // Notify UI of conflict
                this.conflictCallback!(conflict, resolutionHandler);
            })
        );

        const resolution = await Promise.all(resolutions);
        return new Map(resolution);
    }

    public getConflicts(): MergeConflict[] {
        return [...this.conflicts];
    }

    public hasPendingConflicts(): boolean {
        return this.resolutionPromises.size > 0;
    }
}