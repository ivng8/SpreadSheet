import { IExpression } from "../interfaces/IExpression";

export class CellReference implements IExpression {
    private reference: string;

    constructor(reference: string) {
        this.reference = reference;
    }

    public evaluate(): number {
        
    }
}