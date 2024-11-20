// import { EventEmitter } from "stream";
import { MergeConflict } from "./MergeConflict";
import { Cell } from "model/components/Cell";

/** 
export class MergeConflictResolver extends EventEmitter {
    private conflicts: MergeConflict[];

    public constructor() {
        super();
        this.conflicts = [];
    }

    public addConflicts(conflicts: MergeConflict[]) {
        this.conflicts = conflicts;
    }

    async resolve(): Promise<Map<string, Cell>> {
        const resolutions = this.conflicts.map(conflict => 
            new Promise<[string, Cell]>(resolve => {
              this.emit('conflict', {
                conflict,
                resolve: (value: boolean) => {
                  resolve([conflict.getCell(), conflict.use(value)]);
                }
              });
            })
        );
        const resolution = await Promise.all(resolutions);
        return new Map(resolution);
    }
}
*/

export class MergeConflictResolver {
  private conflicts: MergeConflict[];
  private conflictCallback?: (conflict: MergeConflict, resolve: (value: boolean) => void) => void;

  public constructor() {
      this.conflicts = [];
  }

  public addConflicts(conflicts: MergeConflict[]) {
      this.conflicts = conflicts;
  }

  public onConflict(callback: (conflict: MergeConflict, resolve: (value: boolean) => void) => void) {
      this.conflictCallback = callback;
  }

  async resolve(): Promise<Map<string, Cell>> {
      const resolutions = this.conflicts.map(conflict => 
          new Promise<[string, Cell]>((resolvePromise) => {
              if (!this.conflictCallback) {
                  throw new Error('No conflict resolution callback set');
              }

              this.conflictCallback(conflict, (value: boolean) => {
                  resolvePromise([conflict.getCell(), conflict.use(value)]);
              });
          })
      );

      const resolution = await Promise.all(resolutions);
      return new Map(resolution);
  }
}
