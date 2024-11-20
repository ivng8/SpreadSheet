import { CellBuilder } from "model/builders/CellBuilder";
import { Cell } from "model/components/Cell";
import { SpreadSheet } from "model/components/SpreadSheet";

describe('CellBuilder', (): void => {
  let builder: CellBuilder;
  let spreadsheet: SpreadSheet;

  beforeEach(() => {
    spreadsheet = new SpreadSheet(new Map<string, Cell>());
    builder = new CellBuilder(spreadsheet);
  });

  describe('Constructor and Basic Operations', () => {
    it('should initialize with empty input', (): void => {
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('');
    });

    it('should store reference to spreadsheet', (): void => {
      const cell = builder.getProduct();
      expect(cell['sheet']).toBe(spreadsheet);
    });

    it('should create independent cell instances', (): void => {
      const cell1 = builder.getProduct();
      const cell2 = builder.getProduct();
      expect(cell1).not.toBe(cell2);
    });

    it('should maintain spreadsheet reference across cells', (): void => {
      const cell1 = builder.getProduct();
      const cell2 = builder.getProduct();
      expect(cell1['sheet']).toBe(cell2['sheet']);
    });
  });

  describe('Cell Content Management', () => {
    it('should create cell with numeric input', (): void => {
      builder.setContext(['42']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('42');
      expect(cell.getValue()).toBe(42);
    });

    it('should create cell with string input', (): void => {
      builder.setContext(['Hello']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('Hello');
      expect(cell.getValue()).toBe('Hello');
    });

    it('should create cell with formula input', (): void => {
      builder.setContext(['=2+3']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('=2+3');
      expect(cell.getValue()).toBe(5);
    });

    it('should handle decimal numbers', (): void => {
      builder.setContext(['3.14159']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('3.14159');
      expect(cell.getValue()).toBe(3.14159);
    });

    it('should handle negative numbers', (): void => {
      builder.setContext(['-42']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('-42');
      expect(cell.getValue()).toBe(-42);
    });
  });

  describe('Formula Handling', () => {
    it('should handle basic arithmetic formulas', (): void => {
      builder.setContext(['=10+5*2']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('=10+5*2');
      expect(cell.getValue()).toBe(20);
    });

    it('should handle nested formulas', (): void => {
      builder.setContext(['=(2+3)*(4+5)']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('=(2+3)*(4+5)');
      expect(cell.getValue()).toBe(45);
    });

    it('should handle cell references in formulas', (): void => {
      const cellA1 = new Cell('42', spreadsheet);
      spreadsheet = new SpreadSheet(new Map([['A1', cellA1]]));
      builder = new CellBuilder(spreadsheet);
      builder.setContext(['=REF(A1)']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('42');
      expect(cell.getValue()).toBe(42);
    });

    it('should handle complex formulas with multiple operations', (): void => {
      builder.setContext(['=2^3+4*5-6/2']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('=2^3+4*5-6/2');
      expect(cell.getValue()).toBe(25);
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle invalid formulas gracefully', (): void => {
      builder.setContext(['=2++3']);
      const cell = builder.getProduct();
      expect(cell.getValue()).toBeNull();
    });

    it('should handle division by zero', (): void => {
      builder.setContext(['=1/0']);
      const cell = builder.getProduct();
      expect(cell.getValue()).toBe(Infinity);
    });

    it('should handle undefined cell references', (): void => {
      builder.setContext(['=Z99']);
      const cell = builder.getProduct();
      expect(() => cell.getValue()).toThrow();
    });

    it('should handle circular references', (): void => {
      const cellA1 = new Cell('=REF(B1)', spreadsheet);
      const cellB1 = new Cell('=REF(A1)', spreadsheet);
      spreadsheet = new SpreadSheet(new Map([
        ['A1', cellA1],
        ['B1', cellB1]
      ]));
      expect(() => cellA1.getValue()).toThrow();
    });

    it('should handle malformed input', (): void => {
      builder.setContext(['==2+3']);
      const cell = builder.getProduct();
      expect(cell.getValue()).toBe('==2+3');
    });
  });

  describe('Special Cases', () => {
    it('should handle empty string input', (): void => {
      builder.setContext(['']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('');
      expect(cell.getValue()).toBeNull();
    });

    it('should handle whitespace input', (): void => {
      builder.setContext(['   ']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('   ');
      expect(cell.getValue()).toBe('   ');
    });

    it('should handle special characters', (): void => {
      builder.setContext(['!@#$%^&*()']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('!@#$%^&*()');
      expect(cell.getValue()).toBe('!@#$%^&*()');
    });

    it('should handle very long inputs', (): void => {
      const longInput = 'x'.repeat(1000);
      builder.setContext([longInput]);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe(longInput);
      expect(cell.getValue()).toBe(longInput);
    });
  });

  describe('Reset Functionality', () => {
    it('should clear cell input on reset', (): void => {
      builder.setContext(['42']);
      builder.reset();
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('');
    });

    it('should allow new context after reset', (): void => {
      builder.setContext(['42']);
      builder.reset();
      builder.setContext(['43']);
      const cell = builder.getProduct();
      expect(cell.getInput()).toBe('43');
    });

    it('should maintain spreadsheet reference after reset', (): void => {
      builder.setContext(['42']);
      builder.reset();
      const cell = builder.getProduct();
      expect(cell['sheet']).toBe(spreadsheet);
    });
  });

  describe('Range Functions', () => {
    beforeEach(() => {
      // Setup a grid of cells with values
      const cells = new Map<string, Cell>();
      cells.set('A1', new Cell('1', spreadsheet));
      cells.set('A2', new Cell('2', spreadsheet));
      cells.set('A3', new Cell('3', spreadsheet));
      cells.set('A4', new Cell('4', spreadsheet));
      spreadsheet = new SpreadSheet(cells);
      builder = new CellBuilder(spreadsheet);
    });

    it('should handle SUM range function', (): void => {
      builder.setContext(['=SUM(A1:A4)']);
      const cell = builder.getProduct();
      expect(cell.getValue()).toBe(10);
    });

    it('should handle AVG range function', (): void => {
      builder.setContext(['=AVG(A1:A4)']);
      const cell = builder.getProduct();
      expect(cell.getValue()).toBe(2.5);
    });

    it('should handle MIN range function', (): void => {
      builder.setContext(['=MIN(A1:A4)']);
      const cell = builder.getProduct();
      expect(cell.getValue()).toBe(1);
    });

    it('should handle MAX range function', (): void => {
      builder.setContext(['=MAX(A1:A4)']);
      const cell = builder.getProduct();
      expect(cell.getValue()).toBe(4);
    });

    it('should handle invalid range references', (): void => {
      builder.setContext(['=SUM(Z1:Z9)']);
      const cell = builder.getProduct();
      expect(cell.getValue()).toBeNull();
    });
  });
});