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
  private address: string;
  private visited: Set<string> = new Set();

  /**
   * Creates a reference expression
   * @param address The address of the referenced cell (e.g., "A1")
   * @param sheet The spreadsheet containing the cells
   * @param currentCell The cell containing this reference
   */
  constructor(address: string, sheet: SpreadSheet, currentCell: Cell) {
    this.address = address;
    this.sheet = sheet;
    this.currentCell = currentCell;
    this.referencedCell = this.sheet.getCell(address);

    // Set up the dependency relationship
    this.currentCell.addDependency(this.referencedCell);
  }

  /**
   * Evaluates the referenced cell's value
   * @returns The value of the referenced cell
   * @throws CircularError if a circular reference is detected
   */
  public evaluate(): any {
    // Check for circular references
    if (this.visited.has(this.address)) {
      this.currentCell.catchErrors(new InvalidExpression());
      throw new InvalidExpression();
    }
    try {
      this.visited.add(this.address);
      const value = this.referencedCell.getValue();
      this.visited.delete(this.address);
      return value;
    } catch (error) {
      this.visited.delete(this.address);
      if (error instanceof InvalidExpression) {
        this.currentCell.catchErrors(error);
      }
      throw error;
    }
  }
}