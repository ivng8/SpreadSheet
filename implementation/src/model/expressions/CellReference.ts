import { IExpression } from '../interfaces/IExpression';
import { SpreadSheet } from 'model/components/SpreadSheet';

/**
 * represents a reference to another cell
 */
export class CellReference implements IExpression {
  private reference: string;
  private sheet: SpreadSheet;

  /**
   * constructor for a CellReference
   * @param reference the identifier of the cell it is referencing
   * @param sheet the spreadsheet the reference belongs to
   */
  public constructor(reference: string, sheet: SpreadSheet) {
    this.reference = reference;
    this.sheet = sheet;
  }
  
  public evaluate(): number | string {
    return this.sheet.getCell(this.reference).getValue();
  }

  public display(): string {
    return this.evaluate + '';
  }
}
