'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { usePusherPresence } from '@/components/providers/pusher-presence-provider';
import { useAuth } from '@/lib/auth-context';

interface Seat {
  id: number;
  seatName: string;
  status: 'available' | 'pending' | 'booked';
  row: number;
  column: number;
  reservedBy: string | null;
  reservedAt: string | null;
  expiresAt: string | null;
}

interface SeatMapResponseSeat {
  id: number;
  seatName: string;
  status: 'available' | 'pending' | 'booked';
  reservedBy: string | null;
  reservedAt: string | null;
  expiresAt: string | null;
}

interface EnhancedSeatPlanProps {
  busId: number;
  tripId: number;
  onSeatSelect: (seats: Seat[]) => void;
  onPendingChange?: (hasPendingRequests: boolean) => void;
  maxSeats?: number;
}

const TAB_ID_STORAGE_KEY = 'sofor:seat-tab-id';

const parseSeatName = (seatName: string) => {
  const match = seatName.match(/^([A-Z]+)(\d+)$/i);
  if (!match) {
    return null;
  }

  return {
    rowLetters: match[1].toUpperCase(),
    numericColumn: Number.parseInt(match[2], 10),
  };
};

const letterGroupToNumber = (rowLetters: string) => {
  let row = 0;

  for (const letter of rowLetters) {
    row = row * 26 + (letter.charCodeAt(0) - 64);
  }

  return row;
};

const deriveSeatLayout = (seatSnapshots: SeatMapResponseSeat[]) => {
  const parsedSeatNames = seatSnapshots.map((seatSnapshot) => parseSeatName(seatSnapshot.seatName));
  const validParsedSeats = parsedSeatNames.filter((parsedSeat): parsedSeat is NonNullable<typeof parsedSeat> => Boolean(parsedSeat));
  const seatsPerVisualRow = 4;

  if (validParsedSeats.length !== seatSnapshots.length) {
    return seatSnapshots.map((seatSnapshot, index) => ({
      id: seatSnapshot.id,
      row: Math.floor(index / seatsPerVisualRow) + 1,
      column: (index % seatsPerVisualRow) + 1,
    }));
  }

  const maxSourceColumn = Math.max(...validParsedSeats.map((parsedSeat) => parsedSeat.numericColumn));
  const sourceRowOrder = Array.from(
    new Set(validParsedSeats.map((parsedSeat) => parsedSeat.rowLetters))
  ).sort((leftRow, rightRow) => letterGroupToNumber(leftRow) - letterGroupToNumber(rightRow));
  const sourceRowIndex = new Map(sourceRowOrder.map((rowLetters, index) => [rowLetters, index]));
  const visualRowsPerSourceRow = Math.max(1, Math.ceil(maxSourceColumn / seatsPerVisualRow));

  return seatSnapshots.map((seatSnapshot, index) => {
    const parsedSeat = parsedSeatNames[index];

    if (!parsedSeat) {
      return {
        id: seatSnapshot.id,
        row: Math.floor(index / seatsPerVisualRow) + 1,
        column: (index % seatsPerVisualRow) + 1,
      };
    }

    const currentSourceRowIndex = sourceRowIndex.get(parsedSeat.rowLetters) ?? 0;
    const visualRowOffset = Math.floor((parsedSeat.numericColumn - 1) / seatsPerVisualRow);

    return {
      id: seatSnapshot.id,
      row: currentSourceRowIndex * visualRowsPerSourceRow + visualRowOffset + 1,
      column: ((parsedSeat.numericColumn - 1) % seatsPerVisualRow) + 1,
    };
  });
};

