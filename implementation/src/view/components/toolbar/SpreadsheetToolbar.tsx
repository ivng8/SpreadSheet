import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Edit2,
  Search,
  Pencil,
  Scissors,
  Copy,
  ClipboardPaste,
  Underline,
  AlignLeft,
  Users,
  Share2,
} from 'lucide-react';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { User } from 'model/components/User';

interface SpreadsheetToolbarProps {
  spreadsheet: SpreadSheet;
  selectedCell: string | null;
  onCellUpdate: (address: string, newValue: string) => void;
  sessionCode?: string | null;
  isConnected?: boolean;
  onShareClick?: () => void;
  user: User
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
  spreadsheet,
  selectedCell,
  onCellUpdate,
  sessionCode,
  isConnected = false,
  onShareClick,
  user,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [clipboardContent, setClipboardContent] = useState<string>('');
  const [isUnderlined, setIsUnderlined] = useState(false);
  const [isAlignedLeft, setIsAlignedLeft] = useState(false);

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSearch = () => {
    setIsSearchMode(!isSearchMode);
    // TODO: Search Functionality
  };

  const handleCut = () => {
    if (selectedCell) {
      try {
        const cell = spreadsheet.getCell(selectedCell);
        setClipboardContent(cell.getInput());
        spreadsheet.clearCell(selectedCell, user); // Temp null for users cause not implemented yet
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
      } catch (error) {
        console.error('Paste operation failed:', error);
      }
    }
  };

  const handleUnderline = () => {
    setIsUnderlined(!isUnderlined);
    // TODO: Underline Text
  };

  const handleAlignLeft = () => {
    setIsAlignedLeft(!isAlignedLeft);
    // TODO: Aligned text
  };

  return (
    <div className="w-full bg-[#169F50] py-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
          {/* First hub - 2 icons */}
          <div className="bg-[#2DA961] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-full text-white ${isEditMode ? 'bg-[#169F50]' : 'hover:bg-[#169F50]'}`}
              onClick={handleEditMode}
            >
              <Edit2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-full text-white ${isSearchMode ? 'bg-[#169F50]' : 'hover:bg-[#169F50]'}`}
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Second hub - 4 icons */}
          <div className="bg-[#2DA961] rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
              onClick={handleEditMode}
            >
              <Pencil className="h-5 w-5" />
            </Button>
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
          </div>

          {/* Third hub - 2 icons */}
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
