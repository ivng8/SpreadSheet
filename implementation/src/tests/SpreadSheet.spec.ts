import { SpreadSheet } from "model/components/SpreadSheet";
import { Cell } from "model/components/Cell";
import { User } from "model/components/User";
import { Director } from "model/Director";

describe('SpreadSheet', () => {
  let spreadsheet: SpreadSheet;
  let director: Director;
  let user: User;

  beforeEach(() => {
    director = new Director();
    spreadsheet = director.makeSpreadSheet();
    user = new User("Test User", "test@example.com");
  });

  describe('Grid Management', () => {
    describe('Cell Operations', () => {
      it('should get cell by address', () => {
        const cell = new Cell('=42', spreadsheet);
        spreadsheet = new SpreadSheet(new Map([['A1', cell]]));
        expect(spreadsheet.getCell('A1')).toBe(cell);
      });

      it('should clear cell content', () => {
        const cell = new Cell('=42', spreadsheet);
        spreadsheet = new SpreadSheet(new Map([['A1', cell]]));
        spreadsheet.clearCell('A1', user);
        expect(spreadsheet.getCell('A1').getValue()).toBeNull();
      });
    });

    describe('Row Operations', () => {
      beforeEach(() => {
        const grid = new Map<string, Cell>();
        grid.set('A1', new Cell('=1', spreadsheet));
        grid.set('A2', new Cell('=2', spreadsheet));
        grid.set('B1', new Cell('=3', spreadsheet));
        grid.set('B2', new Cell('=4', spreadsheet));
        spreadsheet = new SpreadSheet(grid);
      });

      it('should insert row', () => {
        spreadsheet.insertRow(1, user);
        expect(spreadsheet.getCell('A1').getValue()).toBe(1);
        expect(spreadsheet.getCell('A2').getValue()).toBeNull();
        expect(spreadsheet.getCell('A3').getValue()).toBe(2);
      });

      it('should delete row', () => {
        spreadsheet.deleteRow(1, user);
        expect(spreadsheet.getCell('A1').getValue()).toBe(1);
        expect(spreadsheet.getCell('A2').getValue()).toBeNull();
      });
    });

    describe('Column Operations', () => {
      beforeEach(() => {
        const grid = new Map<string, Cell>();
        grid.set('A1', new Cell('=1', spreadsheet));
        grid.set('B1', new Cell('=2', spreadsheet));
        grid.set('A2', new Cell('=3', spreadsheet));
        grid.set('B2', new Cell('=4', spreadsheet));
        spreadsheet = new SpreadSheet(grid);
      });

      it('should insert column', () => {
        spreadsheet.insertColumn(1, user);
        expect(spreadsheet.getCell('A1').getValue()).toBe(1);
        expect(spreadsheet.getCell('B1').getValue()).toBeNull();
        expect(spreadsheet.getCell('C1').getValue()).toBe(2);
      });

      it('should delete column', () => {
        spreadsheet.deleteColumn(1, user);
        expect(spreadsheet.getCell('A1').getValue()).toBe(1);
        expect(spreadsheet.getCell('B1').getValue()).toBeNull();
      });
    });
  });

  describe('Recalculation', () => {
    it('should recalculate all cells', () => {
      const grid = new Map<string, Cell>();
      grid.set('A1', new Cell('=1', spreadsheet));
      spreadsheet = new SpreadSheet(grid);
      grid.set('A2', new Cell('=REF(A1)+1', spreadsheet));
      grid.set('A3', new Cell('=REF(A2)+1', spreadsheet));
      
      spreadsheet.getCell('A1').updateContents('=2', user);
      spreadsheet.recalculate();
      
      expect(spreadsheet.getCell('A2').getValue()).toBe(3);
      expect(spreadsheet.getCell('A3').getValue()).toBe(4);
    });
  });

  describe('Range Handling', () => {
    beforeEach(() => {
      const grid = new Map<string, Cell>();
      grid.set('A1', new Cell('=1', spreadsheet));
      grid.set('A2', new Cell('=2', spreadsheet));
      grid.set('B1', new Cell('=3', spreadsheet));
      grid.set('B2', new Cell('=4', spreadsheet));
      spreadsheet = new SpreadSheet(grid);
    });

    it('should correctly evaluate SUM range', () => {
      const sumCell = new Cell('=SUM(A1:B2)', spreadsheet);
      expect(sumCell.getValue()).toBe(10);
    });

    it('should correctly evaluate AVG range', () => {
      const avgCell = new Cell('=AVG(A1:B2)', spreadsheet);
      expect(avgCell.getValue()).toBe(2.5);
    });

    it('should correctly evaluate MIN value', () => {
      const avgCell = new Cell('=MIN(A1:B2)', spreadsheet);
      expect(avgCell.getValue()).toBe(1);
    });

    it('should correctly evaluate MAX value', () => {
      const avgCell = new Cell('=MAX(A1:B2)', spreadsheet);
      expect(avgCell.getValue()).toBe(4);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid cell addresses', () => {
      expect(() => spreadsheet.getCell('')).toThrow();
      expect(() => spreadsheet.getCell('123')).toThrow();
      expect(() => spreadsheet.getCell('AA')).toThrow();
    });
  });
});