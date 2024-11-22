import { AError } from '../errors/AError';

/**
 * error that describes a missing operand
 */
export class NullOperand extends AError {
<<<<<<< HEAD

=======
  
>>>>>>> 7555dd6b3e0236a46975d9764d95ffabc04fa126
  public evaluate(): string {
    return 'Missing operand';
  }
}
