import React, { useState, useRef, useEffect, useCallback } from 'react';
import CellComponent from './Cell';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { User } from 'model/components/User';
import { match } from 'assert';

interface GridProps {
  user: User;
  spreadsheet: SpreadSheet;
  selectedCell: string | null;
  onCellUpdate: (address: string, newValue: string) => void;
  onCellSelect: (address: string) => void;
}

const CELL_WIDTH = 128;
const CELL_HEIGHT = 32;
const BUFFER_ROWS = 0;
const BUFFER_COLS = 0;

const Grid: React.FC<GridProps> = ({ user, spreadsheet, selectedCell, onCellUpdate, onCellSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnHeaderRef = useRef<HTMLDivElement>(null);
  const rowHeaderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const lastVisibleRangeRef = useRef({
    startRow: 0,
    endRow: 0,
    startCol: 0,
    endCol: 0,
  });

  // Track grid dimensions based on spreadsheet data
  const [gridDimensions, setGridDimensions] = useState(() => {
    const grid = spreadsheet.copyGrid();
    const addresses = Array.from(grid.keys());
    let maxRow = 0;
    let maxCol = 0;

    addresses.forEach(address => {
      const match = address.match(/^([A-Za-z]+)(\d+)$/);
      if (match) {
        const col = match[1].length === 1 ? match[1].charCodeAt(0) - 65 : 26 + (match[1].charCodeAt(1) - 65);
        const row = parseInt(match[2]) - 1;
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
      }
    });

    return {
      totalRows: maxRow + 2, // Add 1 for 0-based index and 1 for new row
      totalCols: maxCol + 2  // Add 1 for 0-based index and 1 for new column
    };
  });

  const [visibleRange, setVisibleRange] = useState({
    startRow: 0,
    endRow: 40,
    startCol: 0,
    endCol: 20,
  });

  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  // Update grid dimensions when spreadsheet changes
  useEffect(() => {
    const grid = spreadsheet.copyGrid();
    const addresses = Array.from(grid.keys());
    let maxRow = 0;
    let maxCol = 0;

    addresses.forEach(address => {
      const match = address.match(/^([A-Za-z]+)(\d+)$/);
      if (match) {
        const col = match[1].length === 1 ? match[1].charCodeAt(0) - 65 : 26 + (match[1].charCodeAt(1) - 65);
        const row = parseInt(match[2]) - 1;
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
      }
    });
    console.log("rerendered")
    setGridDimensions({
      totalRows: maxRow + 2,
      totalCols: maxCol + 2
    });
  }, [spreadsheet]);

  const getColumnLabel = (index: number): string => {
    if (index < 26) {
      return String.fromCharCode(65 + index);
    }
    return String.fromCharCode(65 + Math.floor(index / 26) - 1) +
           String.fromCharCode(65 + (index % 26));
  };

  const getCellAddress = (row: number, col: number): string => {
    return `${getColumnLabel(col)}${row + 1}`;
  };

  const getCellInitialValue = (address: string): string => {
    try {
      return spreadsheet.getCell(address).getInput();
    } catch {
      return '';
    }
  };

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    scrollPositionRef.current = { x: scrollLeft, y: scrollTop };

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const startRow = Math.max(0, Math.floor(scrollTop / CELL_HEIGHT));
      const startCol = Math.max(0, Math.floor(scrollLeft / CELL_WIDTH));

      const visibleRows = Math.ceil(rect.height / CELL_HEIGHT);
      const visibleCols = Math.ceil(rect.width / CELL_WIDTH);

      const newRange = {
        startRow: Math.max(0, startRow - BUFFER_ROWS),
        endRow: Math.min(gridDimensions.totalRows, startRow + visibleRows + BUFFER_ROWS),
        startCol: Math.max(0, startCol - BUFFER_COLS),
        endCol: Math.min(gridDimensions.totalCols, startCol + visibleCols + BUFFER_COLS),
      };

      const shouldUpdate =
        Math.abs(newRange.startRow - lastVisibleRangeRef.current.startRow) > BUFFER_ROWS / 2 ||
        Math.abs(newRange.startCol - lastVisibleRangeRef.current.startCol) > BUFFER_COLS / 2;

      if (shouldUpdate) {
        lastVisibleRangeRef.current = newRange;
        setVisibleRange(newRange);
      }

      setScrollPosition(scrollPositionRef.current);
    });
  }, [gridDimensions]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !containerRef.current) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const deltaX = lastMousePosRef.current.x - e.clientX;
      const deltaY = lastMousePosRef.current.y - e.clientY;

      containerRef.current.scrollLeft += deltaX;
      containerRef.current.scrollTop += deltaY;

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      if (columnHeaderRef.current) {
        columnHeaderRef.current.style.transform = `translateX(-${containerRef.current.scrollLeft}px)`;
      }
      if (rowHeaderRef.current) {
        rowHeaderRef.current.style.transform = `translateY(-${containerRef.current.scrollTop}px)`;
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateVisibleRange);
    },
    [updateVisibleRange]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = 'default';
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (columnHeaderRef.current) {
        columnHeaderRef.current.style.transform = `translateX(-${container.scrollLeft}px)`;
      }
      if (rowHeaderRef.current) {
        rowHeaderRef.current.style.transform = `translateY(-${container.scrollTop}px)`;
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        updateVisibleRange();
      }, 0);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateVisibleRange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    updateVisibleRange();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      clearTimeout(scrollTimeout);
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateVisibleRange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, updateVisibleRange]);

  return (
    <div className="relative w-full h-[95vh] border border-gray-300">
      <div className="absolute top-0 left-0 w-16 h-8 bg-gray-100 border-r border-b z-30 flex items-center justify-center font-medium">
        {selectedCell || ''}
      </div>

      <div className="absolute top-0 left-16 right-0 h-8 bg-gray-100 border-b overflow-hidden z-20">
        <div
          ref={columnHeaderRef}
          className="absolute flex"
          style={{
            transform: `translateX(-${scrollPosition.x}px)`,
            willChange: 'transform',
          }}
        >
          {Array.from({ length: gridDimensions.totalCols }).map((_, index) => (
            <div
              key={`header-${index}`}
              className="flex-shrink-0 w-32 h-8 border-r flex items-center justify-center font-medium"
            >
              {getColumnLabel(index)}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-8 left-0 w-16 bottom-0 bg-gray-100 border-r overflow-hidden z-20">
        <div
          ref={rowHeaderRef}
          className="absolute"
          style={{
            transform: `translateY(-${scrollPosition.y}px)`,
            willChange: 'transform',
          }}
        >
          {Array.from({ length: gridDimensions.totalRows }).map((_, index) => (
            <div
              key={`row-${index}`}
              className="h-8 w-16 border-b flex items-center justify-center font-medium"
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="absolute top-8 left-16 right-0 bottom-0 overflow-auto"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
      >
        <div
          className="relative"
          style={{
            width: gridDimensions.totalCols * CELL_WIDTH,
            height: gridDimensions.totalRows * CELL_HEIGHT,
          }}
        >
          <div className="absolute inset-0">
            {Array.from({ length: visibleRange.endRow - visibleRange.startRow }).map(
              (_, rowOffset) => {
                const rowIndex = visibleRange.startRow + rowOffset;
                return (
                  <div
                    key={`row-${rowIndex}`}
                    className="absolute w-full"
                    style={{
                      top: `${rowIndex * CELL_HEIGHT}px`,
                      height: CELL_HEIGHT,
                      willChange: 'transform',
                    }}
                  >
                    {Array.from({ length: visibleRange.endCol - visibleRange.startCol }).map(
                      (_, colOffset) => {
                        const colIndex = visibleRange.startCol + colOffset;
                        const address = getCellAddress(rowIndex, colIndex);
                        return (
                          <div
                            key={`cell-${address}`}
                            className="absolute border-r border-b"
                            style={{
                              left: `${colIndex * CELL_WIDTH}px`,
                              width: CELL_WIDTH,
                              height: CELL_HEIGHT,
                              willChange: 'transform',
                            }}
                          >
                            <CellComponent
                              user={user}
                              address={address}
                              initialInput={getCellInitialValue(address)}
                              spreadsheet={spreadsheet}
                              onUpdate={onCellUpdate}
                              isSelected={selectedCell === address}
                              onSelect={onCellSelect}
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grid;