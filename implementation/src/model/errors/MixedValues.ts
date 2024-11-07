import { AError } from './AError';

export class MixedValues extends AError {
  public display(): string {
    return 'Mixed values';
  }
}
