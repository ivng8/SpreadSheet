import { IExpression } from "../interfaces/IExpression";

export class CellReference implements IExpression {
    private reference: string;

    constructor(reference: string) {
        this.reference = reference;
    }

    public evaluate(): number | string {
        return 
    }

    public display(): string {
        return this.evaluate + '';
    }
}
