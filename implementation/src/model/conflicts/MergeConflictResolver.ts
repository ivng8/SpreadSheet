// import { EventEmitter } from "stream";
import { MergeConflict } from "./MergeConflict";
import { Cell } from "model/components/Cell";

/** 
export class MergeConflictResolver extends EventEmitter {
    private conflicts: MergeConflict[];

    // public constructor() {
    //     super();
    //     this.conflicts = [];
    // }

    // public addConflicts(conflicts: MergeConflict[]) {
    //     this.conflicts = conflicts;
    // }

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

/**
 * represents a resolver that aims to fix its given conflicts with user inputs
 */
export class MergeConflictResolver {
  private conflicts: MergeConflict[];
  private conflictCallback?: (conflict: MergeConflict, resolve: (value: boolean) => void) => void;

  /**
   * constructor for the resolver
   */
  public constructor() {
      this.conflicts = [];
  }

  /**
   * adds a list of conflicts that need to be resolved
   * @param conflicts the conflicts
   */
  public addConflicts(conflicts: MergeConflict[]) {
      this.conflicts = conflicts;
  }

  /**
   * sets the conflict resolution callback to resolve a promise
   * @param callback the conflict and that resolve that solves promises
   */
  public onConflict(callback: (conflict: MergeConflict, resolve: (value: boolean) => void) => void) {
      this.conflictCallback = callback;
  }

  /**
   * resolves the conflicts stored into a map that haves the resolutions
   * creates a promise for every conflict which awaits input from the user
   * that then creates a callback on the input which will resolve the promises
   * after all the promises are resolved it sets the resolutions in a map
   * @returns the map of resolved conflicts
   */
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
