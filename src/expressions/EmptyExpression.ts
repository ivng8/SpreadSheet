import { IExpression } from "../interfaces/IExpression";

export class EmptyExpression implements IExpression {
    
    public evaluate(): any {
        return null;
    }

}