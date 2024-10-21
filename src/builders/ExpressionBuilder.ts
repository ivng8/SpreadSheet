import { IBuilder } from '../interfaces/IBuilder';
import { StringConstant } from '../expressions/StringConstant';
import { IExpression } from '../interfaces/IExpression';
import { EmptyExpression } from '../expressions/EmptyExpression';

export class ExpressionBuilder implements IBuilder {
    private expression : IExpression;
    private context : string;
    
    constructor() {
        this.expression = new EmptyExpression();
        this.context = '';
    }

    public getProduct(): IExpression {
        
        this.context = '';
        return this.expression;
    }

    public reset(): void {
        this.expression = new EmptyExpression();
    }

    public setContext(text: string): void {
        this.context = text;
    }
}