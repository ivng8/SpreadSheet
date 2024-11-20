import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Cell } from 'model/components/Cell';
import { SpreadSheet } from 'model/components/SpreadSheet';
import '../../../index.css'

interface CellProps {
  address: string;
  initialInput: string;
  spreadsheet: SpreadSheet;
  onUpdate: (address: string, newValue: string) => void;
  isSelected: boolean;
  onSelect: (address: string) => void;
  onAddressChange?: (address: string) => void;
}

const CellView: React.FC<CellProps> = ({
  address,
  initialInput,
  spreadsheet,
  onUpdate,
  isSelected,
  onSelect,
  onAddressChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialInput);
  const [displayedValue, setDisplayedValue] = useState<string | number>('');

  // Create memoized cell instance
  const cell = useMemo(() => {
    return spreadsheet.getCell(address);
  }, [address, spreadsheet]);

  // Subscribe to cell value changes
  useEffect(() => {
    const handleValueChange = (newValue: any) => {
      setDisplayedValue(newValue);
    };

    const handleCellChange = (updatedCell: Cell) => {
      setInputValue(updatedCell.getInput());
      setDisplayedValue(updatedCell.getValue());
    };

    // Initial value
    setInputValue(cell.getInput());
    setDisplayedValue(cell.getValue());

    // Subscribe to both value and cell changes
    cell.subscribeToValue(handleValueChange);
    cell.subscribe(handleCellChange);

    // Cleanup subscriptions
    return () => {
      cell.unsubscribeFromValue(handleValueChange);
      cell.unsubscribe(handleCellChange);
    };
  }, [cell]);

  const handleCellUpdate = (newValue: string) => {
    if (newValue !== cell.getInput()) {
      onUpdate(address, newValue);
      setInputValue(newValue);
      cell.updateContents(newValue, null); // Update local cell
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

  const getDisplayValue = useCallback(() => {
    try {
      return displayedValue?.toString() || '';
    } catch (error) {
      console.error(error);
      return '#ERROR';
    }
  }, [displayedValue]);

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

  return (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      className={`w-full h-full p-0 m-0 font-normal hover:bg-blue-50 rounded-none border border-gray-200 ${
        isSelected ? 'bg-blue-50 border-blue-500' : ''
      }`}
      onClick={handleSelect}
      onDoubleClick={startEditing}
      onKeyDown={handleKeyDown}
      aria-label={`Cell ${address}, value: ${getDisplayValue()}`}
      aria-selected={isSelected}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
    >
      <div className="w-full px-2 py-1 text-left">
        <span className="block truncate">
          {getDisplayValue()}
        </span>
      </div>
    </Button>
  );
};

class CellErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Cell Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Button
          variant="ghost"
          className="w-full h-full p-0 m-0 rounded-none border border-gray-200"
          aria-label="Error in cell"
          role="gridcell"
        >
          <div className="w-full px-2 py-1 text-left text-red-500 hover:text-red-600 hover:bg-red-50">
            #ERROR
          </div>
        </Button>
      );
    }
    return this.props.children;
  }
}

export const CellComponent = React.memo((props: CellProps) => (
  <CellErrorBoundary>
    <CellView {...props} />
  </CellErrorBoundary>
));

export default CellComponent;