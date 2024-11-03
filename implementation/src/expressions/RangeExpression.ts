import { IExpression } from "../interfaces/IExpression";

export class RangeExpression implements IExpression {
    private start: string;
    private end: string;

    public constructor(start: string, end: string) {
        this.start = start;
        this.end = end;
    }
    
    public evaluate(): number | string {
        throw new Error("Method not implemented.");
    }

    public display(): string {
        throw new Error("Method not implemented.");
    }
}