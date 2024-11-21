export interface UserPresence {
    userId: string;
    cursor?: { x: number; y: number };
    selection?: string | null;
    lastActivity: number;
}

export type UserPresenceUpdate = {
    type: 'CURSOR_MOVE' | 'CELL_SELECT';
    userId: string;
    data: {
        cursor?: { x: number; y: number };
        selection?: string | null;
    };
};
