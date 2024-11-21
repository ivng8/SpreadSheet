// server.ts
import { WebSocket, WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';

interface Client {
  ws: WebSocket;
  userId: string;
  sessionId: string;
}

interface SessionState {
  cells: { [address: string]: string };
  clients: Set<Client>;
}

class CollaborationServer {
  private wss: WebSocketServer;
  private sessions: Map<string, SessionState> = new Map();
  private clientSessions: Map<string, string> = new Map(); // userId -> sessionId

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupServer();
  }

  private setupServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      let client: Client | null = null;

      console.log('New WebSocket connection established');

      ws.on('message', (message: string) => {
        const data = JSON.parse(message);
        const userId = data.userId;
        
        // Check if user is already in a session
        const existingSessionId = this.clientSessions.get(userId);
        
        switch (data.type) {
          case 'JOIN_SESSION':
            if (client) {
              console.log(`Client ${userId} already connected, ignoring JOIN_SESSION`);
              return;
            }
            
            client = {
              ws,
              userId: userId,
              sessionId: data.sessionId
            };
            this.joinSession(client);
            console.log(`User ${userId} joined session ${data.sessionId}`);
            break;

          case 'CREATE_SESSION':
            if (existingSessionId) {
              console.log(`User ${userId} already has session ${existingSessionId}, reconnecting`);
              client = {
                ws,
                userId: userId,
                sessionId: existingSessionId
              };
              this.joinSession(client);
              ws.send(JSON.stringify({
                type: 'SESSION_CREATED',
                sessionId: existingSessionId
              }));
            } else {
              const sessionId = nanoid();
              client = {
                ws,
                userId: userId,
                sessionId
              };
              this.createSession(client, data.initialState);
              this.clientSessions.set(userId, sessionId);
              ws.send(JSON.stringify({
                type: 'SESSION_CREATED',
                sessionId
              }));
              console.log(`User ${userId} created new session ${sessionId}`);
            }
            break;

          case 'OPERATION':
            if (client) {
              this.handleOperation(client, data.operation);
            }
            break;

          case 'REQUEST_SYNC':
            if (client) {
              this.sendInitialState(client);
            }
            break;
        }
      });

      ws.on('close', () => {
        if (client) {
          console.log(`WebSocket closed for user ${client.userId}`);
          this.leaveSession(client);
          // Don't remove from clientSessions to maintain session association
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (client) {
          this.leaveSession(client);
        }
      });
    });

    console.log('WebSocket server running on port 8080');
  }

  private createSession(client: Client, initialState: { [address: string]: string }) {
    const sessionState: SessionState = {
      cells: initialState || {},
      clients: new Set([client])
    };
    this.sessions.set(client.sessionId, sessionState);
  }

  private joinSession(client: Client) {
    const session = this.sessions.get(client.sessionId);
    if (!session) {
      // If session doesn't exist, create it
      this.sessions.set(client.sessionId, {
        cells: {},
        clients: new Set([client])
      });
    } else {
      session.clients.add(client);
    }

    this.sendInitialState(client);
    
    this.broadcastToSession(client.sessionId, {
      type: 'USER_JOINED',
      userId: client.userId
    }, client);
  }

  private leaveSession(client: Client) {
    const session = this.sessions.get(client.sessionId);
    if (session) {
      session.clients.delete(client);
      
      if (session.clients.size === 0) {
        // Only delete session data if there are no connected clients
        console.log(`Last client left session ${client.sessionId}, preserving session data`);
      } else {
        this.broadcastToSession(client.sessionId, {
          type: 'USER_LEFT',
          userId: client.userId
        }, client);
      }
    }
  }

  private sendInitialState(client: Client) {
    const session = this.sessions.get(client.sessionId);
    if (session) {
      client.ws.send(JSON.stringify({
        type: 'SYNC_STATE',
        state: session.cells
      }));
    }
  }

  private handleOperation(client: Client, operation: any) {
    const session = this.sessions.get(client.sessionId);
    if (session) {
      // Update server state
      session.cells[operation.address] = operation.value;

      // Broadcast to all clients
      this.broadcastToSession(client.sessionId, {
        type: 'OPERATION',
        operation,
        userId: client.userId
      }, client);
    }
  }

  private broadcastToSession(sessionId: string, message: any, exclude?: Client) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.clients.forEach(client => {
        if (client !== exclude && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
        }
      });
    }
  }
}

new CollaborationServer(8080);