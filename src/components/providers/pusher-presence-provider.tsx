'use client';

import Pusher from 'pusher-js';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface PusherPresenceContextValue {
  client: Pusher | null;
  connectionId: string | null;
  connectionState: string;
}

const PusherPresenceContext = createContext<PusherPresenceContextValue>({
  client: null,
  connectionId: null,
  connectionState: 'disconnected',
});

interface PusherPresenceProviderProps {
  children: ReactNode;
}

export function PusherPresenceProvider({ children }: PusherPresenceProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [client, setClient] = useState<Pusher | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!isAuthenticated || !user || !pusherKey || !pusherCluster) {
      setClient(null);
      setConnectionId(null);
      setConnectionState('disconnected');
      return;
    }

    const pusherClient = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authorizer: (channel) => ({
        authorize: async (socketId, callback) => {
          try {
            const response = await apiClient.post('/api/pusher/auth', {
              socket_id: socketId,
              channel_name: channel.name,
            });

            callback(null, response.data);
          } catch (error) {
            const normalizedError = error instanceof Error ? error : new Error('Failed to authorize Pusher channel');
            callback(normalizedError, { auth: '' });
          }
        },
      }),
    });

    const handleConnected = () => {
      setConnectionId(pusherClient.connection.socket_id ?? null);
      setConnectionState(pusherClient.connection.state);
    };

    const handleStateChange = (states: { current: string }) => {
      setConnectionState(states.current);
      setConnectionId(pusherClient.connection.socket_id ?? null);
    };

    pusherClient.connection.bind('connected', handleConnected);
    pusherClient.connection.bind('state_change', handleStateChange);

    setClient(pusherClient);
    setConnectionState(pusherClient.connection.state);

    return () => {
      pusherClient.connection.unbind('connected', handleConnected);
      pusherClient.connection.unbind('state_change', handleStateChange);
      pusherClient.disconnect();
      setClient(null);
      setConnectionId(null);
      setConnectionState('disconnected');
    };
  }, [isAuthenticated, user]);

  const contextValue = useMemo(
    () => ({
      client,
      connectionId,
      connectionState,
    }),
    [client, connectionId, connectionState]
  );

  return (
    <PusherPresenceContext.Provider value={contextValue}>
      {children}
    </PusherPresenceContext.Provider>
  );
}

export function usePusherPresence() {
  return useContext(PusherPresenceContext);
}