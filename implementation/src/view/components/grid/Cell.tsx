import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Cell } from 'model/components/Cell';
import { SpreadSheet } from 'model/components/SpreadSheet';
import '../../../index.css';
import { User } from 'model/components/User';

interface CellProps {
  user: User;
  address: string;
  initialInput: string;
  spreadsheet: SpreadSheet;
  onUpdate: (address: string, newValue: string) => void;
  isSelected: boolean;
  onSelect: (address: string) => void;
  onAddressChange?: (address: string) => void;
}

const CellView: React.FC<CellProps> = ({
  user,
  address,
  initialInput,
  spreadsheet,
  onUpdate,
  isSelected,
  onSelect,
  onAddressChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialInput);
  const [displayedValue, setDisplayedValue] = useState<string | number>('');
  const [hasError, setHasError] = useState(false);

  // Create memoized cell instance
  const cell = useMemo(() => {
    return spreadsheet.getCell(address);
  }, [address, spreadsheet]);

  // Subscribe to cell value changes
  useEffect(() => {
    const handleValueChange = (newValue: any) => {
      setDisplayedValue(newValue);
      setHasError(cell.hasError());
    };

    const handleCellChange = (updatedCell: Cell) => {
      setInputValue(updatedCell.getInput());
      const value = updatedCell.getValue();
      setDisplayedValue(value);
      setHasError(updatedCell.hasError());
    };

    // Initial value
    setInputValue(cell.getInput());
    const initialValue = cell.getValue();
    setDisplayedValue(initialValue);
    setHasError(cell.hasError());

    // Subscribe to both value and cell changes
    cell.subscribeToValue(handleValueChange);
    cell.subscribe(handleCellChange);

    // Cleanup subscriptions
    return () => {
      cell.unsubscribeFromValue(handleValueChange);
      cell.unsubscribe(handleCellChange);
    };
  }, [cell]); // Only depend on cell instance

  const handleCellUpdate = (newValue: string) => {
    if (newValue !== cell.getInput()) {
      onUpdate(address, newValue);
      setInputValue(newValue);
      cell.updateContents(newValue, user);
    }
  };

  const handleSelect = () => {
    onSelect(address);
    onAddressChange?.(address);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    handleCellUpdate(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    switch (e.key) {
      case 'Enter':
        if (!isEditing) {
          startEditing();
        } else {
          setIsEditing(false);
          handleCellUpdate(inputValue);
          e.preventDefault();
        }
        break;
      case 'Escape':
        if (isEditing) {
          setInputValue(cell.getInput()); // Reset to original value
          setIsEditing(false);
        }
        break;
      case ' ': // Space
        if (!isEditing) {
          e.preventDefault();
          startEditing();
        }
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label={`Cell ${address}`}
        className="w-full h-full px-2 py-1 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
    );
  }

  if (hasError) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isSelected ? 'secondary' : 'ghost'}
              className={`w-full h-full p-0 m-0 font-normal hover:bg-red-50 rounded-none border border-red-200 bg-red-50 ${
                isSelected ? 'border-red-500' : ''
              }`}
              onClick={handleSelect}
              onDoubleClick={startEditing}
              onKeyDown={handleKeyDown}
              aria-label={`Cell ${address}, error in formula`}
              aria-selected={isSelected}
              role="gridcell"
              tabIndex={isSelected ? 0 : -1}
            >
              <div className="w-full px-2 py-1 text-left flex items-center justify-between">
                <span className="text-gray-500 truncate">{inputValue}</span>
                <span className="text-red-500 font-medium ml-1">ERROR</span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="bg-red-50 border border-red-200 text-red-600 p-2"
          >
            {cell.getValue()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={isSelected ? 'secondary' : 'ghost'}
      className={`w-full h-full p-0 m-0 font-normal hover:bg-blue-50 rounded-none border border-gray-200 ${
        isSelected ? 'bg-blue-50 border-blue-500' : ''
      }`}
      onClick={handleSelect}
      onDoubleClick={startEditing}
      onKeyDown={handleKeyDown}
      aria-label={`Cell ${address}, value: ${displayedValue}`}
      aria-selected={isSelected}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
    >
      <div className="w-full px-2 py-1 text-left">
        <span className="block truncate">{displayedValue?.toString() || ''}</span>
      </div>
    </Button>
  );
};

export const CellComponent = React.memo(CellView, (prevProps, nextProps) => {
  return (
    prevProps.address === nextProps.address &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.initialInput === nextProps.initialInput &&
    prevProps.user === nextProps.user &&
    prevProps.spreadsheet === nextProps.spreadsheet
  );
});

export default CellComponent;