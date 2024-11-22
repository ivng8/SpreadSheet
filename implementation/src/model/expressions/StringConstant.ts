import { IExpression } from '../interfaces/IExpression';

/**
 * represents a string value in a ce;;
 */
export class StringConstant implements IExpression {
  private value: string;

  /**
   * constructor of a StringConstant
   * @param value the string
   */
  public constructor(value: string) {
    this.value = value;
  }

  public evaluate(): string {
    return this.value;
  }
}
