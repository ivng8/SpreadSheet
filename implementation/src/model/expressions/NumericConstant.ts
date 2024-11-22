import { IExpression } from '../interfaces/IExpression';

/**
 * represents a plain number
 */
export class NumericConstant implements IExpression {
  private value: number;

  /**
   * constructor for a NumericConstant
   * @param value the number
   */
  public constructor(value: number) {
    this.value = value;
  }

  public evaluate(): number {
    return this.value;
  }
}
