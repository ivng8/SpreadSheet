import React, { useState } from 'react';
import Cell from './view/components/grid/Cell';

class SpreadSheet {
  updateCell(address: string, value: string) {
    console.log(`Mock update cell ${address} with value: ${value}`);
  }
}

const App: React.FC = () => {
  const [spreadsheet] = useState(() => new SpreadSheet());
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const rows = 20;
  const cols = 20;

  const handleCellUpdate = (address: string, newValue: string) => {
    console.log(`${address}:${newValue}`);
  };

  const handleCellSelect = (address: string) => {
    setSelectedCell(address);
    console.log(`${address}`);
  };

  const getColumnLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  const getCellAddress = (row: number, col: number): string => {
    return `${getColumnLabel(col)}${row + 1}`;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Spreadsheet Demo</h1>
      <div className="border border-gray-300" role="grid">
        {/* Column Headers */}
        <div className="flex" role="row">
          {/* Top-left cell showing selected cell address */}
          <div className="w-16 h-8 bg-gray-100 border-r border-b flex items-center justify-center text-sm font-medium">
            {selectedCell || ''}
          </div>
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