/* eslint-disable no-undef */
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "../../shadcnui/button"
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

  const cell = useMemo(() => {
    return new Cell(address, initialInput, spreadsheet);
  }, [address, initialInput, spreadsheet]);

  const handleSelect = () => {
    onSelect(address);
    onAddressChange?.(address)
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (inputValue !== cell.getInput()) {
      onUpdate(address, inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    switch (e.key) {
      case 'Enter':
        if (!isEditing) {
          startEditing();
        } else {
          handleBlur();
          cell.updateContents(inputValue);
        }
        break;
      case 'Escape':
        if (isEditing) {
          setInputValue('');
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

  const displayValue = useCallback(() => {
    try {
      return cell.getValue();
    } catch (error) {
      console.log(error);
      return '#ERROR';
    }
  }, [cell]);

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
      aria-label={`Cell ${address}, value: ${displayValue()}`}
      aria-selected={isSelected}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
    >
      <div className="w-full px-2 py-1 text-left">
        <span className="block truncate">
          {displayValue()}
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

// Main export with proper grid role
export const CellComponent = React.memo((props: CellProps) => (
  <CellErrorBoundary>
    <CellView {...props} />
  </CellErrorBoundary>
));

export default CellComponent;