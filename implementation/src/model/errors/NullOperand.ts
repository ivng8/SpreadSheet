import { AError } from '../errors/AError';

export class NullOperand extends AError {
  public display(): string {
    return 'Missing operand';
  }
}
