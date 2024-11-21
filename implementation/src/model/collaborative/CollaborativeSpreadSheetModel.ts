// src/model/collaborative/CollaborativeSpreadsheetModel.ts
import { SpreadSheet } from '../components/SpreadSheet';
import { Cell } from '../components/Cell';
import { User } from '../components/User';
import { MergeConflictResolver } from '../conflicts/MergeConflictResolver';
import { MergeConflict } from '../conflicts/MergeConflict';

export type Operation = {
  type: 'UPDATE_CELL' | 'DELETE_CELL';
  address: string;
  value: string;
  timestamp: number;
  userId: string;
};

export type SessionEvent = {
  type: 'USER_JOINED' | 'USER_LEFT' | 'SESSION_CREATED';
  userId: string;
  sessionId?: string;
};

export class CollaborativeSpreadsheetModel {
  private spreadsheet: SpreadSheet;
  private pendingOperations: Operation[];
  private user: User;
  private wsConnection: WebSocket | null = null;
  private cellSubscribers: Map<string, Set<(value: string) => void>>;
  private operationSubscribers: Set<(operation: Operation) => void>;
  private sessionSubscribers: Set<(event: SessionEvent) => void>;
  private conflictResolver: MergeConflictResolver;
  private sessionId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 1000;

  constructor(spreadsheet: SpreadSheet, userId: string) {
    this.spreadsheet = spreadsheet;
    this.user = new User(userId, userId + "@example.com");
    this.pendingOperations = [];
    this.cellSubscribers = new Map();
    this.operationSubscribers = new Set();
    this.sessionSubscribers = new Set();
    this.conflictResolver = new MergeConflictResolver();
  }

  public async connect(url: string, sessionId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.wsConnection = new WebSocket(url);

        this.wsConnection.onopen = () => {
          console.log('Connected to WebSocket server');
          this.reconnectAttempts = 0;
          this.reconnectTimeout = 1000;

          if (sessionId) {
            this.joinSession(sessionId);
            // Request initial state after joining
            this.requestSync();
            resolve(sessionId);
          } else {
            this.createSession();
          }
        };

        this.wsConnection.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'SESSION_CREATED':
              this.sessionId = data.sessionId;
              resolve(data.sessionId);
              break;

            case 'SYNC_STATE':
              this.applyInitialState(data.state);
              break;

            case 'OPERATION':
              if (data.userId !== this.user.getName()) {
                this.handleRemoteOperation(data.operation);
              }
              break;

            case 'USER_JOINED':
            case 'USER_LEFT':
              this.notifySessionSubscribers(data);
              break;
          }
        };

        // ... (rest of connect method remains the same)
      } catch (error) {
        reject(error);
      }
    });
  }

  private createSession() {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      // Get initial state from current spreadsheet
      const initialState = this.getCurrentState();
      
      this.wsConnection.send(JSON.stringify({
        type: 'CREATE_SESSION',
        userId: this.user.getName(),
        initialState
      }));
    }
  }

  private requestSync() {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'REQUEST_SYNC'
      }));
    }
  }

  private getCurrentState(): { [address: string]: string } {
    const state: { [address: string]: string } = {};
    // Get all non-empty cells
    for (let row = 0; row < 1000; row++) {
      for (let col = 0; col < 26; col++) {
        const colLabel = String.fromCharCode(65 + col);
        const address = `${colLabel}${row + 1}`;
        try {
          const value = this.spreadsheet.getCell(address).getInput();
          if (value) {
            state[address] = value;
          }
        } catch (error) {
          console.error(`Error getting cell ${address}:`, error);
        }
      }
    }
    return state;
  }

  private applyInitialState(state: { [address: string]: string }) {
    Object.entries(state).forEach(([address, value]) => {
      try {
        const cell = this.spreadsheet.getCell(address);
        cell.updateContents(value, this.user);
      } catch (error) {
        console.error(`Error applying initial state to cell ${address}:`, error);
      }
    });
  }

  private joinSession(sessionId: string) {
    this.sessionId = sessionId;
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'JOIN_SESSION',
        sessionId,
        userId: this.user.getName()
      }));
    }
  }

  public updateCell(address: string, value: string): void {
    const operation: Operation = {
      type: 'UPDATE_CELL',
      address,
      value,
      timestamp: Date.now(),
      userId: this.user.getName()
    };

    this.applyOperation(operation);
    this.pendingOperations.push(operation);
    this.notifyOperationSubscribers(operation);

    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'OPERATION',
        operation,
        sessionId: this.sessionId
      }));
    }
  }

  public handleRemoteOperation(operation: Operation): void {
    const conflictingOp = this.pendingOperations.find(
      pending => pending.address === operation.address
    );

    if (conflictingOp) {
      if (operation.timestamp > conflictingOp.timestamp) {
        const conflict = new MergeConflict(
          operation.address,
          this.spreadsheet.getCell(operation.address),
          new Cell(operation.value, this.spreadsheet)
        );

        this.conflictResolver.addConflicts([conflict]);
        this.conflictResolver.resolve().then(resolutions => {
          resolutions.forEach((resolvedCell, address) => {
            this.spreadsheet.getCell(address).updateContents(
              resolvedCell.getInput(),
              this.user
            );
          });
        });
      }
    } else {
      this.applyOperation(operation);
    }
  }

  private applyOperation(operation: Operation): void {
    const cell = this.spreadsheet.getCell(operation.address);
    cell.updateContents(operation.value, this.user);

    const subscribers = this.cellSubscribers.get(operation.address);
    if (subscribers) {
      subscribers.forEach(callback => callback(operation.value));
    }
  }

  public subscribeToCellChanges(address: string, callback: (value: string) => void): () => void {
    if (!this.cellSubscribers.has(address)) {
      this.cellSubscribers.set(address, new Set());
    }
    this.cellSubscribers.get(address)!.add(callback);

    return () => {
      const subscribers = this.cellSubscribers.get(address);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.cellSubscribers.delete(address);
        }
      }
    };
  }

  public subscribeToOperations(callback: (operation: Operation) => void): () => void {
    this.operationSubscribers.add(callback);
    return () => {
      this.operationSubscribers.delete(callback);
    };
  }

  public subscribeToSession(callback: (event: SessionEvent) => void): () => void {
    this.sessionSubscribers.add(callback);
    return () => {
      this.sessionSubscribers.delete(callback);
    };
  }

  private notifyOperationSubscribers(operation: Operation): void {
    this.operationSubscribers.forEach(callback => callback(operation));
  }

  private notifySessionSubscribers(event: SessionEvent): void {
    this.sessionSubscribers.forEach(callback => callback(event));
  }

  public getSessionId(): string | null {
    return this.sessionId;
  }

  public getUser(): User {
    return this.user;
  }

  public isConnected(): boolean {
    return this.wsConnection?.readyState === WebSocket.OPEN;
  }

  public disconnect(): void {
    this.wsConnection?.close();
  }

  public getSpreadsheet(): SpreadSheet {
    return this.spreadsheet;
  }

  public getPendingOperations(): Operation[] {
    return [...this.pendingOperations];
  }
}