export function EnhancedSeatPlan({
  busId,
  tripId,
  onSeatSelect,
  onPendingChange,
  maxSeats = 1,
}: EnhancedSeatPlanProps) {
  const router = useRouter();
  const { client, connectionId } = usePusherPresence();
  const { user, isLoading: authLoading } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [pendingSeatIds, setPendingSeatIds] = useState<number[]>([]);
  const [tabId] = useState(() => {
    if (typeof window === 'undefined') {
      return crypto.randomUUID();
    }

    const existingTabId = window.sessionStorage.getItem(TAB_ID_STORAGE_KEY);
    if (existingTabId) {
      return existingTabId;
    }

    const nextTabId = crypto.randomUUID();
    window.sessionStorage.setItem(TAB_ID_STORAGE_KEY, nextTabId);
    return nextTabId;
  });
  const selectedSeatsRef = useRef<Seat[]>([]);
  const userRef = useRef(user);

  const isSeatPending = (seatId: number) => pendingSeatIds.includes(seatId);

  const markSeatPending = (seatId: number) => {
    setPendingSeatIds((currentSeatIds) =>
      currentSeatIds.includes(seatId) ? currentSeatIds : [...currentSeatIds, seatId]
    );
  };

  const clearSeatPending = (seatId: number) => {
    setPendingSeatIds((currentSeatIds) => currentSeatIds.filter((currentSeatId) => currentSeatId !== seatId));
  };

  const getStorageKey = () => {
    if (!user) {
      return null;
    }

    return `sofor:pending-seats:${tripId}:${user.id}`;
  };

  const getTabsStorageKey = () => {
    if (!user) {
      return null;
    }

    return `sofor:seat-tabs:${tripId}:${user.id}`;
  };

  const readActiveTabIds = () => {
    const storageKey = getTabsStorageKey();
    if (!storageKey) {
      return [] as string[];
    }

    try {
      const rawValue = localStorage.getItem(storageKey);
      if (!rawValue) {
        return [] as string[];
      }

      const parsed = JSON.parse(rawValue) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [] as string[];
    }
  };

  const writeActiveTabIds = (tabIds: string[]) => {
    const storageKey = getTabsStorageKey();
    if (!storageKey) {
      return;
    }

    if (tabIds.length === 0) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(tabIds));
  };

  const registerTab = () => {
    const currentTabIds = readActiveTabIds();
    if (currentTabIds.includes(tabId)) {
      return;
    }

    writeActiveTabIds([...currentTabIds, tabId]);
  };

  const unregisterTab = () => {
    const currentTabIds = readActiveTabIds();
    const nextTabIds = currentTabIds.filter((currentTabId) => currentTabId !== tabId);
    writeActiveTabIds(nextTabIds);
    return nextTabIds;
  };

  const releaseSeatsOnLastTabClose = () => {
    if (!userRef.current || selectedSeatsRef.current.length === 0) {
      unregisterTab();
      return;
    }

    const remainingTabIds = unregisterTab();
    if (remainingTabIds.length > 0) {
      return;
    }

    void fetch('/api/seat/release-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
      keepalive: true,
      body: JSON.stringify({ tripId }),
    });
  };

  const persistPendingSeatIds = (seatIds: number[]) => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      return;
    }

    if (seatIds.length === 0) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(seatIds));
  };

  const reconcileSelectedSeats = (nextSeats: Seat[]) => {
    const nextSelectedSeats = nextSeats.filter(
      (seat) => seat.status === 'pending' && seat.reservedBy === user?.id
    );

    setSelectedSeats(nextSelectedSeats);
    selectedSeatsRef.current = nextSelectedSeats;
    persistPendingSeatIds(nextSelectedSeats.map((seat) => seat.id));
    onSeatSelect(nextSelectedSeats);
  };

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    onPendingChange?.(pendingSeatIds.length > 0);
  }, [onPendingChange, pendingSeatIds.length]);

  const syncSeatMap = async ({ showSuccessToast = false, background = false } = {}) => {
    try {
      if (!background) {
        setLoading(true);
      }

      const response = await apiClient.get(`/api/seat/trip/${tripId}/map`, {
        params: { busId },
      });

      if (!response.data.success) {
        toast.error(response.data.message || 'Failed to fetch seat map');
        return;
      }

      const derivedSeatLayout = deriveSeatLayout(response.data.data.seats);

      const mappedSeats: Seat[] = response.data.data.seats.map(
        (seatSnapshot: SeatMapResponseSeat, index: number) => {
          const position = derivedSeatLayout[index];
          return {
            id: seatSnapshot.id,
            seatName: seatSnapshot.seatName,
            status: seatSnapshot.status,
            row: position.row,
            column: position.column,
            reservedBy: seatSnapshot.reservedBy,
            reservedAt: seatSnapshot.reservedAt,
            expiresAt: seatSnapshot.expiresAt,
          };
        }
      );

      setSeats(mappedSeats);
      reconcileSelectedSeats(mappedSeats);
      setLastRefresh(new Date());

      if (showSuccessToast) {
        toast.success('Seat information refreshed');
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Failed to fetch current seat map');
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void syncSeatMap();
  }, [busId, tripId]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      return;
    }

    const cachedSeatIds = localStorage.getItem(storageKey);
    if (!cachedSeatIds) {
      return;
    }

    try {
      JSON.parse(cachedSeatIds) as number[];
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [tripId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    registerTab();

    const handlePageHide = () => {
      releaseSeatsOnLastTabClose();
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [tripId, user, tabId]);

  useEffect(() => {
    if (!client || !user) {
      return;
    }

    const channelName = `presence-bus-map-${tripId}`;
    const channel = client.subscribe(channelName);

    const handlePresenceSync = () => {
      void syncSeatMap({ background: true });
    };

    const handleSeatLocked = (event: {
      seatId: number;
      userId: string;
      reservedAt: string | null;
      expiresAt: string | null;
    }) => {
      setSeats((currentSeats) => {
        const nextSeats = currentSeats.map((seat) =>
          seat.id === event.seatId
            ? {
              ...seat,
              status: 'pending' as const,
              reservedBy: event.userId,
              reservedAt: event.reservedAt,
              expiresAt: event.expiresAt,
            }
            : seat
        );

        reconcileSelectedSeats(nextSeats);
        return nextSeats;
      });
    };

    const handleSeatReleased = (event: { seatId: number }) => {
      setSeats((currentSeats) => {
        const nextSeats = currentSeats.map((seat) =>
          seat.id === event.seatId
            ? {
              ...seat,
              status: 'available' as const,
              reservedBy: null,
              reservedAt: null,
              expiresAt: null,
            }
            : seat
        );

        reconcileSelectedSeats(nextSeats);
        return nextSeats;
      });
    };

    const handleSeatBooked = (event: { seatId: number }) => {
      setSeats((currentSeats) => {
        const nextSeats = currentSeats.map((seat) =>
          seat.id === event.seatId
            ? {
              ...seat,
              status: 'booked' as const,
              expiresAt: null,
            }
            : seat
        );

        reconcileSelectedSeats(nextSeats);
        return nextSeats;
      });
    };

    channel.bind('pusher:subscription_succeeded', handlePresenceSync);
    channel.bind('seat:locked', handleSeatLocked);
    channel.bind('seat:released', handleSeatReleased);
    channel.bind('seat:booked', handleSeatBooked);

    return () => {
      channel.unbind('pusher:subscription_succeeded', handlePresenceSync);
      channel.unbind('seat:locked', handleSeatLocked);
      channel.unbind('seat:released', handleSeatReleased);
      channel.unbind('seat:booked', handleSeatBooked);
      client.unsubscribe(channelName);
    };
  }, [client, tripId, user]);

  const refreshSeats = () => {
    void syncSeatMap({ showSuccessToast: true });
  };

  const formatLastRefresh = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);

    if (diff < 60) {
      return `${diff}s ago`;
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    }

    return lastRefresh.toLocaleTimeString();
  };

  const handleSeatClick = async (seat: Seat) => {
    if (authLoading || isSeatPending(seat.id)) {
      return;
    }

    if (!user) {
      toast.error('Please sign in before selecting a seat');
      router.push('/sign-in');
      return;
    }

    const isSelected = selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id);
    const previousSeat = seats.find((currentSeat) => currentSeat.id === seat.id);

    if (!previousSeat) {
      return;
    }

    if (isSelected) {
      const optimisticSeats = seats.map((currentSeat) =>
        currentSeat.id === seat.id
          ? {
            ...currentSeat,
            status: 'available' as const,
            reservedBy: null,
            reservedAt: null,
            expiresAt: null,
          }
          : currentSeat
      );

      setSeats(optimisticSeats);
      reconcileSelectedSeats(optimisticSeats);
      markSeatPending(seat.id);

      try {
        await apiClient.post('/api/seat/release', {
          tripId,
          seatId: seat.id,
        });
      } catch {
        setSeats((currentSeats) => {
          const restoredSeats = currentSeats.map((currentSeat) =>
            currentSeat.id === seat.id ? previousSeat : currentSeat
          );

          reconcileSelectedSeats(restoredSeats);
          return restoredSeats;
        });
        toast.error('Could not release seat. Your pending reservation was restored.');
      } finally {
        clearSeatPending(seat.id);
      }

      return;
    }

    if (seat.status === 'booked') {
      toast.error('Seat already booked');
      return;
    }

    if (seat.status === 'pending' && seat.reservedBy !== user.id) {
      toast.error('Seat is currently being held by another passenger');
      return;
    }

    if (selectedSeats.length >= maxSeats) {
      toast.error(`Maximum ${maxSeats} seat allowed per booking`);
      return;
    }

    const optimisticSeats = seats.map((currentSeat) =>
      currentSeat.id === seat.id
        ? {
          ...currentSeat,
          status: 'pending' as const,
          reservedBy: user.id,
          reservedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        }
        : currentSeat
    );

    setSeats(optimisticSeats);
    reconcileSelectedSeats(optimisticSeats);
    markSeatPending(seat.id);

    try {
      await apiClient.post('/api/seat/lock', {
        tripId,
        seatId: seat.id,
        connectionId,
      });
    } catch (error) {
      const requestError = error as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
      };

      if (requestError.response?.status === 409) {
        toast.error(requestError.response.data?.message || 'Seat was just reserved by another passenger');
      } else {
        toast.error('Could not reserve seat right now');
      }

      setSeats((currentSeats) => {
        const restoredSeats = currentSeats.map((currentSeat) =>
          currentSeat.id === seat.id ? previousSeat : currentSeat
        );

        reconcileSelectedSeats(restoredSeats);
        return restoredSeats;
      });

      void syncSeatMap({ background: true });
    } finally {
      clearSeatPending(seat.id);
    }
  };

  const getSeatClass = (seat: Seat) => {
    const isSelected = selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id);
    const seatIsPending = isSeatPending(seat.id);

    if (seatIsPending) {
      return 'border-blue-400 bg-blue-100 text-blue-700 cursor-wait opacity-80 shadow-sm';
    }

    if (isSelected) {
      return 'border-green-500 bg-green-500 text-white cursor-pointer shadow-sm hover:bg-green-600';
    }

    switch (seat.status) {
      case 'available':
        return 'border-slate-300 bg-white text-slate-700 cursor-pointer shadow-sm hover:-translate-y-0.5 hover:border-blue-400 hover:bg-slate-50';
      case 'pending':
        return 'border-yellow-400 bg-yellow-200 text-yellow-900 cursor-not-allowed shadow-sm';
      case 'booked':
        return 'border-slate-400 bg-slate-400 text-white cursor-not-allowed';
      default:
        return 'border-slate-300 bg-slate-200';
    }
  };

  const renderSeatButton = (seat: Seat | undefined, side: 'left' | 'right') => {
    if (!seat) {
      return <div className="h-12 w-12 rounded-2xl border border-dashed border-slate-200 bg-slate-100/60" aria-hidden="true" />;
    }

    const isSelected = selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id);

    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => void handleSeatClick(seat)}
        disabled={
          authLoading ||
          isSeatPending(seat.id) ||
          (seat.status !== 'available' && !isSelected)
        }
        className={`
          relative h-12 w-12 rounded-2xl border-2 text-[11px] font-semibold transition-all duration-150
          ${side === 'left' ? 'rounded-br-md' : 'rounded-bl-md'}
          ${getSeatClass(seat)}
        `}
        title={`Seat ${seat.seatName} - ${isSeatPending(seat.id) ? 'saving' : seat.status}`}
      >
        <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-black/10" aria-hidden="true" />
        <span>{seat.seatName}</span>
      </button>
    );
  };

  const renderSeatGrid = () => {
    const rows = Math.max(...seats.map((seat) => seat.row), 0);
    const grid = [];

    for (let row = 1; row <= rows; row++) {
      const rowSeats = seats
        .filter((seat) => seat.row === row)
        .sort((leftSeat, rightSeat) => leftSeat.column - rightSeat.column);
      const leftSeats = rowSeats.filter((seat) => seat.column <= 2);
      const rightSeats = rowSeats.filter((seat) => seat.column > 2);

      grid.push(
        <div key={row} className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-center gap-3">
          <div className="grid grid-cols-2 gap-2 justify-items-end">
            {renderSeatButton(leftSeats[0], 'left')}
            {renderSeatButton(leftSeats[1], 'left')}
          </div>

          <div className="flex h-12 flex-col items-center justify-center rounded-full border border-dashed border-slate-300 bg-white/70 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <span>R</span>
            <span>{row}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 justify-items-start">
            {renderSeatButton(rightSeats[0], 'right')}
            {renderSeatButton(rightSeats[1], 'right')}
          </div>
        </div>
      );
    }

    return grid;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading seats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded" />
            <span>Pending Hold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 border-2 border-gray-400 rounded" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 border-2 border-green-500 rounded" />
            <span>Selected</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Updated {formatLastRefresh()}</span>
          </div>
          <button
            type="button"
            onClick={refreshSeats}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh seat availability"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-medium text-blue-800 mb-2">
            Selected Seats ({selectedSeats.length}/{maxSeats}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <Badge key={seat.id} variant="secondary" className="bg-green-100 text-green-800">
                {seat.seatName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-100 via-white to-slate-100 p-4 shadow-inner sm:p-6">
        <div className="mx-auto max-w-md rounded-[2.5rem] border-2 border-slate-300 bg-[linear-gradient(180deg,rgba(226,232,240,0.85),rgba(255,255,255,0.98)_22%,rgba(248,250,252,1)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="mb-4 flex items-center justify-between rounded-[1.5rem] bg-slate-800 px-4 py-3 text-white shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">Front</p>
              <p className="text-sm font-semibold">Windshield</p>
            </div>
            <div className="rounded-xl bg-blue-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
              Driver
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            <span>Window</span>
            <span>Aisle</span>
            <span>Window</span>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 px-3 py-4 shadow-inner">
            <div className="pointer-events-none absolute inset-y-3 left-2 w-2 rounded-full bg-slate-200/70" />
            <div className="pointer-events-none absolute inset-y-3 right-2 w-2 rounded-full bg-slate-200/70" />
            <div className="pointer-events-none absolute inset-y-4 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-slate-300" />

            <div className="relative mx-auto flex max-w-xs flex-col gap-3">
              {renderSeatGrid()}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
            <div>
              <p className="font-semibold uppercase tracking-[0.22em] text-slate-400">Rear</p>
              <p className="mt-1 text-sm text-slate-600">4 seats per row</p>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              Entry Door
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            {user
              ? `Click on available seats to hold up to ${maxSeats} for 10 minutes.`
              : `Sign in to hold up to ${maxSeats} seats for 10 minutes.`}
          </p>
        </div>
      </div>
    </div>
  );
}
