import { AError } from '../errors/AError';

/**
 * error that describes dealing with 
 */
export class IllegalOperands extends AError {

  public display(): string {
    return 'Illegal operands';
  }
}
