import { AError } from '../errors/AError';

/**
 * error that describes null or invalid reference(s) used
 * by either references or aggregate functions
 */
export class InvalidRange extends AError {
  
  public evaluate(): string {
    return 'Invalid Range';
  }
}
