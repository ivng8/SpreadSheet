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
import { NullOperand } from '../errors/NullOperand';

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

    public setContext(text: string[]): void {
        this.context = text[0].replaceAll(' ', '');
        this.makeExpression();
    }

    private makeExpression(): void {
        if (!this.context) {
            this.expression = new EmptyExpression();
            return;
        }
        this.checkParentheses();
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

    private checkParentheses(): void {
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
        this.expression = this.checkOperators(skip_indicies);
    }

    private checkOperators(skip_indicies: number[]): IExpression {
        for (let i = 0; i < this.context.length; i += 1) {
            if (skip_indicies.includes(i)) {
                continue;
            }
            let char : string = this.context.charAt(i);
            if (char === '+' || char === '-') {
                return this.generalFormula(char, i);
            } else  if (char === '*' || char === '/') {
                return this.generalFormula(char, i);
            } else if (char === '^') {
                return this.generalFormula(char, i);
            }
        }
        return this.goDownLevel(skip_indicies);
    }

    private generalFormula(sign: string, i: number): IExpression {
        const left: IExpression = new Director().makeExpression(this.context.substring(0, i));
        const right: IExpression = new Director().makeExpression(this.context.substring(i + 1, this.context.length));
        if (left.evaluate() == null || right.evaluate() == null) {
            return new NullOperand();
        }
        let words : boolean = this.stringCompute(left, right);
        let oper : Operator;
        switch (sign) {
            case '+':
                oper = Operator.PLUS;
                break;
            case '-':
                if (words) {
                    return new InvalidExpression();
                }
                oper = Operator.MINUS;
                break;
            case '/':
                if (words) {
                    return new InvalidExpression();
                }
                oper = Operator.DIV;
                break;
            case '*':
                if (words) {
                    return new InvalidExpression();
                }
                oper = Operator.MULT;
                break;
            case '^':
                if (words) {
                    return new InvalidExpression();
                }
                oper = Operator.POWER;
                break;
            default:
                throw Error('Illegal Operator');
        }
        return new FormulaExpression(oper, left, right);
    }

    private stringCompute(left: IExpression, right: IExpression): boolean {
        return left.evaluate() instanceof String || right.evaluate() instanceof String;
    }

    private goDownLevel(skip_indicies: number[]): IExpression {
        return new Director().makeExpression(this.context.substring(1, this.context.length - 1));
    }
}