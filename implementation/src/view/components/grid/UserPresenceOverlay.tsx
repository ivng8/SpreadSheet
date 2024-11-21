// src/view/components/grid/UserPresenceOverlay.tsx
import React from 'react';
import { UserPresence } from 'model/collaborative/types';

interface UserPresenceOverlayProps {
  userPresence: Map<string, UserPresence>;
  currentUserId: string;
  cellDimensions: {
    width: number;
    height: number;
  };
}

const UserPresenceOverlay: React.FC<UserPresenceOverlayProps> = ({
  userPresence,
  currentUserId,
  cellDimensions,
}) => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from(userPresence.entries()).map(([userId, presence]) => {
      if (userId === currentUserId) return null;

      const color = `hsl(${Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360}, 70%, 80%)`;

      return (
        <React.Fragment key={userId}>
          {presence.cursor && (
            <div
              className="absolute z-50"
              style={{
                left: presence.cursor.x,
                top: presence.cursor.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              >
                <path d="M0 0L20 8L12 12L8 20L0 0Z" fill={color} stroke="white" strokeWidth="1.5" />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '-10px',
                  background: color,
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontWeight: 500,
                }}
              >
                User {userId.slice(0, 6)}
              </div>
            </div>
          )}

          {presence.selection && (
            <div
              className="absolute pointer-events-none"
              style={{
                ...getCellPosition(presence.selection, cellDimensions),
                border: `2px solid ${color}`,
                zIndex: 40,
                transition: 'all 0.1s ease-out',
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const getCellPosition = (address: string, dimensions: { width: number; height: number }) => {
  const col = address.match(/[A-Z]+/)?.[0] || '';
  const row = parseInt(address.match(/\d+/)?.[0] || '0', 10) - 1;

  const colIndex = col.split('').reduce((acc, char) => {
    return acc * 26 + char.charCodeAt(0) - 65;
  }, 0);

  return {
    left: colIndex * dimensions.width,
    top: row * dimensions.height,
    width: dimensions.width,
    height: dimensions.height,
  };
};

export default UserPresenceOverlay;
