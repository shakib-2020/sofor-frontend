import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BETTER_SERVER as string, {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};
