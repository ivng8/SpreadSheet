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
        let parenCounter: number = 0;
        for (let i = 0; i < this.context.length; i += 1) {

        }
        this.context = '';
        return this.expression;
    }

    public reset(): void {
        this.expression = new EmptyExpression();
    }

    public setContext(text: string): void {
        this.context = text;
        this.detectErrors();
    }

    private detectErrors(): void {
        if (false) {
            new Conflict('Invalid Expression');
        }
    }
}