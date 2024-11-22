import { IError } from '../interfaces/IError';

/**
 * astract class of an error where it returns null and displays
 * error which is to be overridden by its specific error
 */
export abstract class AError implements IError {

<<<<<<< HEAD
  public evaluate(): any {
=======
  public evaluate(): string {
>>>>>>> 7555dd6b3e0236a46975d9764d95ffabc04fa126
    return 'Error';
  }
}
