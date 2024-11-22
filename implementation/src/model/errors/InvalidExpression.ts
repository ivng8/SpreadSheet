import { AError } from '../errors/AError';

/**
 * error that describes an invalid expression
 */
export class InvalidExpression extends AError {

  public evaluate(): string {
    return 'Invalid Expression';
  }
}
