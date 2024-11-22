import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MergeConflict } from 'model/conflicts/MergeConflict';
import { Card } from '@/components/ui/card';

interface MergeConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: MergeConflict[];
  onResolve: (conflict: MergeConflict, useOriginal: boolean) => void;
}

const MergeConflictDialog: React.FC<MergeConflictDialogProps> = ({
  isOpen,
  onClose,
  conflicts,
  onResolve,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Resolve Import Conflicts</DialogTitle>
          <div className="text-sm text-gray-500">
            Select which version to keep for each conflicting cell
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4">
          <div className="grid grid-cols-1 gap-4 p-4">
            {conflicts.map(conflict => (
              <Card key={conflict.getCell()} className="w-full">
                <div className="p-4">
                  <div className="font-medium mb-4">Cell {conflict.getCell()}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Current Value</div>
                      <div className="p-3 bg-gray-50 rounded-md mb-2 min-h-[40px]">
                        {conflict.use(true).getInput() || <em>Empty</em>}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onResolve(conflict, true)}
                      >
                        Keep Current
                      </Button>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Imported Value</div>
                      <div className="p-3 bg-gray-50 rounded-md mb-2 min-h-[40px]">
                        {conflict.use(false).getInput() || <em>Empty</em>}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onResolve(conflict, false)}
                      >
                        Use Imported
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MergeConflictDialog;
