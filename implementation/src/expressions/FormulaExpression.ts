import { IExpression } from "../interfaces/IExpression";
import { Operator } from "../enums/Operator";
import { NullOperand } from "../errors/NullOperand";

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
        if (this.left.evaluate() == null || this.right.evaluate() == null) {
            return new NullOperand();
        }

        switch (this.operator) {
            case Operator.DIV:
                return this.left.evaluate() / this.right.evaluate();
            case Operator.MINUS:
                return this.left.evaluate() - this.right.evaluate();
            case Operator.PLUS:
                return this.left.evaluate() + this.right.evaluate();
            case Operator.MULT:
                return this.left.evaluate() * this.right.evaluate();
            case Operator.POWER:
                return this.left.evaluate() ** this.right.evaluate();
            default:
                break;
        }
    }

    public display(): string {
        if (this.evaluate().instanceOf(NullOperand)) {
            return this.evaluate().display();
        } else {
            return this.evaluate() + "";
        }
    }
}