import React, { useState } from 'react';
import Cell from './view/components/grid/Cell';

// Basic mock of SpreadSheet class just to satisfy the type requirement
class SpreadSheet {
  updateCell(address: string, value: string) {
    console.log(`Mock update cell ${address} with value: ${value}`);
  }
}

const App: React.FC = () => {
  // Initialize a basic spreadsheet instance
  const [spreadsheet] = useState(() => new SpreadSheet());
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Create a 5x5 grid
  const rows = 5;
  const cols = 5;

  const handleCellUpdate = (address: string, newValue: string) => {
    console.log(`Cell ${address} updated with: ${newValue}`);
  };

  const handleCellSelect = (address: string) => {
    setSelectedCell(address);
    console.log(`Selected cell: ${address}`);
  };

  // Helper function to convert column index to letter (0 = A, 1 = B, etc.)
  const getColumnLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  // Helper function to generate cell address (A1, B1, etc.)
  const getCellAddress = (row: number, col: number): string => {
    return `${getColumnLabel(col)}${row + 1}`;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Spreadsheet Test</h1>

      {/* Selected Cell Display */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p className="font-semibold">Selected Cell: {selectedCell || 'None'}</p>
      </div>

      {/* Spreadsheet Grid */}
      <div className="border border-gray-300" role="grid">
        {/* Column Headers */}
        <div className="flex" role="row">
          <div className="w-16 h-8 bg-gray-100 border-r border-b flex items-center justify-center"></div>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={`header-${colIndex}`}
              className="w-32 h-8 bg-gray-100 border-r border-b flex items-center justify-center font-medium"
              role="columnheader"
            >
              {getColumnLabel(colIndex)}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex" role="row">
            {/* Row Header */}
            <div
              className="w-16 h-8 bg-gray-100 border-r border-b flex items-center justify-center font-medium"
              role="rowheader"
            >
              {rowIndex + 1}
            </div>

            {/* Cells */}
            {Array.from({ length: cols }).map((_, colIndex) => {
              const address = getCellAddress(rowIndex, colIndex);
              return (
                <div key={`cell-${address}`} className="w-32 h-8">
                  <Cell
                    address={address}
                    initialInput=""
                    spreadsheet={spreadsheet}
                    onUpdate={handleCellUpdate}
                    isSelected={selectedCell === address}
                    onSelect={handleCellSelect}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;