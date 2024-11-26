import { MergeConflictResolver } from 'model/conflicts/MergeConflictResolver';
import { Cell } from './Cell';
import { SpreadSheet } from './SpreadSheet';
import { MergeConflict } from 'model/conflicts/MergeConflict';
import { Utility } from 'model/Utility';
import { User } from './User';

/**
 * represents a class that resolves an instance of a clash between two spreadsheets
 */
export class CollaborationManager {
  private sheet1: SpreadSheet;
  private import1: Map<string, Cell>;
  private import2: Map<string, Cell>;

  /**
   * construction of a collaboration manager
   * @param import1 the origin spreadsheet
   * @param import2 the imported spreadsheet
   */
  public constructor(import1: SpreadSheet, import2: SpreadSheet) {
    this.sheet1 = import1;
    this.import1 = import1.copyGrid();
    this.import2 = import2.copyGrid();
  }

  /**
   * async merging function that searches for conflicting cells and if they are present
   * will await for the user to resolve the issues before return the new mapping
   * @param resolver a class that processes user inputs into resolve promises
   * @returns a map that represents the mapping of the new spreadsheet
   */
  async merge(resolver: MergeConflictResolver, user: User): Promise<Map<string, Cell>> {
    const totalKeys = [...this.import1.keys(), ...this.import2.keys()];
    const uniqueKeys = [...new Set(totalKeys)];
    let conflicts = this.findConflicts(uniqueKeys);
    let grid = this.noConflictMerge(uniqueKeys, user);

    if (conflicts.length > 0) {
      resolver.addConflicts(conflicts);
      const resolutions = await resolver.resolve();
      this.applyResolutions(resolutions, grid);
    }

    return grid;
  }

  /**
   * searches for conflicting cells between the 2 spreadsheets
   * @param uniqueKeys a set of the keys between the 2 spreadsheets
   * @returns a list of conflicts
   */
  private findConflicts(uniqueKeys: string[]): MergeConflict[] {
    let conflicts: MergeConflict[] = [];
    let nonConflict: string[] = [];

    for (let i = 0; i < uniqueKeys.length; i += 1) {
      let cell1 = this.import1.get(uniqueKeys[i]) || null;
      let cell2 = this.import2.get(uniqueKeys[i]) || null;

      // Skip if either cell is null or empty
      if (cell1 === null || cell2 === null || cell1.getInput() === '' || cell2.getInput() === '') {
        nonConflict.push(uniqueKeys[i]);
        continue;
      }

      // Check for actual content conflicts
      if (cell1.getInput() !== cell2.getInput()) {
        conflicts.push(new MergeConflict(uniqueKeys[i], cell1, cell2));
      }
    }

    uniqueKeys = nonConflict;
    return conflicts;
  }

  /**
   * applies a map of resolutions into an accumulating mapping
   * @param resolutions the resolutions
   * @param grid the accumulated grid that will soon be returned
   */
  private applyResolutions(resolutions: Map<string, Cell>, grid: Map<string, Cell>): void {
    const resolution = [...resolutions.keys()];
    for (let i = 0; i < resolution.length; i += 1) {
      grid.set(resolution[i], resolutions.get(resolution[i])!);
    }
  }

  /**
   * starts accumulating non conflicting addresses to a new mapping
   * @param uniqueKeys the set of keys where the addresses are all non conflicting
   * @returns a map of all the non conflicting cells between the 2 spreadsheets
   */
  private noConflictMerge(uniqueKeys: string[], user: User): Map<string, Cell> {
    let grid: Map<string, Cell> = new Map<string, Cell>();
    let maxRow: number = 0;
    let maxCol: number = 0;

    // Process each unique key
    for (let i = 0; i < uniqueKeys.length; i += 1) {
      const cell1 = this.import1.get(uniqueKeys[i]);
      const cell2 = this.import2.get(uniqueKeys[i]);

      // Use import2's cell if import1's cell is null or has null value
      if (cell1?.getValue() === null && cell2 !== undefined) {
        cell1.updateContents(cell2.getInput(), user);
        grid.set(uniqueKeys[i], cell1);
      } else if (cell1 !== undefined) {
        grid.set(uniqueKeys[i], cell1);
      }

      // Update max dimensions
      const pair = uniqueKeys[i].match(/^([A-Za-z]+)(\d+)$/) || [];
      if (pair.length >= 3) {
        maxCol = Math.max(Utility.columnLetterToNumber(pair[1]), maxCol);
        maxRow = Math.max(parseInt(pair[2]), maxRow);
      }
    }

    // Fill empty cells in the grid
    for (let i = 1; i <= maxCol; i += 1) {
      for (let j = 1; j <= maxRow; j += 1) {
        const address = Utility.numberToColumnLetter(i) + j;
        if (!uniqueKeys.includes(address)) {
          grid.set(address, new Cell('', this.sheet1));
        }
      }
    }

    return grid;
  }
}
