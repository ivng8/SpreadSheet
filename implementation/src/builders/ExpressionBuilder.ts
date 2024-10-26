import { IBuilder } from '../interfaces/IBuilder';
import { IExpression } from '../interfaces/IExpression';
import { EmptyExpression } from '../expressions/EmptyExpression';
import { WrongParentheses } from '../errors/WrongParentheses';

export class ExpressionBuilder implements IBuilder {
    private expression : IExpression;
    private context : string;
    
    constructor() {
        this.expression = new EmptyExpression();
        this.context = '';
    }

    public getProduct(): IExpression {
        let parenCounter: number = 0;
        let recordPairs: number[] = [];
        for (let i = 0; i < this.context.length; i += 1) {
            if (this.context.charAt(i) == '(') {
                parenCounter += 1;
                recordPairs.push(i);
            }
            if (this.context.charAt(i) == ')') {
                parenCounter -= 1;
                if (parenCounter >= 0) {
                    recordPairs.push(i)
                } else {
                    return new WrongParentheses();
                }
            }
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