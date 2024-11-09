import { IError } from '../interfaces/IError';

/**
 * astract class of an error where it returns null and displays
 * error which is to be overridden by its specific error
 */
export abstract class AError implements IError {

  public evaluate(): any {
    return null;
  }

  public display(): string {
    return 'Error';
  }
}
