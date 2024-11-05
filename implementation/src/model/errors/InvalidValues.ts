import { AError } from '../errors/AError';

export class InvalidValues extends AError {
  public display(): string {
    return 'Mixed values';
  }
}
