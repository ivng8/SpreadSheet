import { IExpression } from '../interfaces/IExpression';

/**
 * represents a blank cell
 */
export class EmptyExpression implements IExpression {
  public evaluate(): unknown {
    return null;
  }
}
