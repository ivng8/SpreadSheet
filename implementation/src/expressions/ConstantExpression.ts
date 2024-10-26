import { IExpression } from "../interfaces/IExpression";

export class ConstantExpression implements IExpression {
    evaluate() {
        throw new Error("Method not implemented.");
    }

}