/* eslint-disable no-undef */
import { Cell } from '../model/components/Cell';
import { Director } from '../model/Director';
import { InvalidExpression } from '../model/errors/InvalidExpression';
import { NullOperand } from '../model/errors/NullOperand';
import { WrongParentheses } from '../model/errors/WrongParentheses';
import { EmptyExpression } from '../model/expressions/EmptyExpression';
import { FormulaExpression } from '../model/expressions/FormulaExpression';
import { SpreadSheet } from '../model/SpreadSheet';

describe('ExpressionBuilder', (): void => {
  let director: Director;
  let spreadsheet: SpreadSheet;
  let cell: Cell;

  beforeEach(() => {
    spreadsheet = new SpreadSheet(new Map <string, Cell>);
    director = new Director();
    cell = new Cell('A1', '', spreadsheet);
  });

  describe('Basic Expressions', () => {
    it('should handle empty expressions', (): void => {
      const expr = director.makeExpression('', spreadsheet, cell);
      expect(expr).toBeInstanceOf(EmptyExpression);
      expect(expr.evaluate()).toBeNull();
    });

    it('should parse numeric constants', (): void => {
      const expr = director.makeExpression('42', spreadsheet, cell);
      expect(expr.evaluate()).toBe(42);
    });

    it('should parse negative numbers', (): void => {
      const expr = director.makeExpression('-42', spreadsheet, cell);
      expect(expr.evaluate()).toBe(-42);
    });

    it('should parse decimal numbers', (): void => {
      const expr = director.makeExpression('3.14', spreadsheet, cell);
      expect(expr.evaluate()).toBe(3.14);
    });

    it('should parse string constants', (): void => {
      const expr = director.makeExpression('Hello', spreadsheet, cell);
      expect(expr.evaluate()).toBe('Hello');
    });
  });

  describe('Cell References', () => {
    it('should handle cell references', (): void => {
      const expr = director.makeExpression('A1', spreadsheet, cell);
      // Actual value will depend on spreadsheet impl
      expect(expr).toBeDefined();
    });

    it('should handle invalid cell references', (): void => {
      const expr = director.makeExpression('A', spreadsheet, cell);
      expect(expr.evaluate()).toBe('A');
    });
  });

  describe('Range Expressions', () => {
    it('should parse valid range expressions', (): void => {
      const expr = director.makeExpression('SUM(A1:B2)', spreadsheet, cell);
      expect(expr).toBeDefined();
    });
  });

  describe('Arithmetic Operations', () => {
    it('should evaluate to 5 when the expression is `2+3`', (): void => {
      const expr = director.makeExpression('2+3', spreadsheet, cell);
      expect(expr).toBeInstanceOf(FormulaExpression);
      expect(expr.evaluate()).toBe(5);
    });

    it('should evaluate to 2 when the expression is `5-3`', (): void => {
      const expr = director.makeExpression('5-3', spreadsheet, cell);
      expect(expr.evaluate()).toBe(2);
    });

    it('should evaluate to 10 when the expression is `2*5`', (): void => {
      const expr = director.makeExpression('2*5', spreadsheet, cell);
      expect(expr.evaluate()).toBe(10);
    });

    it('should evaluate to 2 when the expression is `10/5`', (): void => {
      const expr = director.makeExpression('10/5', spreadsheet, cell);
      expect(expr.evaluate()).toBe(2);
    });

    it('should evaluate to 16 when the expression is `2^4`', (): void => {
      const expr = director.makeExpression('2^4', spreadsheet, cell);
      expect(expr.evaluate()).toBe(16);
    });

    it('should handle whitespace', (): void => {
      const expr = director.makeExpression(' 2 + 3 ', spreadsheet, cell);
      expect(expr.evaluate()).toBe(5);
    });
  });

  describe('String Operations', () => {
    it('should concatenate strings with plus', (): void => {
      const expr = director.makeExpression('Hello+World', spreadsheet, cell);
      expect(expr).toBeInstanceOf(FormulaExpression);
      expect(expr.evaluate()).toBe('HelloWorld');
    });

    it('should handle invalid string operations', (): void => {
      const expr = director.makeExpression('Hello*World', spreadsheet, cell);
      expect(expr).toBeInstanceOf(InvalidExpression);
    });
  });

  describe('Parentheses Handling', () => {
    it('should parse valid parentheses', (): void => {
      const expr = director.makeExpression('(2+3)', spreadsheet, cell);
      expect(expr.evaluate()).toBe(5);
    });

    it('should detect unmatched opening parenthesis', (): void => {
      const expr = director.makeExpression('(2+3', spreadsheet, cell);
      expect(expr).toBeInstanceOf(WrongParentheses);
    });

    it('should detect unmatched closing parenthesis', (): void => {
      const expr = director.makeExpression('2+3)', spreadsheet, cell);
      expect(expr).toBeInstanceOf(WrongParentheses);
    });

    it('should handle nested parentheses', (): void => {
      const expr = director.makeExpression('((2+3)*4)', spreadsheet, cell);
      expect(expr.evaluate()).toBe(20);
    });
  });

  describe('Error Handling', () => {
    it('should handle null left operands', (): void => {
      const expr = director.makeExpression('+5', spreadsheet, cell);
      expect(expr).toBeInstanceOf(NullOperand);
    });

    it('should handle null right operands', (): void => {
      const expr = director.makeExpression('1+', spreadsheet, cell);
      expect(expr).toBeInstanceOf(NullOperand);
    });

    it('should handle invalid expressions', (): void => {
      const expr = director.makeExpression('2++3', spreadsheet, cell);
      expect(expr).toBeInstanceOf(NullOperand);
    });
  });
});
