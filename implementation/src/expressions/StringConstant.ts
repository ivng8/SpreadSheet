import { IExpression } from "../interfaces/IExpression";

export class StringConstant implements IExpression {
    
    evaluate(): any {
        throw new Error("Method not implemented.");
    }

}