import { IBuilder } from '../interfaces/IBuilder';
import { IExpression } from '../interfaces/IExpression';
import { EmptyExpression } from '../expressions/EmptyExpression';
import { NumericConstant } from '../expressions/NumericConstant';
import { StringConstant } from '../expressions/StringConstant';
import { CellReference } from '../expressions/CellReference';
import { RangeExpression } from '../expressions/RangeExpression';
import { WrongParentheses } from '../errors/WrongParentheses';
import { InvalidExpression } from '../errors/InvalidExpression';
import { FormulaExpression } from '../expressions/FormulaExpression';
import { Operator } from '../enums/Operator';
import { Director } from "../Director";

export class ExpressionBuilder implements IBuilder {
    private expression : IExpression;
    private context : string;
    
    constructor() {
        this.expression = new EmptyExpression();
        this.context = '';
    }

    public getProduct(): IExpression {
        let statement: IExpression = this.expression;
        this.expression = new EmptyExpression();
        this.context = '';
        return statement;
    }

    public reset(): void {
        this.expression = new EmptyExpression();
    }

    public setContext(text: string): void {
        this.context = text;
        this.makeExpression();
    }

    private makeExpression(): void {
        let parenCounter: number = 0;
        let skip_indicies: number[] = [];
        for (let i = 0; i < this.context.length; i += 1) {
            if (this.context.charAt(i) == '(') {
                parenCounter += 1;
            }
            if (parenCounter > 0) {
                skip_indicies.push(i);
            }
            if (this.context.charAt(i) == ')') {
                parenCounter -= 1;
                if (parenCounter >= 0) {
                    skip_indicies.push(i)
                } else {
                    this.expression = new WrongParentheses();
                    return;
                }
            }
        }
        if (parenCounter !== 0) {
            this.expression = new WrongParentheses();
            return;
        }
        for (let i = 0; i < this.context.length; i += 1) {
            if (skip_indicies.includes(i)) {
                continue;
            }
            switch (this.context.charAt(i)) {
                case '+': {
                    const left: IExpression = new Director().makeExpression(this.context.substring(0, i));
                    const right: IExpression = new Director().makeExpression(this.context.substring(i + 1, this.context.length));
                    if (left.evaluate() == null || right.evaluate() == null) {
                        this.expression = new InvalidExpression();
                        return;
                    }
                    this.expression = new FormulaExpression(Operator.PLUS, left, right);
                    return;
                }
                case '-': 
                case '*': 
                case '/': 
                case '^': {
                    const left: IExpression = new Director().makeExpression(this.context.substring(0, i));
                    const right: IExpression = new Director().makeExpression(this.context.substring(i + 1, this.context.length));
                    if (left.evaluate() == null || right.evaluate() == null || left.evaluate().isinstanceOf(String) 
                        || right.evaluate().isinstanceOf(String)) {
                        this.expression = new InvalidExpression();
                        return;
                    }
                    this.expression = new FormulaExpression(Operator.MINUS, left, right);
                    return;
                }
                default:
                    break;
            }
        }
        this.context = this.context.trim();
        if (/^-?\d*\.?\d+$/.test(this.context)) {
            this.expression = new NumericConstant(parseFloat(this.context));
        } else if (/^[A-Za-z]/.test(this.context)) {
            this.expression = new StringConstant(this.context);
        } else if (/^[A-Za-z]+\d+$/.test(this.context)) {
            this.expression = new CellReference(this.context);
        } else if (/^[A-Za-z]+\d+:[A-Za-z]+\d+$/.test(this.context)) {
            const [start, end] = this.context.split(':');
            this.expression = new RangeExpression(start, end);
        } else if (this.context == '') {
            this.expression = new EmptyExpression();
        } else {
            this.expression = new InvalidExpression();
        }
    }
}