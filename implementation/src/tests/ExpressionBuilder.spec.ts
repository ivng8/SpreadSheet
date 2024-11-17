/* eslint-disable no-undef */
import { NumericConstant } from 'model/expressions/NumericConstant';
import { Cell } from '../model/components/Cell';
import { Director } from '../model/Director';
import { InvalidExpression } from '../model/errors/InvalidExpression';
import { NullOperand } from '../model/errors/NullOperand';
import { WrongParentheses } from '../model/errors/WrongParentheses';
import { EmptyExpression } from '../model/expressions/EmptyExpression';
import { FormulaExpression } from '../model/expressions/FormulaExpression';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { StringConstant } from 'model/expressions/StringConstant';

describe('ExpressionBuilder', (): void => {
  let director: Director;
  let spreadsheet: SpreadSheet;
  let cell: Cell;

  beforeEach(() => {
    spreadsheet = new SpreadSheet(new Map <string, Cell>);
    director = new Director();
    cell = new Cell('', spreadsheet);
  });

  describe('Basic Expressions', () => {
    it('should handle empty expressions', (): void => {
      const expr = director.makeExpression('', spreadsheet, cell);
      expect(expr).toBeInstanceOf(EmptyExpression);
      expect(expr.evaluate()).toBeNull();
    });

    it('should parse numeric constants', (): void => {
      const expr = director.makeExpression('=42', spreadsheet, cell);
      expect(expr).toBeInstanceOf(NumericConstant);
      expect(expr.evaluate()).toBe(42);
    });

    it('should parse negative numbers', (): void => {
      const expr = director.makeExpression('=-42', spreadsheet, cell);
      expect(expr.evaluate()).toBe(-42);
    });

    it('should parse decimal numbers', (): void => {
      const expr = director.makeExpression('=3.14', spreadsheet, cell);
      expect(expr.evaluate()).toBe(3.14);
    });

    it('should parse string constants', (): void => {
      const expr = director.makeExpression('Hello', spreadsheet, cell);
      expect(expr).toBeInstanceOf(StringConstant);
      expect(expr.evaluate()).toBe('Hello');
    });
  });

  describe('Cell References', () => {
    it('should handle cell references', (): void => {
      const expr = director.makeExpression('=REF(A1)', spreadsheet, cell);
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
      const expr = director.makeExpression('=SUM(A1:B2)', spreadsheet, cell);
      expect(expr).toBeDefined();
    });
  });

  describe('Arithmetic Operations', () => {
    it('should evaluate to 5 when the expression is `2+3`', (): void => {
      const expr = director.makeExpression('=2+3', spreadsheet, cell);
      expect(expr).toBeInstanceOf(FormulaExpression);
      expect(expr.evaluate()).toBe(5);
    });

    it('should evaluate to 2 when the expression is `5-3`', (): void => {
      const expr = director.makeExpression('=5-3', spreadsheet, cell);
      expect(expr.evaluate()).toBe(2);
    });

    it('should evaluate to 10 when the expression is `2*5`', (): void => {
      const expr = director.makeExpression('=2*5', spreadsheet, cell);
      expect(expr.evaluate()).toBe(10);
    });

    it('should evaluate to 2 when the expression is `10/5`', (): void => {
      const expr = director.makeExpression('=10/5', spreadsheet, cell);
      expect(expr.evaluate()).toBe(2);
    });

    it('should evaluate to 16 when the expression is `2^4`', (): void => {
      const expr = director.makeExpression('=2^4', spreadsheet, cell);
      expect(expr.evaluate()).toBe(16);
    });

    it('should handle whitespace', (): void => {
      const expr = director.makeExpression('= 2 + 3 ', spreadsheet, cell);
      expect(expr.evaluate()).toBe(5);
    });
  });

  describe('String Operations', () => {
    it('should concatenate strings with plus', (): void => {
      const expr = director.makeExpression('=Hello+World', spreadsheet, cell);
      expect(expr).toBeInstanceOf(FormulaExpression);
      expect(expr.evaluate()).toBe('HelloWorld');
    });

    it('should handle invalid string operations', (): void => {
      const expr = director.makeExpression('=Hello*World', spreadsheet, cell);
      expect(expr).toBeInstanceOf(InvalidExpression);
    });
  });

  describe('Parentheses Handling', () => {
    it('should parse valid parentheses', (): void => {
      const expr = director.makeExpression('=(2+3)', spreadsheet, cell);
      expect(expr.evaluate()).toBe(5);
    });

    it('should detect unmatched opening parenthesis', (): void => {
      const expr = director.makeExpression('=(2+3', spreadsheet, cell);
      expect(expr).toBeInstanceOf(WrongParentheses);
    });

    it('should detect unmatched closing parenthesis', (): void => {
      const expr = director.makeExpression('=2+3)', spreadsheet, cell);
      expect(expr).toBeInstanceOf(WrongParentheses);
    });

    it('should handle nested parentheses', (): void => {
      const expr = director.makeExpression('=((2+3)*4)', spreadsheet, cell);
      expect(expr.evaluate()).toBe(20);
    });
  });

  describe('Error Handling', () => {
    it('should handle null left operands', (): void => {
      const expr = director.makeExpression('=+5', spreadsheet, cell);
      expect(expr).toBeInstanceOf(NullOperand);
    });

    it('should handle null right operands', (): void => {
      const expr = director.makeExpression('=1+', spreadsheet, cell);
      expect(expr).toBeInstanceOf(NullOperand);
    });

    it('should handle invalid expressions', (): void => {
      const expr = director.makeExpression('=2++3', spreadsheet, cell);
      expect(expr).toBeInstanceOf(NullOperand);
    });
  });

  describe('Complex Numeric Operations', () => {
    it('should handle multiple operations with correct precedence', (): void => {
      const expr = director.makeExpression('=2+3*4', spreadsheet, cell);
      expect(expr.evaluate()).toBe(14);
    });

    it('should handle multiple operations with parentheses changing precedence', (): void => {
      const expr = director.makeExpression('=(2+3)*4', spreadsheet, cell);
      expect(expr.evaluate()).toBe(20);
    });

    it('should handle deeply nested expressions', (): void => {
      const expr = director.makeExpression('=(2+(3*(4+1)))', spreadsheet, cell);
      expect(expr.evaluate()).toBe(17);
    });

    it('should handle multiple power operations', (): void => {
      const expr = director.makeExpression('=2^3^2', spreadsheet, cell);
      expect(expr.evaluate()).toBe(512);
    });

    it('should handle decimal arithmetic precisely', (): void => {
      const expr = director.makeExpression('=0.1+0.2', spreadsheet, cell);
      expect(expr.evaluate()).toBeCloseTo(0.3);
    });
  });

  describe('Edge Cases - Numbers', () => {
    it('should handle very large numbers', (): void => {
      const expr = director.makeExpression('=999999999*999999999', spreadsheet, cell);
      expect(expr.evaluate()).toBe(999999999 * 999999999);
    });

    it('should handle very small decimals', (): void => {
      const expr = director.makeExpression('=0.0000001+0.0000002', spreadsheet, cell);
      expect(expr.evaluate()).toBeCloseTo(0.0000003);
    });

    it('should handle division by zero', (): void => {
      const expr = director.makeExpression('=5/0', spreadsheet, cell);
      expect(expr.evaluate()).toBe(Infinity);
    });

    it('should handle negative zero', (): void => {
      const expr = director.makeExpression('=-0', spreadsheet, cell);
      expect(expr.evaluate()).toBe(0);
    });
  });

  describe('Edge Cases - Strings', () => {
    it('should handle empty string concatenation', (): void => {
      const expr = director.makeExpression('=empty+empty', spreadsheet, cell);
      expect(expr.evaluate()).toBe('emptyempty');
    });

    it('should handle mixed string and number concatenation', (): void => {
      const expr = director.makeExpression('=A+1', spreadsheet, cell);
      expect(expr.evaluate()).toBe('A1');
    });

    it('should handle very long strings', (): void => {
      const longStr = 'a'.repeat(1000);
      const expr = director.makeExpression(`${longStr}+${longStr}`, spreadsheet, cell);
      expect(expr.evaluate()).toBe(longStr + longStr);
    });
  });

  describe('Range Expression Edge Cases', () => {
    it('should handle single cell range', (): void => {
      const expr = director.makeExpression('=SUM(A1:A1)', spreadsheet, cell);
      expect(expr).toBeDefined();
    });

    it('should handle invalid range format', (): void => {
      const expr = director.makeExpression('SUM(A1:)', spreadsheet, cell);
      expect(expr.evaluate()).toBe('SUM(A1:)');
    });

    it('should handle unknown function names', (): void => {
      const expr = director.makeExpression('UNKNOWN(A1:B2)', spreadsheet, cell);
      expect(expr.evaluate()).toBe('UNKNOWN(A1:B2)');
    });
  });

  describe('Parentheses Edge Cases', () => {
    it('should handle multiple pairs of empty parentheses', (): void => {
      const expr = director.makeExpression('(())', spreadsheet, cell);
      expect(expr).toBeInstanceOf(WrongParentheses);
    });

    it('should handle deeply nested empty parentheses', (): void => {
      const expr = director.makeExpression('(((()))))', spreadsheet, cell);
      expect(expr).toBeInstanceOf(WrongParentheses);
    });

    it('should handle mixed valid and invalid parentheses', (): void => {
      const expr = director.makeExpression('(2+3)))', spreadsheet, cell);
      expect(expr).toBeInstanceOf(WrongParentheses);
    });
  });

  describe('Mixed Operations', () => {
    it('should handle complex numeric and string operations', (): void => {
      const expr = director.makeExpression('=(A1+B2)+(2*3)', spreadsheet, cell);
      expect(expr).toBeDefined();
    });

    it('should handle nested operations with cell references', (): void => {
      const expr = director.makeExpression('=(A1+2)*(B2+3)', spreadsheet, cell);
      expect(expr).toBeDefined();
    });

    it('should handle range operations with arithmetic', (): void => {
      const expr = director.makeExpression('=SUM(A1:B2)*2', spreadsheet, cell);
      expect(expr).toBeDefined();
    });
  });
});
