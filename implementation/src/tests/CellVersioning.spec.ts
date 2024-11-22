import { Cell } from "model/components/Cell";
import { SpreadSheet } from "model/components/SpreadSheet";
import { User } from "model/components/User";
import { Director } from "model/Director";
import { VersionHistory } from "model/version/VersionHistory";

describe('Cell Version History', () => {
  let spreadsheet: SpreadSheet;
  let cell: Cell;
  let user1: User;
  let user2: User;
  let director: Director;
  let versionHistory: VersionHistory;

  beforeEach(() => {
    director = new Director();
    spreadsheet = director.makeSpreadSheet();
    cell = new Cell('', spreadsheet);
    versionHistory = new VersionHistory();
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

  describe('Basic Version Control', () => {
    it('should handle empty entries', () => {
      versionHistory.addEntry('', user1);
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('', user1);

      const history = versionHistory.getHistory();
      expect(history[0].entries.length).toBe(3);
      expect(history[0].entries.map(entry => entry.getEntry())).toEqual(['', '=1', '']);
    });
    
    it('should create new entries in the main branch', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user1);
      versionHistory.addEntry('=3', user1);

      const history = versionHistory.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].entries.length).toBe(3);
    });

    it('should track entries with correct user information', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user2);

      const history = versionHistory.getHistory();
      expect(history[0].entries[0].getEntry()).toBe('=1');
      expect(history[0].entries[1].getEntry()).toBe('=2');
    });
  });

  describe('Branching Behavior', () => {
    it('should create new branch when reverting and making changes', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user1);
      versionHistory.addEntry('=3', user1);

      const history = versionHistory.getHistory();
      const secondEntryId = history[0].entries[1].getId();

      versionHistory.revert(secondEntryId);
      versionHistory.addEntry('=4', user1);

      const updatedHistory = versionHistory.getHistory();
      expect(updatedHistory.length).toBe(2);
      expect(updatedHistory[1].parent).toEqual({
        index: 0,
        entryId: secondEntryId
      });
    });

    it('should maintain branch relationships correctly', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user1);
      
      const history = versionHistory.getHistory();
      const firstEntryId = history[0].entries[0].getId();
      
      versionHistory.revert(firstEntryId);
      versionHistory.addEntry('=3', user2);

      const updatedHistory = versionHistory.getHistory();
      expect(updatedHistory[1].parent).toBeDefined();
      expect(updatedHistory[1].parent?.entryId).toBe(firstEntryId);
    });
  });

  describe('Auto-merge Behavior', () => {
    it('should auto-merge branches with same content', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user1);
      
      const firstEntryId = versionHistory.getHistory()[0].entries[0].getId();
      versionHistory.revert(firstEntryId);
      versionHistory.addEntry('=2', user2);

      const history = versionHistory.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].entries[history[0].entries.length - 1].getEntry()).toBe('=2');
    });

    it('should not merge branches with different content', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user1);
      
      const firstEntryId = versionHistory.getHistory()[0].entries[0].getId();
      versionHistory.revert(firstEntryId);
      versionHistory.addEntry('=3', user2);

      const history = versionHistory.getHistory();
      expect(history.length).toBe(2);
      expect(history[1].entries[0].getEntry()).toBe('=3');
    });

    it('should preserve branch history after merge', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user1);
      
      const firstEntryId = versionHistory.getHistory()[0].entries[0].getId();
      versionHistory.revert(firstEntryId);
      versionHistory.addEntry('=2', user2);

      const history = versionHistory.getHistory();
      expect(history[0].entries.length).toBe(2);
      expect(history[0].entries.map(entry => entry.getEntry()))
        .toEqual(['=1', '=2']);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple branches and merges', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user1);
      
      const firstEntryId = versionHistory.getHistory()[0].entries[0].getId();
      versionHistory.revert(firstEntryId);
      versionHistory.addEntry('=3', user2);
      
      versionHistory.revert(firstEntryId);
      versionHistory.addEntry('=4', user2);
      
      versionHistory.revert(firstEntryId);
      versionHistory.addEntry('=2', user2);

      const history = versionHistory.getHistory();
      expect(history.length).toBe(3);
      expect(history[1].entries[0].getEntry()).toBe('=3');
      expect(history[2].entries[0].getEntry()).toBe('=4');
    });

    it('should handle deep branching scenarios', () => {
      versionHistory.addEntry('=1', user1);
      versionHistory.addEntry('=2', user1);
      
      const secondEntryId = versionHistory.getHistory()[0].entries[1].getId();
      versionHistory.revert(secondEntryId);
      versionHistory.addEntry('=3', user2);
      
      const branchEntryId = versionHistory.getHistory()[1].entries[0].getId();
      versionHistory.revert(branchEntryId);
      versionHistory.addEntry('=4', user2);

      const history = versionHistory.getHistory();
      expect(history.length).toBe(3);
      expect(history[2].parent?.entryId).toBe(branchEntryId);
      expect(history[2].entries[0].getEntry()).toBe('=4');
    });
  });
});