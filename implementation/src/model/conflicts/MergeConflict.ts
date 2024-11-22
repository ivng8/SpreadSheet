import { Cell } from 'model/components/Cell';

/**
 * characterizes a conflict between two cells
 */
export class MergeConflict {
  private cellId: string;
  private sheet1: Cell;
  private sheet2: Cell;

  /**
   * constructor of a merge conflict
   * @param cellId the address of the cell
   * @param sheet1 the cell from the origin sheet
   * @param sheet2 the cell from the imported sheet
   */
  public constructor(cellId: string, sheet1: Cell, sheet2: Cell) {
    this.cellId = cellId;
    this.sheet1 = sheet1;
    this.sheet2 = sheet2;
  }

  /**
   * gets the address of the cell
   * @returns the string address of the cell
   */
  public getCell(): string {
    return this.cellId;
  }

  /**
   * determines the wanted cell based on a boolean input
   * true being the original cell and false being the imported cell
   * @param value the boolean
   * @returns the cell instance wanted by the user
   */
  public use(value: boolean): Cell {
    if (value) {
      return this.sheet1;
    } else {
      return this.sheet2;
    }
  }
}
