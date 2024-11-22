import { AError } from '../errors/AError';

/**
 * error that describes dealing with
 */
export class IllegalOperands extends AError {
  public evaluate(): string {
    return 'Illegal operands';
  }
}
