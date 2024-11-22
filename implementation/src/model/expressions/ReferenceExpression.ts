import { IExpression } from '../interfaces/IExpression';
import { Cell } from '../components/Cell';
import { SpreadSheet } from '../components/SpreadSheet';
import { InvalidExpression } from '../errors/InvalidExpression';

/**
 * Represents a reference to another cell (e.g., "=A1")
 */
export class ReferenceExpression implements IExpression {
  private referencedCell: Cell;
  private currentCell: Cell;
  private sheet: SpreadSheet;

  /**
   * Creates a reference expression
   * @param address The address of the referenced cell (e.g., "A1")
   * @param sheet The spreadsheet containing the cells
   * @param currentCell The cell containing this reference
   */
  constructor(address: string, sheet: SpreadSheet, currentCell: Cell) {
    this.sheet = sheet;
    this.currentCell = currentCell;
    this.referencedCell = this.sheet.getCell(address);
    // Set up the dependency relationship
    this.currentCell.addDependency(this.referencedCell);
  }

  /**
   * Evaluates the referenced cell's value
   * @returns The value of the referenced cell
   */
  public evaluate(): any {
    // Check if referenced cell has an error
    if (this.referencedCell.hasError()) {
      this.currentCell.catchErrors(new InvalidExpression());
      return null;
    }

    return this.referencedCell.getValue();
  }
}
