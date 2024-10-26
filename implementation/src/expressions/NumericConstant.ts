import { IExpression } from "../interfaces/IExpression";

export class NumericConstant implements IExpression {
    private value: number;

    public evaluate(): any {
        return this.value;
    }

    public display(): string {
        return this.value + "";
    }
}