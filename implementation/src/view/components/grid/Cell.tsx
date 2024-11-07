/* eslint-disable no-undef */
import React, { useState, useCallback, useMemo } from 'react';
import { Cell } from 'model/Cell'; // Adjust path as needed
import { SpreadSheet } from 'model/SpreadSheet';
import '../../../index.css'

interface CellProps {
  address: string;
  initialInput: string;
  spreadsheet: SpreadSheet;
  onUpdate: (address: string, newValue: string) => void;
  isSelected: boolean;
  onSelect: (address: string) => void;
}

const CellView: React.FC<CellProps> = ({
  address,
  initialInput,
  spreadsheet,
  onUpdate,
  isSelected,
  onSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialInput);

  // Memoize cell instance
  const cell = useMemo(() => {
    return new Cell(address, initialInput, spreadsheet);
  }, [address, initialInput, spreadsheet]);

  const handleSelect = () => {
    onSelect(address);
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
        }
        break;
      case 'Escape':
        if (isEditing) {
          setInputValue(cell.getInput());
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
    <button
      type="button"
      className={`w-full h-full px-2 py-1 text-left border ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={handleSelect}
      onDoubleClick={startEditing}
      onKeyDown={handleKeyDown}
      aria-label={`Cell ${address}, value: ${displayValue()}`}
      aria-selected={isSelected}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
    >
      <span className="block truncate">
        {displayValue()}
      </span>
    </button>
  );
};

// Error boundary component
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
        <button
          type="button"
          className="w-full h-full px-2 py-1 text-left text-red-500 border border-red-200"
          aria-label="Error in cell"
          role="gridcell"
        >
          #ERROR
        </button>
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