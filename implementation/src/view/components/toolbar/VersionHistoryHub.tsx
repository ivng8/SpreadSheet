import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { History, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BranchEntry } from 'model/version/BranchEntry';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { User } from 'model/components/User';
import { Operation } from 'model/collaborative/SheetSyncer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { SheetSyncer } from 'model/collaborative/SheetSyncer';

interface VersionHistoryHubProps {
  spreadsheet: SpreadSheet;
  selectedCell: string | null;
  onCellUpdate: (address: string, newValue: string) => void;
  user: User;
  onSpreadsheetUpdate: () => void;
  syncer?: SheetSyncer | null;
}

interface TreeNodeProps {
  entry: BranchEntry;
  branchIndex: number;
  selectedCell: string;
  onRevert: (entryId: string) => void;
  currentUser: User;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  entry,
  branchIndex,
  selectedCell,
  onRevert,
  currentUser,
}) => {
  const renderBranchLine = (depth: number, isLast: boolean) => (
    <div
      className="absolute left-6 border-l-2 border-gray-300"
      style={{
        height: isLast ? '50%' : '100%',
        top: depth === 0 ? '50%' : '0',
      }}
    />
  );

  const getUserInitials = (name: string) => {
    return name.split('@')[0].substring(0, 2).toUpperCase();
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="relative pl-8 space-y-4">
      {entry.entries.map((version, idx) => {
        const isCurrentUser = version.getUser().getName() === currentUser.getName();
        return (
          <div key={version.getId()} className="relative">
            {idx > 0 && renderBranchLine(idx, idx === entry.entries.length - 1)}
            <div className="relative flex items-start group">
              <div
                className={`absolute -left-4 w-3 h-3 rounded-full ${isCurrentUser ? 'bg-blue-500' : 'bg-green-500'}`}
              />
              <div className="ml-4 p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow w-full">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={isCurrentUser ? 'bg-blue-100' : 'bg-green-100'}>
                      {getUserInitials(version.getUser().getName())}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">
                      {version.getUser().getName().split('@')[0]}
                      {isCurrentUser && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(new Date(version.getTimestamp()))}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {version.getEntry() || <em>Empty cell</em>}
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRevert(version.getId())}
                  >
                    Revert to this version
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const VersionHistoryHub: React.FC<VersionHistoryHubProps> = ({
  spreadsheet,
  selectedCell,
  onCellUpdate,
  user,
  onSpreadsheetUpdate,
  syncer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<BranchEntry[]>([]);

  useEffect(() => {
    if (selectedCell && isOpen) {
      try {
        const cell = spreadsheet.getCell(selectedCell);
        setHistory(cell.getVersionHistory());
      } catch (error) {
        console.error('Failed to fetch version history:', error);
        setHistory([]);
      }
    }
  }, [selectedCell, isOpen, spreadsheet]);

  useEffect(() => {
    if (!syncer || !selectedCell) return;

    const handleOperation = (operation: Operation) => {
      if (operation.address === selectedCell) {
        const cell = spreadsheet.getCell(selectedCell);
        setHistory(cell.getVersionHistory());
      }
    };

    const unsubscribe = syncer.subscribeToOperations(handleOperation);
    return () => unsubscribe();
  }, [syncer, selectedCell, spreadsheet]);

  const handleRevert = (entryId: string) => {
    if (!selectedCell) return;

    try {
      const cell = spreadsheet.getCell(selectedCell);
      let entryContent = '';
      for (const branch of history) {
        const entry = branch.entries.find(e => e.getId() === entryId);
        if (entry) {
          entryContent = entry.getEntry();
          break;
        }
      }

      cell.revert(entryId);

      if (syncer) {
        syncer.updateCell(selectedCell, entryContent);
      } else {
        onCellUpdate(selectedCell, entryContent);
      }

      onSpreadsheetUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to revert version:', error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-white hover:bg-[#169F50]"
        onClick={() => setIsOpen(true)}
        disabled={!selectedCell}
        title="Version History"
      >
        <History className="h-5 w-5" />
      </Button>

      <Dialog modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Version History for Cell {selectedCell}
              {syncer && syncer.isConnected() && (
                <span className="text-sm text-green-500 font-normal">• Collaborative mode</span>
              )}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            {history.length > 0 ? (
              <div className="space-y-6">
                {history.map((branch, index) => (
                  <TreeNode
                    key={index}
                    entry={branch}
                    branchIndex={index}
                    selectedCell={selectedCell!}
                    onRevert={handleRevert}
                    currentUser={user}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                No version history available for this cell
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VersionHistoryHub;