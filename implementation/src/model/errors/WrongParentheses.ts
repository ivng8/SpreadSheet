import { AError } from '../errors/AError';

/**
 * describes an error of misformatted parentheses
 */
export class WrongParentheses extends AError {
  public display(): string {
    return 'Invalid use of parentheses';
  }
}
