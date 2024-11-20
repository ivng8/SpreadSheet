import React, { useState } from 'react';
import Grid from './view/components/grid/Grid';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { Cell } from 'model/components/Cell';
import SpreadsheetToolbar from './view/components/toolbar/SpreadsheetToolbar';

const App: React.FC = () => {
  const initializeGrid = () => {
    const grid = new Map<string, Cell>();
    // Create grid (Modeled after Google Sheets bounds)
    for (let row = 0; row < 1000; row++) {
      for (let col = 0; col < 26; col++) {
        const colLabel = String.fromCharCode(65 + col);
        const address = `${colLabel}${row + 1}`;
        grid.set(address, new Cell('', null as any)); // Temporary null reference
      }
    }
    const spreadsheet = new SpreadSheet(grid);
    grid.forEach((cell, address) => {
      grid.set(address, new Cell('', spreadsheet));
    });
    return spreadsheet;
  };

  const [spreadsheet] = useState(() => initializeGrid());
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const handleCellUpdate = (address: string, newValue: string) => {
    try {
      const cell = spreadsheet.getCell(address);
      cell.updateContents(newValue, null); // Pass null as user for now
    } catch (error) {
      console.error(`Error updating cell ${address}:`, error);
    }
  };

  const handleCellSelect = (address: string) => {
    setSelectedCell(address);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <SpreadsheetToolbar
        spreadsheet={spreadsheet}
        selectedCell={selectedCell}
        onCellUpdate={handleCellUpdate}
      />
      <div className="flex-1 overflow-hidden">
        <Grid
          spreadsheet={spreadsheet}
          selectedCell={selectedCell}
          onCellUpdate={handleCellUpdate}
          onCellSelect={handleCellSelect}
        />
      </div>
    </div>
  );
};

export default App;