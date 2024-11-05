import { IError } from '../interfaces/IError';

export abstract class AError implements IError {
  public evaluate(): any {
    return null;
  }

  public display(): string {
    return 'Error';
  }
}
