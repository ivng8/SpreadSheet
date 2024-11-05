import { IExpression } from '../interfaces/IExpression';

export class ConstantExpression implements IExpression {
  public evaluate() {
    throw new Error('Method not implemented.');
  }

  public display(): string {
    throw new Error('Method not implemented.');
  }
}
