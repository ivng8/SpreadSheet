import { Cell } from './Cell';
import { Director } from '../Director';
import { MergeConflictResolver } from 'model/conflicts/MergeConflictResolver';
import { CollaborationManager } from './CollaborationManager';
import { Utility } from 'model/Utility';
import { User } from './User';

/**
 * represents the table of a spreadsheet application
 */
export class SpreadSheet {
  private grid: Map<string, Cell>;
  private resolver: MergeConflictResolver;

  /**
   * constructor for the spreadsheet
   * @param grid a map of a unique index to its cell (ex: A7 to a cell)
   */
  public constructor(grid: Map<string, Cell>) {
    this.grid = grid;
    this.resolver = new MergeConflictResolver();
  }

  /**
   * getter for a cell given its identifier
   * @param address the address of the cell
   * @returns the Cell
   */
  public getCell(address: string): Cell {
    const cell = this.grid.get(address);
    if (cell === undefined) {
      throw new Error(`Cell at ${address} is empty`);
    }
    return cell;
  }

  public copyGrid(): Map<string, Cell> {
    const ans = this.grid;
    return ans;
  }

  /**
   * inserts a blank row into the spreadsheet and updates the other addresses and references
   * @param index the index at which the row is to be inserted
   * @param user the user
   */

  public insertRow(index: number, user: User): void {
    this.updateReferences(index, 0, 1, user);

    // Get highest row number
    const lastRow = Math.max(
      ...Array.from(this.grid.keys()).map(addr => {
        const rowNum = parseInt(addr.match(/\d+$/)?.[0] || '0');
        return rowNum;
      })
    );

    // Add new row at end
    const newRowNum = lastRow + 1;
    const allCols = new Set(
      Array.from(this.grid.keys())
        .map(addr => addr.match(/^([A-Za-z]+)/)?.[1])
        .filter(Boolean)
    );
    for (const col of allCols) {
      const newAddr = `${col}${newRowNum}`;
      this.grid.set(newAddr, new Director().makeCell('', this));
    }

    const addresses = Array.from(this.grid.keys());
    const movingAddresses = new Set<string>();

    for (const address of addresses) {
      const [, colStr, rowStr] = address.match(/^([A-Za-z]+)(\d+)$/) || [];
      if (!colStr || !rowStr) continue;

      const rowNum = parseInt(rowStr);
      if (rowNum >= index) {
        movingAddresses.add(address);
      }
    }

    const sortedAddresses = Array.from(movingAddresses).sort((a, b) => {
      const rowA = parseInt(a.match(/\d+$/)?.[0] || '0');
      const rowB = parseInt(b.match(/\d+$/)?.[0] || '0');
      return rowB - rowA;
    });

    for (const address of sortedAddresses) {
      const [, colStr, rowStr] = address.match(/^([A-Za-z]+)(\d+)$/) || [];
      const rowNum = parseInt(rowStr);
      const newAddress = `${colStr}${rowNum + 1}`;

      const currentCell = this.grid.get(address);
      if (currentCell) {
        const targetCell = this.grid.get(newAddress);
        if (targetCell) {
          targetCell.updateContents(currentCell.getInput(), user);
        }
        currentCell.updateContents('', user);
      }
    }
  }
  /**
   * deletes a row and updates the other addresses and references
   * @param index the index at which the row is to be deleted
   * @param user the user
   */
  public deleteRow(index: number, user: User): void {
    this.updateReferences(index, 0, -1, user);

    const addresses = Array.from(this.grid.keys());

    // Clear row being deleted
    for (const address of addresses) {
      const [, colStr, rowStr] = address.match(/^([A-Za-z]+)(\d+)$/) || [];
      if (!colStr || !rowStr) continue;

      const rowNum = parseInt(rowStr);
      if (rowNum === index) {
        const cell = this.grid.get(address);
        if (cell) {
          cell.updateContents('', user);
        }
      }
    }

    // Move cells up
    for (const address of addresses) {
      const [, colStr, rowStr] = address.match(/^([A-Za-z]+)(\d+)$/) || [];
      if (!colStr || !rowStr) continue;

      const rowNum = parseInt(rowStr);
      if (rowNum > index) {
        const currentCell = this.grid.get(address);
        const newAddress = `${colStr}${rowNum - 1}`;
        const targetCell = this.grid.get(newAddress);

        if (currentCell && targetCell) {
          targetCell.updateContents(currentCell.getInput(), user);
          currentCell.updateContents('', user);
        }
      }
    }

    // Remove last row
    const lastRow = Math.max(
      ...Array.from(this.grid.keys()).map(addr => {
        return parseInt(addr.match(/\d+$/)?.[0] || '0');
      })
    );

    const lastRowAddresses = Array.from(this.grid.keys()).filter(addr => {
      return parseInt(addr.match(/\d+$/)?.[0] || '0') === lastRow;
    });

    for (const addr of lastRowAddresses) {
      this.grid.delete(addr);
    }
  }

