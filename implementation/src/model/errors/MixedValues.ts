import { AError } from './AError';

/**
 * represents an error that tries to operate with a string and a number
 */
export class MixedValues extends AError {

  public display(): string {
    return 'Mixed values';
  }
}
