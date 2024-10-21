import { IBuilder } from '../interfaces/IBuilder';
import { StringConstant } from '../expressions/StringConstant';
import { IExpression } from '../interfaces/IExpression';

export class ExpressionBuilder implements IBuilder {
    private expression : IExpression;
    
    constructor() {
        this.expression = new StringConstant();
    }

    create() {
        throw new Error('Method not implemented.');
    }

    reset(): void {
        throw new Error('Method not implemented.');
    }

    setContext(text: string): void {
        throw new Error('Method not implemented.');
    }

}