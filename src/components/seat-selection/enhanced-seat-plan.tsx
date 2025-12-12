'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { getSocket } from '@/lib/socket'; // 🚫 Disabled for Vercel deployment
import { toast } from 'sonner';
import { RefreshCw, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Seat {
  id: number;
  seatName: string;
  status: 'available' | 'occupied' | 'booked';
  row: number;
  column: number;
}

interface EnhancedSeatPlanProps {
  busId: number;
  tripId: number;
  onSeatSelect: (seats: Seat[]) => void;
  maxSeats?: number;
}



export function EnhancedSeatPlan({ 
  busId, 
  tripId, 
  onSeatSelect, 
  maxSeats = 4 
}: EnhancedSeatPlanProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Generate consistent seat name based on row and column (A1, A2, B1, B2, etc.)
  const generateSeatName = (row: number, column: number): string => {
    const rowLetter = String.fromCharCode(64 + row); // A=1, B=2, C=3, etc.
    return `${rowLetter}${column}`;
  };

  // Fetch real seat data from API
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/seat/bus/${busId}`);
        const data = response.data;
        
        if (data.success) {
          // Transform API data to component format with consistent naming
          // Bus layout: 2 seats on left + 2 seats on right = 4 seats per row (A1 A2  A3 A4)
          const seatsPerRow = 4;
          const transformedSeats: Seat[] = data.data.map((seat: any, index: number) => {
            const row = Math.floor(index / seatsPerRow) + 1; // Calculate row based on position
            const column = (index % seatsPerRow) + 1; // Calculate column based on position
            
            return {
              id: seat.id,
              seatName: generateSeatName(row, column), // Generate consistent seat name (A1, A2, A3, A4, B1, B2, B3, B4, etc.)
              status: seat.status,
              row: row,
              column: column,
            };
          });
          
          setSeats(transformedSeats);
          setLastRefresh(new Date());
        } else {
          console.error('Failed to fetch seats:', data.message);
          // Fallback to empty array
          setSeats([]);
        }
      } catch (error) {
        console.error('Error fetching seats:', error);
        setSeats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [busId, refreshKey]);

  // 🚫 Socket.IO integration disabled for Vercel deployment
  // Real-time updates replaced with polling/refresh functionality
  useEffect(() => {
    // Auto-refresh seats every 30 seconds to check for updates
    const interval = setInterval(() => {
      if (selectedSeats.length === 0) { // Only refresh if no seats are selected
        setRefreshKey(prev => prev + 1);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedSeats.length]);

  const refreshSeats = () => {
    setRefreshKey(prev => prev + 1);
    toast.info('Refreshing seat information...');
  };

  const formatLastRefresh = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastRefresh.toLocaleTimeString();
  };



  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'available') {
      toast.error('This seat is not available. Refreshing seat data...');
      // Auto-refresh when seat appears unavailable
      refreshSeats();
      return;
    }

    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      // Deselect seat - just remove from local state (no socket emit)
      const newSelection = selectedSeats.filter(s => s.id !== seat.id);
      setSelectedSeats(newSelection);
      onSeatSelect(newSelection);
    } else {
      // Check max seats limit
      if (selectedSeats.length >= maxSeats) {
        toast.error(`You can select maximum ${maxSeats} seats`);
        return;
      }

      // Select seat - only update local state (don't mark as occupied in DB yet)
      const newSelection = [...selectedSeats, seat];
      setSelectedSeats(newSelection);
      onSeatSelect(newSelection);
    }
  };

  const getSeatClass = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      return 'bg-green-500 text-white border-green-500 cursor-pointer hover:bg-green-600';
    }
    
    switch (seat.status) {
      case 'available':
        return 'bg-white border-gray-400 cursor-pointer hover:bg-gray-50 hover:border-blue-400';
      case 'occupied':
        return 'bg-yellow-200 border-yellow-400 cursor-not-allowed';
      case 'booked':
        return 'bg-gray-400 text-white border-gray-400 cursor-not-allowed';
      default:
        return 'bg-gray-200 border-gray-300';
    }
  };

  const renderSeatGrid = () => {
    const rows = Math.max(...seats.map(s => s.row));
    const grid = [];

    for (let row = 1; row <= rows; row++) {
      const rowSeats = seats.filter(s => s.row === row).sort((a, b) => a.column - b.column);
      
      grid.push(
        <div key={row} className="flex items-center gap-2 mb-2">
          {/* Left side seats (columns 1-2) */}
          <div className="flex gap-1">
            {rowSeats
              .filter(s => s.column <= 2)
              .map(seat => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.status !== 'available' && !selectedSeats.some(s => s.id === seat.id)}
                  className={`
                    w-10 h-10 rounded border-2 text-xs font-medium transition-colors
                    ${getSeatClass(seat)}
                  `}
                  title={`Seat ${seat.seatName} - ${seat.status}`}
                >
                  {seat.seatName}
                </button>
              ))}
          </div>

          {/* Aisle space */}
          <div className="w-6 border-b border-dashed border-gray-300 h-0 my-5" />

          {/* Right side seats (columns 3-4) */}
          <div className="flex gap-1">
            {rowSeats
              .filter(s => s.column > 2)
              .map(seat => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.status !== 'available' && !selectedSeats.some(s => s.id === seat.id)}
                  className={`
                    w-10 h-10 rounded border-2 text-xs font-medium transition-colors
                    ${getSeatClass(seat)}
                  `}
                  title={`Seat ${seat.seatName} - ${seat.status}`}
                >
                  {seat.seatName}
                </button>
              ))}
          </div>

          {/* Row number */}
          <span className="ml-2 text-sm text-gray-500 w-6">{row}</span>
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
      {/* Legend and Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded" />
            <span>Occupied</span>
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
        
        {/* Refresh section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Updated {formatLastRefresh()}</span>
          </div>
          <button
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

      {/* Selection info */}
      {selectedSeats.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-medium text-blue-800 mb-2">
            Selected Seats ({selectedSeats.length}/{maxSeats}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <Badge key={seat.id} variant="secondary" className="bg-green-100 text-green-800">
                {seat.seatName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Seat map */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        {/* Driver section indicator */}
        <div className="mb-4 text-center">
          <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-t-lg text-sm font-medium">
            Driver
          </div>
        </div>

        {/* Seat grid */}
        <div className="flex flex-col items-center">
          {renderSeatGrid()}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Click on available seats to select them (max {maxSeats} seats)</p>
        </div>
      </div>
    </div>
  );
}
