import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Scissors,
  Copy,
  ClipboardPaste,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Underline,
  AlignLeft,
  Users,
  Share2,
  Trash2,
} from 'lucide-react';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { User } from 'model/components/User';
import { Utility } from 'model/Utility';

interface SpreadsheetToolbarProps {
  spreadsheet: SpreadSheet;
  selectedCell: string | null;
  onCellUpdate: (address: string, newValue: string) => void;
  sessionCode?: string | null;
  isConnected?: boolean;
  onShareClick?: () => void;
  user: User;
  onSpreadsheetUpdate: () => void;
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
  spreadsheet,
  selectedCell,
  onCellUpdate,
  sessionCode,
  isConnected = false,
  onShareClick,
  user,
  onSpreadsheetUpdate,
}) => {
  const [clipboardContent, setClipboardContent] = useState<string>('');
  const [isUnderlined, setIsUnderlined] = useState(false);
  const [isAlignedLeft, setIsAlignedLeft] = useState(false);

  const handleCut = () => {
    if (selectedCell) {
      try {
        const cell = spreadsheet.getCell(selectedCell);
        setClipboardContent(cell.getInput());
        spreadsheet.clearCell(selectedCell, user);
        onSpreadsheetUpdate();
      } catch (error) {
        console.error('Cut operation failed:', error);
      }
    }
  };

  const handleCopy = () => {
    if (selectedCell) {
      try {
        const cell = spreadsheet.getCell(selectedCell);
        setClipboardContent(cell.getInput());
      } catch (error) {
        console.error('Copy operation failed:', error);
      }
    }
  };

  const handlePaste = () => {
    if (selectedCell && clipboardContent) {
      try {
        onCellUpdate(selectedCell, clipboardContent);
        onSpreadsheetUpdate();
      } catch (error) {
        console.error('Paste operation failed:', error);
      }
    }
  };

  const handleAddColumnLeft = () => {
    if (selectedCell) {
      const [letter] = selectedCell.match(/[A-Za-z]+/) || [];
      const colIndex = Utility.columnLetterToNumber(letter);
      spreadsheet.insertColumn(colIndex, user);
      onSpreadsheetUpdate();
    }
  };

  const handleAddColumnRight = () => {
    if (selectedCell) {
      const [letter] = selectedCell.match(/[A-Za-z]+/) || [];
      const colIndex = Utility.columnLetterToNumber(letter);
      spreadsheet.insertColumn(colIndex + 1, user);
      onSpreadsheetUpdate();
    }
  };

  const handleDeleteColumn = () => {
    if (selectedCell) {
      const [letter] = selectedCell.match(/[A-Za-z]+/) || [];
      const colIndex = Utility.columnLetterToNumber(letter);
      spreadsheet.deleteColumn(colIndex, user);
      onSpreadsheetUpdate();
    }
  };

  const handleAddRowAbove = () => {
    if (selectedCell) {
      const rowIndex = parseInt(selectedCell.match(/\d+/)?.[0] || '0');
      spreadsheet.insertRow(rowIndex, user);
      onSpreadsheetUpdate();
    }
  };

  const handleAddRowBelow = () => {
    if (selectedCell) {
      const rowIndex = parseInt(selectedCell.match(/\d+/)?.[0] || '0');
      spreadsheet.insertRow(rowIndex + 1, user);
      onSpreadsheetUpdate();
    }
  };

  const handleDeleteRow = () => {
    if (selectedCell) {
      const rowIndex = parseInt(selectedCell.match(/\d+/)?.[0] || '0');
      spreadsheet.deleteRow(rowIndex, user);
      onSpreadsheetUpdate();
    }
  };

  const handleUnderline = () => {
    setIsUnderlined(!isUnderlined);
    onSpreadsheetUpdate();
  };

  const handleAlignLeft = () => {
    setIsAlignedLeft(!isAlignedLeft);
    onSpreadsheetUpdate();
  };

  return (
    <div className="w-full bg-[#169F50] py-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
          {/* Clipboard operations */}
          <div className="bg-[#2DA961] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleCut}
              disabled={!selectedCell}
            >
              <Scissors className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleCopy}
              disabled={!selectedCell}
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handlePaste}
              disabled={!selectedCell || !clipboardContent}
            >
              <ClipboardPaste className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
            >
              <Pencil className="h-5 w-5" />
            </Button>
          </div>

          {/* Column operations */}
          <div className="bg-[#2DA961] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleAddColumnLeft}
              disabled={!selectedCell}
              title="Insert column to the left"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleAddColumnRight}
              disabled={!selectedCell}
              title="Insert column to the right"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleDeleteColumn}
              disabled={!selectedCell}
              title="Delete column"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Row operations */}
          <div className="bg-[#2DA961] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleAddRowAbove}
              disabled={!selectedCell}
              title="Insert row above"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleAddRowBelow}
              disabled={!selectedCell}
              title="Insert row below"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleDeleteRow}
              disabled={!selectedCell}
              title="Delete row"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Formatting operations */}
          <div className="bg-[#2DA961] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-full text-white ${isUnderlined ? 'bg-[#169F50]' : 'hover:bg-[#169F50]'}`}
              onClick={handleUnderline}
              disabled={!selectedCell}
            >
              <Underline className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-full text-white ${isAlignedLeft ? 'bg-[#169F50]' : 'hover:bg-[#169F50]'}`}
              onClick={handleAlignLeft}
              disabled={!selectedCell}
            >
              <AlignLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Session status hub */}
        <div className="bg-[#2DA961] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
          <div className="flex items-center gap-2 text-white">
            <span
              className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
            />
            {sessionCode && <span className="font-medium tracking-wide">{sessionCode}</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
            onClick={onShareClick}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetToolbar;
