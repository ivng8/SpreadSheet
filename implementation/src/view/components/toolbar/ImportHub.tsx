import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { User } from 'model/components/User';
import { MergeConflictResolver } from 'model/conflicts/MergeConflictResolver';
import MergeConflictDialog from './MergeConflictDialog';
import { MergeConflict } from 'model/conflicts/MergeConflict';

interface ImportHubProps {
  spreadsheet: SpreadSheet;
  selectedCell: string | null;
  onCellUpdate: (address: string, newValue: string) => void;
  user: User;
  onSpreadsheetUpdate: () => void;
}

const ImportHub: React.FC<ImportHubProps> = ({
  spreadsheet,
  selectedCell,
  onCellUpdate,
  user,
  onSpreadsheetUpdate,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [conflicts, setConflicts] = useState<MergeConflict[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolverRef = useRef<MergeConflictResolver | null>(null);
  const dragCounterRef = useRef(0);

  const handleImport = async (file: File) => {
    if (!selectedCell) return;

    setIsImporting(true);
    try {
      // Create new resolver for this import
      const resolver = new MergeConflictResolver();
      resolverRef.current = resolver;

      // Set up conflict handling before import
      resolver.onConflict((conflict, resolveConflict) => {
        console.log("Conflict detected:", conflict);
        setConflicts(prev => {
          if (!prev.find(c => c.getCell() === conflict.getCell())) {
            return [...prev, conflict];
          }
          return prev;
        });
        setShowConflicts(true);
      });

      // Pass the resolver to import
      await spreadsheet.import(file, selectedCell, user, resolver);
      
      // Only update if there were no conflicts
      if (!resolver.hasPendingConflicts()) {
        onSpreadsheetUpdate();
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounterRef.current++;
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounterRef.current--;
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounterRef.current = 0;
    
    if (!selectedCell) return;

    const file = event.dataTransfer.files[0];
    if (!file || !(file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      return;
    }

    handleImport(file);
  };

  const handleConflictResolution = async (conflict: MergeConflict, useOriginal: boolean) => {
    if (!resolverRef.current) return;

    console.log("Resolving conflict:", conflict.getCell(), useOriginal);

    // Apply the chosen value
    const cell = conflict.use(useOriginal);
    onCellUpdate(conflict.getCell(), cell.getInput());
    
    // Update UI state
    setConflicts(prev => prev.filter(c => c.getCell() !== conflict.getCell()));
    
    // Resolve this specific conflict
    resolverRef.current.resolveConflict(conflict.getCell(), useOriginal);
    
    // If this was the last conflict, close dialog and update
    if (conflicts.length <= 1) {
      setShowConflicts(false);
      onSpreadsheetUpdate();
    }
  };

  const handleDialogClose = () => {
    // If there are pending conflicts, resolve them all with original values
    if (resolverRef.current && conflicts.length > 0) {
      conflicts.forEach(conflict => {
        handleConflictResolution(conflict, true);
      });
    }
    setShowConflicts(false);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept=".xlsx,.xls"
        className="hidden"
      />

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
          onClick={() => fileInputRef.current?.click()}
          disabled={!selectedCell || isImporting}
          title="Import Spreadsheet"
        >
          <FileUp className="h-5 w-5" />
        </Button>
      </div>

      <MergeConflictDialog
        isOpen={showConflicts && conflicts.length > 0}
        onClose={handleDialogClose}
        conflicts={conflicts}
        onResolve={handleConflictResolution}
      />
    </>
  );
};

export default ImportHub;