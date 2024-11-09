import { AError } from '../errors/AError';

/**
 * error that describes a missing operand
 */
export class NullOperand extends AError {
  
  public display(): string {
    return 'Missing operand';
  }
}