  /**
   * inserts a blank column into the spreadsheet and updates the other addresses and references
   * @param index the index at which the column is to be inserted
   * @param user the user
   */

  public insertColumn(index: number, user: User): void {
    this.updateReferences(index, 1, 0, user);
    const lastColNum = Math.max(
      ...Array.from(this.grid.keys()).map(addr => {
        const [, colStr] = addr.match(/^([A-Za-z]+)/) || [];
        return Utility.columnLetterToNumber(colStr || 'A');
      })
    );

    // Add new empty column at end
    const newColIndex = lastColNum + 1;
    const allRows = new Set(
      Array.from(this.grid.keys())
        .map(addr => addr.match(/\d+$/)?.[0])
        .filter(Boolean)
    );
    for (const row of allRows) {
      const newAddr = `${Utility.numberToColumnLetter(newColIndex)}${row}`;
      this.grid.set(newAddr, new Director().makeCell('', this));
    }

    // Move cells
    const addresses = Array.from(this.grid.keys());
    const movingAddresses = new Set<string>();

    for (const address of addresses) {
      const [, colStr, rowStr] = address.match(/^([A-Za-z]+)(\d+)$/) || [];
      if (!colStr || !rowStr) continue;

      const colNum = Utility.columnLetterToNumber(colStr);
      if (colNum >= index) {
        movingAddresses.add(address);
      }
    }

    const sortedAddresses = Array.from(movingAddresses).sort((a, b) => {
      const colA = Utility.columnLetterToNumber(a.match(/^([A-Za-z]+)/)?.[1] || '');
      const colB = Utility.columnLetterToNumber(b.match(/^([A-Za-z]+)/)?.[1] || '');
      return colB - colA;
    });

    for (const address of sortedAddresses) {
      const [, colStr, rowStr] = address.match(/^([A-Za-z]+)(\d+)$/) || [];
      const colNum = Utility.columnLetterToNumber(colStr);
      const newAddress = `${Utility.numberToColumnLetter(colNum + 1)}${rowStr}`;

      const currentCell = this.grid.get(address);
      if (currentCell) {
        const targetCell = this.grid.get(newAddress);
        if (targetCell) {
          targetCell.updateContents(currentCell.getInput(), user);
        }
        currentCell.updateContents('', user);
      }
    }
  }
  /**
   * deletes a column and updates the other addresses and references
   * @param index the index at which the column is to be deleted
   * @param user the user
   */

  public deleteColumn(index: number, user: User): void {
    this.updateReferences(index, -1, 0, user);

    const addresses = Array.from(this.grid.keys());

    // Clear column being deleted
    for (const address of addresses) {
      const [, colStr, rowStr] = address.match(/^([A-Za-z]+)(\d+)$/) || [];
      if (!colStr || !rowStr) continue;

      const colNum = Utility.columnLetterToNumber(colStr);
      if (colNum === index) {
        const cell = this.grid.get(address);
        if (cell) {
          cell.updateContents('', user);
        }
      }
    }

    // Move cells left
    for (const address of addresses) {
      const [, colStr, rowStr] = address.match(/^([A-Za-z]+)(\d+)$/) || [];
      if (!colStr || !rowStr) continue;

      const colNum = Utility.columnLetterToNumber(colStr);
      if (colNum > index) {
        const currentCell = this.grid.get(address);
        const newAddress = `${Utility.numberToColumnLetter(colNum - 1)}${rowStr}`;
        const targetCell = this.grid.get(newAddress);

        if (currentCell && targetCell) {
          targetCell.updateContents(currentCell.getInput(), user);
          currentCell.updateContents('', user);
        }
      }
    }

    // Remove last column
    const lastColNum = Math.max(
      ...Array.from(this.grid.keys()).map(addr => {
        const [, colStr] = addr.match(/^([A-Za-z]+)/) || [];
        return Utility.columnLetterToNumber(colStr || 'A');
      })
    );

    const lastColAddresses = Array.from(this.grid.keys()).filter(addr => {
      const [, colStr] = addr.match(/^([A-Za-z]+)/) || [];
      return Utility.columnLetterToNumber(colStr || 'A') === lastColNum;
    });

    for (const addr of lastColAddresses) {
      this.grid.delete(addr);
    }
  }
  /**
   * clears the contents of a cell
   * @param address the address of the cell to be cleared
   * @param user the user
   */
  public clearCell(address: string, user: User): void {
    this.getCell(address).updateContents('', user);
  }

