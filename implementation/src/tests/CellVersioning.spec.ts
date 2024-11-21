import { Cell } from "model/components/Cell";
import { SpreadSheet } from "model/components/SpreadSheet";
import { User } from "model/components/User";
import { Director } from "model/Director";

describe('Cell Version History', () => {
  let spreadsheet: SpreadSheet;
  let cell: Cell;
  let user1: User;
  let user2: User;
  let director: Director;

  beforeEach(() => {
    director = new Director();
    spreadsheet = director.makeSpreadSheet();
    cell = new Cell('', spreadsheet);
    user1 = new User('Test User 1', 'user1@example.com');
    user2 = new User('Test User 2', 'user2@example.com');
  });

  describe('Cell Content Updates', () => {
    it('should maintain cell value after update', () => {
      cell.updateContents('=42', user1);
      expect(cell.getInput()).toBe('=42');
      expect(cell.getValue()).toBe(42);
    });

    it('should reflect latest update in cell value', () => {
      cell.updateContents('=42', user1);
      cell.updateContents('=43', user1);
      expect(cell.getInput()).toBe('=43');
      expect(cell.getValue()).toBe(43);
    });

    it('should handle formula updates', () => {
      cell.updateContents('=1+1', user1);
      expect(cell.getInput()).toBe('=1+1');
      expect(cell.getValue()).toBe(2);
    });

    it('should maintain formula after multiple updates', () => {
      cell.updateContents('=1+1', user1);
      cell.updateContents('=2+2', user2);
      expect(cell.getInput()).toBe('=2+2');
      expect(cell.getValue()).toBe(4);
    });
  });

  describe('Cell References', () => {
    it('should maintain cell references through updates', () => {
      const grid = new Map<string, Cell>();
      const cellA1 = new Cell('=42', spreadsheet);
      grid.set('A1', cellA1);
      spreadsheet = new SpreadSheet(grid);
      cell = new Cell('=REF(A1)', spreadsheet);
      expect(cell.getValue()).toBe(42);
      
      cellA1.updateContents('=43', user1);
      expect(cell.getValue()).toBe(43);
    });

    it('should handle reference updates', () => {
      const grid = new Map<string, Cell>();
      const cellA1 = new Cell('=42', spreadsheet);
      grid.set('A1', cellA1);
      spreadsheet = new SpreadSheet(grid);
      cell = new Cell('', spreadsheet);
      cell.updateContents('=REF(A1)', user1);
      expect(cell.getValue()).toBe(42);

      cell.updateContents('=REF(A1)+1', user2);
      expect(cell.getValue()).toBe(43);
    });
  });

  describe('Content Types', () => {
    it('should handle string content updates', () => {
      cell.updateContents('Hello', user1);
      cell.updateContents('World', user2);
      expect(cell.getInput()).toBe('World');
      expect(cell.getValue()).toBe('World');
    });

    it('should handle numeric content updates', () => {
      cell.updateContents('=42', user1);
      cell.updateContents('=43.5', user2);
      expect(cell.getInput()).toBe('=43.5');
      expect(cell.getValue()).toBe(43.5);
    });

    it('should handle formula content updates', () => {
      cell.updateContents('=1+1', user1);
      cell.updateContents('=2*3', user2);
      expect(cell.getInput()).toBe('=2*3');
      expect(cell.getValue()).toBe(6);
    });

    it('should handle empty content updates', () => {
      cell.updateContents('=42', user1);
      cell.updateContents('', user2);
      expect(cell.getInput()).toBe('');
      expect(cell.getValue()).toBeNull();
    });
  });

  describe('Special Cases', () => {
    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000);
      cell.updateContents(longContent, user1);
      expect(cell.getInput()).toBe(longContent);
      expect(cell.getValue()).toBe(longContent);
    });

    it('should handle special characters', () => {
      const specialContent = '!@#$%^&*()_+{}[]|":;<>?/.,';
      cell.updateContents(specialContent, user1);
      expect(cell.getInput()).toBe(specialContent);
      expect(cell.getValue()).toBe(specialContent);
    });

    it('should handle multiple rapid updates', () => {
      for(let i = 0; i < 100; i++) {
        cell.updateContents(`value${i}`, user1);
      }
      expect(cell.getInput()).toBe('value99');
      expect(cell.getValue()).toBe('value99');
    });
  });

  describe('Error Cases', () => {
    it('should handle invalid formula updates', () => {
      cell.updateContents('=1+', user1);
      expect(cell.getInput()).toBe('=1+');
      expect(cell.getValue()).toBeNull();
    });

    it('should handle circular reference updates', () => {
      const grid = new Map<string, Cell>();
      const cellA1 = new Cell('=42', spreadsheet);
      grid.set('A1', cellA1);
      spreadsheet = new SpreadSheet(grid);
      grid.set('B1', new Cell('=REF(A1)', spreadsheet));
      expect(() => {
        cellA1.updateContents('=REF(B1)', user1);
        cellA1.getValue();
      }).toThrow('Cell at B1 is empty');
    });

    it('should handle undefined reference updates', () => {
      expect(() => {
        cell.updateContents('=REF(Z99)', user1);
        cell.getValue();
      }).toThrow('Cell at Z99 is empty');
    });
  });

  describe('Multiple User Updates', () => {
    it('should handle alternating user updates', () => {
      cell.updateContents('user1 content', user1);
      expect(cell.getInput()).toBe('user1 content');
      
      cell.updateContents('user2 content', user2);
      expect(cell.getInput()).toBe('user2 content');
    });

    it('should handle formula updates from different users', () => {
      cell.updateContents('=1+1', user1);
      expect(cell.getValue()).toBe(2);
      
      cell.updateContents('=2+2', user2);
      expect(cell.getValue()).toBe(4);
    });
  });
});