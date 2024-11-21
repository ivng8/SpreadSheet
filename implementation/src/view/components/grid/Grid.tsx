
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import CellComponent from './Cell';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { User } from 'model/components/User';

interface GridProps {
  // The user object for collaborative editing
  user: User;
  // The spreadsheet object from our model
  spreadsheet: SpreadSheet;
  // Currently selected cell address (e.g., 'A1')
  selectedCell: string | null;
  // Callback when a cell's value is updated
  onCellUpdate: (address: string, newValue: string) => void;
  // Callback when a cell is selected
  onCellSelect: (address: string) => void;
}

// Some constants for grid dimensions and buffer sizes, abstracted because might be
// useful for parameterization if we want more optimization.
const CELL_WIDTH = 128;
const CELL_HEIGHT = 32;
const BUFFER_ROWS = 0;
const BUFFER_COLS = 0;

/**
 * Grid Component for rendering a spreadsheet-like interface
 * Handles virtualization, scrolling, and cell rendering optimization
 */
const Grid: React.FC<GridProps> = ({ user, spreadsheet, selectedCell, onCellUpdate, onCellSelect }) => {
  // Refs for DOM elements and state management
  const containerRef = useRef<HTMLDivElement>(null); // Main grid container
  const columnHeaderRef = useRef<HTMLDivElement>(null); // Column headers container
  const rowHeaderRef = useRef<HTMLDivElement>(null); // Row headers container
  const isDraggingRef = useRef(false); // Tracks drag state
  const lastMousePosRef = useRef({ x: 0, y: 0 }); // Last mouse position for drag calculation
  const rafRef = useRef<number>(); // RequestAnimationFrame reference
  const scrollPositionRef = useRef({ x: 0, y: 0 }); // Current scroll position
  const lastVisibleRangeRef = useRef({
    // Last rendered range of cells
    startRow: 0,
    endRow: 0,
    startCol: 0,
    endCol: 0,
  });

  // State for visible range of cells and scroll position
  const [visibleRange, setVisibleRange] = useState({
    startRow: 0,
    endRow: 40,
    startCol: 0,
    endCol: 20,
  });

  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  /**
   * Converts column index to letter
   */
  const getColumnLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  /**
   * Generates cell address from row and column indices
   */
  const getCellAddress = (row: number, col: number): string => {
    return `${getColumnLabel(col)}${row + 1}`;
  };

  /**
   * Gets initial cell value from our spreadsheet object
   */
  const getCellInitialValue = (address: string): string => {
    try {
      return spreadsheet.getCell(address).getInput();
    } catch {
      return '';
    }
  };

  /**
   * Updates the visible range of cells based on scroll position
   * Uses requestAnimationFrame for a little optimization for qol smoothing changes
   */
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

      // Calculate new range with buffer zones
      const newRange = {
        startRow: Math.max(0, startRow - BUFFER_ROWS),
        endRow: Math.min(1000, startRow + visibleRows + BUFFER_ROWS),
        startCol: Math.max(0, startCol - BUFFER_COLS),
        endCol: Math.min(26, startCol + visibleCols + BUFFER_COLS),
      };

      // Only update if the range has changed significantly
      const shouldUpdate =
        Math.abs(newRange.startRow - lastVisibleRangeRef.current.startRow) > BUFFER_ROWS / 2 ||
        Math.abs(newRange.startCol - lastVisibleRangeRef.current.startCol) > BUFFER_COLS / 2;

      if (shouldUpdate) {
        lastVisibleRangeRef.current = newRange;
        setVisibleRange(newRange);
      }

      setScrollPosition(scrollPositionRef.current);
    });
  }, []);

  /**
   * Handles mouse down event to initiate dragging
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !containerRef.current) return;

    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  };

  /**
   * Handles mouse movement during drag
   * Updates scroll position and header positions for smooth scrolling, not necessary but qol change
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const deltaX = lastMousePosRef.current.x - e.clientX;
      const deltaY = lastMousePosRef.current.y - e.clientY;

      containerRef.current.scrollLeft += deltaX;
      containerRef.current.scrollTop += deltaY;

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      // Update header positions directly for better movement, qol change
      if (columnHeaderRef.current) {
        columnHeaderRef.current.style.transform = `translateX(-${containerRef.current.scrollLeft}px)`;
      }
      if (rowHeaderRef.current) {
        rowHeaderRef.current.style.transform = `translateY(-${containerRef.current.scrollTop}px)`;
      }

      // Throttle visible range updates during drag
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateVisibleRange);
    },
    [updateVisibleRange]
  );

  /**
   * Handles mouse up event to end dragging
   */
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = 'default';
  }, []);

  /**
   * Sets up event listeners and cleanup
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    // Handle normal scrolling (non-drag)
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

  // Grid dimensions (These are copied from Google Sheets)
  const totalRows = 1000;
  const totalCols = 26;

  // Return for our render
  return (
    <div className="relative w-full h-[95vh] border border-gray-300">
      {/* Top-left corner cell showing selected cell address */}
      <div className="absolute top-0 left-0 w-16 h-8 bg-gray-100 border-r border-b z-30 flex items-center justify-center font-medium">
        {selectedCell || ''}
      </div>

      {/* Column headers (A, B, C, etc.) */}
      <div className="absolute top-0 left-16 right-0 h-8 bg-gray-100 border-b overflow-hidden z-20">
        <div
          ref={columnHeaderRef}
          className="absolute flex"
          style={{
            transform: `translateX(-${scrollPosition.x}px)`,
            willChange: 'transform',
          }}
        >
          {Array.from({ length: totalCols }).map((_, index) => (
            <div
              key={`header-${index}`}
              className="flex-shrink-0 w-32 h-8 border-r flex items-center justify-center font-medium"
            >
              {getColumnLabel(index)}
            </div>
          ))}
        </div>
      </div>

      {/* Row headers (1, 2, 3, etc.) */}
      <div className="absolute top-8 left-0 w-16 bottom-0 bg-gray-100 border-r overflow-hidden z-20">
        <div
          ref={rowHeaderRef}
          className="absolute"
          style={{
            transform: `translateY(-${scrollPosition.y}px)`,
            willChange: 'transform',
          }}
        >
          {Array.from({ length: totalRows }).map((_, index) => (
            <div
              key={`row-${index}`}
              className="h-8 w-16 border-b flex items-center justify-center font-medium"
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Main grid container with our cells */}
      <div
        ref={containerRef}
        className="absolute top-8 left-16 right-0 bottom-0 overflow-auto"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
      >
        <div
          className="relative"
          style={{
            width: totalCols * CELL_WIDTH,
            height: totalRows * CELL_HEIGHT,
          }}
        >
          <div className="absolute inset-0">
            {/* Render only visible rows */}
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
                    {/* Render only visible cells in each row */}
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
