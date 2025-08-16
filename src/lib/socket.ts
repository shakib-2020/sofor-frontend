// 🚫 WebSocket functionality disabled for Vercel deployment compatibility
// import { io, type Socket } from 'socket.io-client';

// let socket: Socket | null = null;

// Fallback mock implementation to prevent import errors
export const getSocket = (): any => {
  console.warn('🚫 WebSocket disabled for Vercel deployment. Real-time features unavailable.');
  
  // Return a mock socket object with no-op methods
  return {
    on: () => {},
    off: () => {},
    emit: () => {},
    disconnect: () => {},
  };
};

// Note: For production with WebSocket support, use a different hosting provider
// that supports persistent connections (like Railway, Render, or self-hosted).
