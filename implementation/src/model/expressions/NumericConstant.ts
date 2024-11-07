import { IExpression } from '../interfaces/IExpression';

export class NumericConstant implements IExpression {
  private value: number;

  public constructor(value: number) {
    this.value = value;
  }

  public evaluate(): number {
    return this.value;
  }

  public display(): string {
    return this.value + '';
  }
}