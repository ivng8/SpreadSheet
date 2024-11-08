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

  describe('Constructor', () => {
    it('should initialize with empty address and input', (): void => {
    const cell = builder.getProduct();
    expect(cell.getAddress()).toBe('');
    expect(cell.getInput()).toBe('');
    });

    it('should store reference to spreadsheet', (): void => {
    const cell = builder.getProduct();
    expect(cell['sheet']).toBe(spreadsheet); 
    });
  });

  describe('setContext', () => {
    it('should set address and input from string array', (): void => {
    builder.setContext(['A1', '42']);
    const cell = builder.getProduct();
    expect(cell.getAddress()).toBe('A1');
    expect(cell.getInput()).toBe('42');
    });

    it('should handle empty input string', (): void => {
    builder.setContext(['B2', '']);
    const cell = builder.getProduct();
    expect(cell.getAddress()).toBe('B2');
    expect(cell.getInput()).toBe('');
    });

    it('should handle cell references as input', (): void => {
    builder.setContext(['C3', 'A1']);
    const cell = builder.getProduct();
    expect(cell.getAddress()).toBe('C3');
    expect(cell.getInput()).toBe('A1');
    });

    it('should handle formulas as input', (): void => {
    builder.setContext(['D4', '=A1+B2']);
    const cell = builder.getProduct();
    expect(cell.getAddress()).toBe('D4');
    expect(cell.getInput()).toBe('=A1+B2');
    });
  });

  describe('getProduct', () => {
    it('should create new Cell instance', (): void => {
    const cell = builder.getProduct();
    expect(cell).toBeInstanceOf(Cell);
    });

    it('should reset address after getting product', (): void => {
    builder.setContext(['A1', '42']);
    builder.getProduct();
    const secondCell = builder.getProduct();
    expect(secondCell.getAddress()).toBe('');
    });

    it('should create independent cell instances', (): void => {
    builder.setContext(['A1', '42']);
    const cell1 = builder.getProduct();
    builder.setContext(['B2', '24']);
    const cell2 = builder.getProduct();
    
    expect(cell1).not.toBe(cell2);
    expect(cell1.getAddress()).not.toBe(cell2.getAddress());
    expect(cell1.getInput()).not.toBe(cell2.getInput());
    });

    it('should initialize cell with correct expression', (): void => {
    builder.setContext(['A1', '42']);
    const cell = builder.getProduct();
    expect(cell.getValue()).toBe(42);
    });
  });

  describe('reset', () => {
    it('should clear address and input', (): void => {
    builder.setContext(['A1', '42']);
    builder.reset();
    const cell = builder.getProduct();
    expect(cell.getAddress()).toBe('');
    expect(cell.getInput()).toBe('');
    });

    it('should allow new context to be set after reset', (): void => {
    builder.setContext(['A1', '42']);
    builder.reset();
    builder.setContext(['B2', '24']);
    const cell = builder.getProduct();
    expect(cell.getAddress()).toBe('B2');
    expect(cell.getInput()).toBe('24');
    });
  });

  describe('Expression Creation', () => {
    it('should create numeric expression for numbers', (): void => {
    builder.setContext(['A1', '42']);
    const cell = builder.getProduct();
    expect(cell.getValue()).toBe(42);
    });

    it('should create string expression for text', (): void => {
    builder.setContext(['A1', 'Hello']);
    const cell = builder.getProduct();
    expect(cell.getValue()).toBe('Hello');
    });

    it('should create formula expression for calculations', (): void => {
    builder.setContext(['A1', '2+3']);
    const cell = builder.getProduct();
    expect(cell.getValue()).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid context array length', (): void => {
    expect(() => {
        builder.setContext(['A1']);
    }).toThrow();
    });

    it('should handle special characters in input', (): void => {
    builder.setContext(['A1', '!@#$%']);
    const cell = builder.getProduct();
    expect(cell.getInput()).toBe('!@#$%');
    });

    it('should handle very long inputs', (): void => {
    const longInput = 'x'.repeat(1000);
    builder.setContext(['A1', longInput]);
    const cell = builder.getProduct();
    expect(cell.getInput()).toBe(longInput);
    });
  });
});