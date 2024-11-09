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
import { Director } from '../Director';
import { NullOperand } from '../errors/NullOperand';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { Cell } from 'model/components/Cell';

/**
 * Construsts an expression inspired by the Composite pattern where
 * a parsed expression gets separated into a tree-like structure
 */
export class ExpressionBuilder implements IBuilder {
  private expression: IExpression;
  private context: string;
  private sheet: SpreadSheet;
  private cell: Cell;

  /**
   * constructor for the expression builder
   * @param reference the spreadsheet that the expression potentially references
   * @param cell the cell that the expression belongs to
   */
  constructor(reference: SpreadSheet, cell: Cell) {
    this.expression = new EmptyExpression();
    this.context = '';
    this.cell = cell;
    this.sheet = reference;
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
    this.context = text[0].replace(/\s+/g, '');
    this.makeExpression();
  }

  /**
   * begins the process of mutating the expression by parsing the context
   * @returns void
   */
  private makeExpression(): void {
    if (!this.context) {
      this.expression = new EmptyExpression();
      return;
    }
    this.checkParentheses();
    this.simpleExpression();
  }

  /**
   * uses regex patterns to find expressions past PEMDAS operators
   */
  private simpleExpression(): void {
    if (/^-?\d*\.?\d+$/.test(this.context)) {
      this.expression = new NumericConstant(parseFloat(this.context));
    } else if (/^[A-Za-z]+$/.test(this.context)) {
      this.expression = new StringConstant(this.context);
    } else if (/^[A-Za-z]+\d+$/.test(this.context)) {
      this.expression = new CellReference(this.context, this.sheet);
    } else if (/^([A-Z]+)\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/.test(this.context)) {
      const [func, start, end] = this.context.match(/^([A-Z]+)\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/)!;
      this.expression = new RangeExpression(func, start, end, this.sheet, this.cell);
    }
  }

  /**
   * checks that parentheses are written correctly and determines what parts
   * of the expression are contained by parentheses
   * @returns void
   */
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
          skip_indicies.push(i);
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
    this.checkOperators(skip_indicies);
  }

  /**
   * looks for operators following PEMDAS precedence that are outside of 
   * parentheses in order to create a tree-structure that will evaluate correctly
   * @param skip_indicies the indicies of characters that are encapsulated in parentheses
   * @returns void
   */
  private checkOperators(skip_indicies: number[]): void {
    for (let i = 0; i < this.context.length; i += 1) {
      if (skip_indicies.includes(i)) {
        continue;
      }
      let char: string = this.context.charAt(i);
      if (char === '+' || char === '-') {
        this.expression = this.generalFormula(char, i);
        return;
      } else if (char === '*' || char === '/') {
        this.expression = this.generalFormula(char, i);
        return;
      } else if (char === '^') {
        this.expression = this.generalFormula(char, i);
        return;
      }
    }
    this.goDownLevel();
  }

  /**
   * creates a FormulaExpression given a sign and the index of its location
   * @param sign the character of the operator
   * @param i the index of the operator
   * @returns either a FormulaExpression or an Error
   */
  private generalFormula(sign: string, i: number): IExpression {
    const left: IExpression = new Director().makeExpression(
      this.context.substring(0, i),
      this.sheet,
      this.cell
    );
    const right: IExpression = new Director().makeExpression(
      this.context.substring(i + 1, this.context.length),
      this.sheet,
      this.cell
    );
    if (left.evaluate() == null || right.evaluate() == null) {
      return new NullOperand();
    }
    let words: boolean = this.stringCompute(left, right);
    let oper: Operator;
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
    return new FormulaExpression(oper, left, right, this.cell);
  }

  /**
   * returns true if either of the given expressions evaluate to a string
   * @param left the first expression
   * @param right the second expression
   * @returns a boolean
   */
  private stringCompute(left: IExpression, right: IExpression): boolean {
    return typeof left.evaluate() === 'string' || typeof right.evaluate() === 'string';
  }

  /**
   * downsizes the parsing of an expression by entering the parentheses
   */
  private goDownLevel(): void {
    if (this.context.charAt(0) === '(')
      this.expression = new Director().makeExpression(
        this.context.substring(1, this.context.length - 1),
        this.sheet,
        this.cell
      );
  }
}
