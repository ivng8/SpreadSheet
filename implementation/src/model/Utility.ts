import * as XLSX from 'xlsx';
import { SpreadSheet } from './components/SpreadSheet';
import { Cell } from './components/Cell';

/**
 * a utility class that has useful static functions for the object classes
 * comprised mostly of abstracted conversion methods
 */
export class Utility {

    /**
     * converts a letter which represents a column in a spreadsheet to a unique number
     * similar to hashcoding
     * @param column the column letter(s)
     * @returns a number represent that column
     */
    static columnLetterToNumber(column: string): number {
        let result = 0;
        for (let i = 0; i < column.length; i++) {
            result *= 26;
            result += column.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
        }
        return result;
    }

    /**
       * converts a number to char(s) in context of a spreadsheet (ex: 3 -> C)
       * @param num the number
       * @returns a char(s) in case of 27 -> AA so it's not always single letter
       */
    static numberToColumnLetter(num: number): string {
        let result = '';
        while (num > 0) {
            num--;
            result = String.fromCharCode('A'.charCodeAt(0) + (num % 26)) + result;
            num = Math.floor(num / 26);
        }
        return result;
    }

    /**
     * converts an xlsx file into a SpreadSheet object that will be usable by the model
     * @param filePath the filepath to the xlsx file
     * @returns
     */
    static xlsxImport(filePath: string): SpreadSheet {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const cellMap = new Map<string, Cell>();
        let sheet: SpreadSheet = new SpreadSheet(cellMap);
        Object.keys(worksheet).forEach(cellAddress => {
            // Skip non-cell keys like '!ref', '!margins', etc.
            if (cellAddress.startsWith('!')) return;
            const cellValue = worksheet[cellAddress].v;
            cellMap.set(cellAddress, new Cell(String(cellValue), sheet));
        });
        return sheet;
    }

    /**
     * writes a spreadsheet into an xlsx file
     * @param cellMap the grid representing the spreadsheet data
     * @param outputPath the path that the file is written into
     */
    static xlsxExport(cellMap: Map<string, string>, outputPath: string): void {
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        const worksheet: XLSX.WorkSheet = {};
        let maxRow = 0;
        let maxCol = 0;
        cellMap.forEach((value, address) => {
            // Create cell object
            worksheet[address] = {
                t: 's', // Set type as string
                v: value // Set value
            };

            // Extract row and column from address (e.g., 'A1' -> col='A', row=1)
            const match = address.match(/([A-Z]+)(\d+)/);
            if (match) {
                const col = Utility.columnLetterToNumber(match[1]);
                const row = parseInt(match[2]);
                maxCol = Math.max(maxCol, col);
                maxRow = Math.max(maxRow, row);
            }
        });

        // Set worksheet range
        const range = {
            s: { c: 0, r: 0 }, // start
            e: { c: maxCol, r: maxRow } // end
        };
        worksheet['!ref'] = XLSX.utils.encode_range(range);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Write to file
        XLSX.writeFile(workbook, outputPath);
    }
}