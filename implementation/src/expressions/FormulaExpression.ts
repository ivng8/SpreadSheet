import { IExpression } from "../interfaces/IExpression";
import { Operator } from "../enums/Operator";

export class FormulaExpression implements IExpression {
    private operator: Operator;
    private left: IExpression;
    private right: IExpression;

    public constructor(operator: Operator, left: IExpression, right: IExpression) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    public evaluate(): any {
        
    }
}