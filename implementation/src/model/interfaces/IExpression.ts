/**
 * interface that describes an expression which is inside of a cell
 */
export interface IExpression {

  /**
   * returns the computed value of the expression which can be a number or string
   */
  evaluate(): any;

  /**
   * returns the computed value of the expression as a string
   */
  display(): string;
}
