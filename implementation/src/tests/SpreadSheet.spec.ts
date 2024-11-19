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
        const cell = new Cell('42', spreadsheet);
        spreadsheet = new SpreadSheet(new Map([['A1', cell]]));
        expect(spreadsheet.getCell('A1')).toBe(cell);
      });

      it('should throw error for non-existent cell', () => {
        expect(() => spreadsheet.getCell('Z99')).toThrow();
      });

      it('should clear cell content', () => {
        const cell = new Cell('42', spreadsheet);
        spreadsheet = new SpreadSheet(new Map([['A1', cell]]));
        spreadsheet.clearCell('A1');
        expect(spreadsheet.getCell('A1').getValue()).toBeNull();
      });
    });

    describe('Row Operations', () => {
      beforeEach(() => {
        const grid = new Map<string, Cell>();
        grid.set('A1', new Cell('1', spreadsheet));
        grid.set('A2', new Cell('2', spreadsheet));
        grid.set('B1', new Cell('3', spreadsheet));
        grid.set('B2', new Cell('4', spreadsheet));
        spreadsheet = new SpreadSheet(grid);
      });

      it('should insert row', () => {
        spreadsheet.insertRow(1);
        expect(spreadsheet.getCell('A1').getValue()).toBe(1);
        expect(spreadsheet.getCell('A2').getValue()).toBeNull();
        expect(spreadsheet.getCell('A3').getValue()).toBe(2);
      });

      it('should delete row', () => {
        spreadsheet.deleteRow(1);
        expect(spreadsheet.getCell('A1').getValue()).toBe(1);
        expect(spreadsheet.getCell('A2').getValue()).toBeNull();
      });

      it('should update references when inserting row', () => {
        spreadsheet = new SpreadSheet(new Map([
          ['A1', new Cell('=A2', spreadsheet)],
          ['A2', new Cell('42', spreadsheet)]
        ]));
        spreadsheet.insertRow(1);
        expect(spreadsheet.getCell('A1').getValue()).toBe(42);
      });

      it('should update references when deleting row', () => {
        spreadsheet = new SpreadSheet(new Map([
          ['A1', new Cell('=A3', spreadsheet)],
          ['A2', new Cell('temp', spreadsheet)],
          ['A3', new Cell('42', spreadsheet)]
        ]));
        spreadsheet.deleteRow(2);
        expect(spreadsheet.getCell('A1').getValue()).toBe(42);
      });
    });

    describe('Column Operations', () => {
      beforeEach(() => {
        const grid = new Map<string, Cell>();
        grid.set('A1', new Cell('1', spreadsheet));
        grid.set('B1', new Cell('2', spreadsheet));
        grid.set('A2', new Cell('3', spreadsheet));
        grid.set('B2', new Cell('4', spreadsheet));
        spreadsheet = new SpreadSheet(grid);
      });

      it('should insert column', () => {
        spreadsheet.insertColumn(1);
        expect(spreadsheet.getCell('A1').getValue()).toBe(1);
        expect(spreadsheet.getCell('B1').getValue()).toBeNull();
        expect(spreadsheet.getCell('C1').getValue()).toBe(2);
      });

      it('should delete column', () => {
        spreadsheet.deleteColumn(1);
        expect(spreadsheet.getCell('A1').getValue()).toBe(1);
        expect(spreadsheet.getCell('B1').getValue().toBeNull());
      });

      it('should update references when inserting column', () => {
        spreadsheet = new SpreadSheet(new Map([
          ['A1', new Cell('=B1', spreadsheet)],
          ['B1', new Cell('42', spreadsheet)]
        ]));
        spreadsheet.insertColumn(1);
        expect(spreadsheet.getCell('A1').getValue()).toBe(42);
      });

      it('should update references when deleting column', () => {
        spreadsheet = new SpreadSheet(new Map([
          ['A1', new Cell('=C1', spreadsheet)],
          ['B1', new Cell('temp', spreadsheet)],
          ['C1', new Cell('42', spreadsheet)]
        ]));
        spreadsheet.deleteColumn(2);
        expect(spreadsheet.getCell('A1').getValue()).toBe(42);
      });
    });
  });

  describe('Recalculation', () => {
    it('should recalculate all cells', () => {
      const grid = new Map<string, Cell>();
      grid.set('A1', new Cell('1', spreadsheet));
      grid.set('A2', new Cell('=A1+1', spreadsheet));
      grid.set('A3', new Cell('=A2+1', spreadsheet));
      spreadsheet = new SpreadSheet(grid);
      
      spreadsheet.getCell('A1').updateContents('2', user);
      spreadsheet.recalculate();
      
      expect(spreadsheet.getCell('A2').getValue()).toBe(3);
      expect(spreadsheet.getCell('A3').getValue()).toBe(4);
    });
  });

  describe('Import and Merge', () => {
    it('should import spreadsheet starting at specified point', () => {
      const sourceGrid = new Map<string, Cell>([
        ['A1', new Cell('source1', spreadsheet)],
        ['A2', new Cell('source2', spreadsheet)]
      ]);
      const sourceSheet = new SpreadSheet(sourceGrid);

      const targetGrid = new Map<string, Cell>([
        ['C3', new Cell('target', spreadsheet)]
      ]);
      spreadsheet = new SpreadSheet(targetGrid);

      spreadsheet.import(sourceSheet, 'C3');
      
      expect(spreadsheet.getCell('C3').getValue()).toBe('source1');
      expect(spreadsheet.getCell('C4').getValue()).toBe('source2');
    });

    it('should handle conflicting cells during import', () => {
      const sourceGrid = new Map<string, Cell>([
        ['A1', new Cell('source', spreadsheet)]
      ]);
      const sourceSheet = new SpreadSheet(sourceGrid);

      const targetGrid = new Map<string, Cell>([
        ['A1', new Cell('target', spreadsheet)]
      ]);
      spreadsheet = new SpreadSheet(targetGrid);

      spreadsheet.import(sourceSheet, 'A1');
      // Verify conflict resolution
    });
  });

  describe('Range Handling', () => {
    beforeEach(() => {
      const grid = new Map<string, Cell>();
      grid.set('A1', new Cell('1', spreadsheet));
      grid.set('A2', new Cell('2', spreadsheet));
      grid.set('B1', new Cell('3', spreadsheet));
      grid.set('B2', new Cell('4', spreadsheet));
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

    it('should handle invalid range references', () => {
      const invalidCell = new Cell('=SUM(Z1:Z9)', spreadsheet);
      expect(() => invalidCell.getValue()).toThrow();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle nested formulas with ranges', () => {
      const grid = new Map<string, Cell>();
      grid.set('A1', new Cell('1', spreadsheet));
      grid.set('A2', new Cell('2', spreadsheet));
      grid.set('B1', new Cell('=SUM(A1:A2)', spreadsheet));
      grid.set('B2', new Cell('=B1*2', spreadsheet));
      spreadsheet = new SpreadSheet(grid);

      expect(spreadsheet.getCell('B2').getValue()).toBe(6);
    });

    it('should maintain formula integrity after grid operations', () => {
      const grid = new Map<string, Cell>();
      grid.set('A1', new Cell('1', spreadsheet));
      grid.set('A2', new Cell('=A1+1', spreadsheet));
      grid.set('A3', new Cell('=SUM(A1:A2)', spreadsheet));
      spreadsheet = new SpreadSheet(grid);

      spreadsheet.insertRow(2);
      spreadsheet.recalculate();

      expect(spreadsheet.getCell('A3').getValue()).toBeNull();
      expect(spreadsheet.getCell('A4').getValue()).toBe(3);
    });

    it('should handle multiple dependencies', () => {
      const grid = new Map<string, Cell>();
      grid.set('A1', new Cell('1', spreadsheet));
      grid.set('B1', new Cell('2', spreadsheet));
      grid.set('C1', new Cell('=A1+B1', spreadsheet));
      grid.set('D1', new Cell('=C1*2', spreadsheet));
      spreadsheet = new SpreadSheet(grid);

      spreadsheet.getCell('A1').updateContents('3', user);
      spreadsheet.recalculate();

      expect(spreadsheet.getCell('C1').getValue()).toBe(5);
      expect(spreadsheet.getCell('D1').getValue()).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle circular references', () => {
      const grid = new Map<string, Cell>();
      grid.set('A1', new Cell('=A2', spreadsheet));
      grid.set('A2', new Cell('=A1', spreadsheet));
      spreadsheet = new SpreadSheet(grid);

      expect(() => spreadsheet.getCell('A1').getValue()).toThrow();
    });

    it('should handle invalid cell addresses', () => {
      expect(() => spreadsheet.getCell('')).toThrow();
      expect(() => spreadsheet.getCell('123')).toThrow();
      expect(() => spreadsheet.getCell('AA')).toThrow();
    });

    it('should handle invalid operations on ranges', () => {
      const cell = new Cell('=SUM(A1:A0)', spreadsheet);
      expect(cell.getValue()).toBeNull();
    });
  });
});