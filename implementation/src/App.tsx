// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import Grid from './view/components/grid/Grid';
import { SpreadSheet } from 'model/components/SpreadSheet';
import { Cell } from 'model/components/Cell';
import SpreadsheetToolbar from './view/components/toolbar/SpreadsheetToolbar';
import { SheetSyncer } from 'model/collaborative/SheetSyncer';

const App: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [sessionCode, setSessionCode] = useState('');
  const [currentSessionCode, setCurrentSessionCode] = useState<string | null>(null);
  const modelRef = useRef<SheetSyncer | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);

  const initializeGrid = () => {
    const grid = new Map<string, Cell>();
    for (let row = 0; row < 1000; row++) {
      for (let col = 0; col < 26; col++) {
        const colLabel = String.fromCharCode(65 + col);
        const address = `${colLabel}${row + 1}`;
        grid.set(address, new Cell('', null as any));
      }
    }
    const spreadsheet = new SpreadSheet(grid);
    grid.forEach((cell, address) => {
      grid.set(address, new Cell('', spreadsheet));
    });
    return spreadsheet;
  };

  const [spreadsheet] = useState(() => initializeGrid());
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const handleSpreadsheetUpdate = () => {
    setUpdateCounter(prev => prev + 1);
  };

  const connectToSession = async (sessionId: string | null = null) => {
    try {
      setIsConnecting(true);

      if (!modelRef.current) {
        modelRef.current = new SheetSyncer(spreadsheet, nanoid());
      }

      const newSessionId = await modelRef.current.connect('ws://localhost:8080', sessionId);
      setCurrentSessionCode(newSessionId);
      setShowJoinDialog(false);
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateSession = () => {
    connectToSession();
  };

  const handleJoinSession = () => {
    if (sessionCode.length > 0) {
      connectToSession(sessionCode);
    }
  };

  useEffect(() => {
    if (!modelRef.current) return;

    const handleRemoteChange = (operation: any) => {
      const cell = spreadsheet.getCell(operation.address);
      if (cell) {
        modelRef.current?.handleRemoteOperation(operation);
        handleSpreadsheetUpdate();
      }
    };

    const unsubscribe = modelRef.current.subscribeToOperations(handleRemoteChange);
    return () => unsubscribe();
  }, [spreadsheet]);

  const handleCellUpdate = (address: string, newValue: string) => {
    try {
      modelRef.current?.updateCell(address, newValue);
      handleSpreadsheetUpdate();
    } catch (error) {
      console.error(`Error updating cell ${address}:`, error);
    }
  };

  const handleCellSelect = (address: string) => {
    setSelectedCell(address);
  };

  if (showJoinDialog) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Join or Create Session</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Code</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Enter session code"
                  value={sessionCode}
                  onChange={e => setSessionCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoinSession()}
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleJoinSession}
                  disabled={isConnecting}
                >
                  Join
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            <button
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={handleCreateSession}
              disabled={isConnecting}
            >
              Create New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <SpreadsheetToolbar
        spreadsheet={spreadsheet}
        selectedCell={selectedCell}
        onCellUpdate={handleCellUpdate}
        sessionCode={currentSessionCode}
        isConnected={modelRef.current?.isConnected()}
        onShareClick={() => {
          if (currentSessionCode) {
            navigator.clipboard.writeText(currentSessionCode);
          }
        }}
        user={modelRef.current?.getUser()}
        onSpreadsheetUpdate={handleSpreadsheetUpdate}
      />
      <div className="flex-1 overflow-hidden">
        <Grid
          key={updateCounter}
          spreadsheet={spreadsheet}
          selectedCell={selectedCell}
          onCellUpdate={handleCellUpdate}
          onCellSelect={handleCellSelect}
          user={modelRef.current?.getUser()}
        />
      </div>
    </div>
  );
};

export default App;