  /**
   * refreshes the table
   */
  public recalculate(): void {
    const keys = Array.from(this.grid.keys());
    for (let i = 0; i < keys.length; i += 1) {
      this.grid.get(keys[i])?.getValue();
    }
  }

  /**
   * updates the references to all the cells that were shifted due to some translation
   * in the x or y direction depending on row or column mutation
   * @param point the reference row or col that is the pivot of the mutation
   * @param x the col direction 1 being add -1 being deletion
   * @param y the row direction 1 being add -1 being deletion
   * @param user the user
   */
  private updateReferences(point: number, x: number, y: number, user: User): void {
    const digits = Array.from(this.grid.keys());
    const refRegex = /REF\(([A-Za-z]+\d+)\)/g;
    for (let i = 0; i < digits.length; i += 1) {
      let curr: string = this.grid.get(digits[i])!.getInput();
      curr = curr.replace(refRegex, (match, reference) => {
        const column = reference.match(/[A-Za-z]+/)[0];
        const row = parseInt(reference.match(/\d+/)[0]);
        if (x === 0) {
          if (row >= point) {
            return `REF(${column}${row + y})`;
          }
        } else {
          if (Utility.columnLetterToNumber(column) >= point) {
            return `REF(${Utility.numberToColumnLetter(Utility.columnLetterToNumber(column) + x)}${row})`;
          }
        }
        return match;
      });

      if (curr !== this.grid.get(digits[i])!.getInput()) {
        this.grid.get(digits[i])!.updateContents(curr, user);
      }
    }
  }

  /**
   * imports an xlsx file onto the sheet using a pivot point as the drag and drop location
   * @param filePath the filepath to the other spreadsheet
   * @param originPoint the location of the drag and drop
   * @param user the user doing it
   */
  public async import(
    file: File,
    originPoint: string,
    user: User,
    resolver?: MergeConflictResolver
  ): Promise<void> {
    try {
      const sheet = await Utility.xlsxImport(file);
      const pair = originPoint.match(/^([A-Za-z]+)(\d+)$/)!;
      for (let i = 1; i < Utility.columnLetterToNumber(pair[1]); i += 1) {
        sheet.insertColumn(0, user);
      }
      for (let j = 1; j < parseInt(pair[2]); j += 1) {
        sheet.insertRow(0, user);
      }
      const manager = new CollaborationManager(this, sheet);
      const newGrid = await manager.merge(resolver || this.resolver, user);
      this.grid = newGrid;
      this.recalculate();
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  /**
   * writes the data in the spreadsheet into a Excel file
   * @param outputPath the path of the file the user wants to write into
   */
  public export(outputPath: string): void {
    let outputs: Map<string, string> = new Map<string, string>();
    const toString = (value: string | number | null): string =>
      value === null ? '' : String(value);
    const curr = this.copyGrid();
    const keys = [...curr.keys()];
    for (let i = 0; i < keys.length; i += 1) {
      outputs.set(keys[i], toString(curr.get(keys[i])!.getValue()));
    }
    Utility.xlsxExport(outputs, outputPath);
  }
  public getLength(): number {
    return Math.max(
      ...Array.from(this.grid.keys()).map(addr => {
        const [, colStr] = addr.match(/^([A-Za-z]+)/) || [];
        return Utility.columnLetterToNumber(colStr || 'A');
      })
    );
  }

  public getHeight(): number {
    return Math.max(
      ...Array.from(this.grid.keys()).map(addr => {
        return parseInt(addr.match(/\d+$/)?.[0] || '0');
      })
    );
  }
}
