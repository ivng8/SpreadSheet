import { AError } from '../errors/AError';

/**
 * error that describes a missing operand
 */
export class NullOperand extends AError {

  public evaluate(): string {
    return 'Missing operand';
  }
}
