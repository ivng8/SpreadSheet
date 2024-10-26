import { IExpression } from "../interfaces/IExpression";

export class StringConstant implements IExpression {
    private value: string;
    
    public evaluate(): any {
        return this.value;
    }

    public display(): string {
        return this.value;
    }
}