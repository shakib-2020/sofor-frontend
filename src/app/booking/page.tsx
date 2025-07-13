// pages/booking.tsx
"use client";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

const BookingPage = () => {
  const [selectedSeats, setSelectedSeats] = useState<{
    [seat: string]: string;
  }>({});

  useEffect(() => {
    const socket = getSocket();

    // Listen for seat updates
    socket.on("seat-status-updated", ({ seatName, status }) => {
      setSelectedSeats((prev) => ({
        ...prev,
        [seatName]: status,
      }));
    });

    return () => {
      socket.off("seat-status-updated");
    };
  }, []);

  const occupySeat = (seatName: string) => {
    const socket = getSocket();
    socket.emit("occupy-seat", { busId: 4, seatName });
  };

  const confirmBooking = (seatName: string) => {
    const socket = getSocket();
    socket.emit("book-seat", { busId: 4, seatName });
  };

  const releaseSeat = (seatName: string) => {
    const socket = getSocket();
    socket.emit("release-seat", { busId: 4, seatName });
  };

  return (
    <div>
      <h2>Seat Booking</h2>
      {["A1", "A2", "A3", "A4"].map((seat) => (
        <div key={seat} style={{ marginBottom: 10, marginLeft: 10 }}>
          <span>
            {seat} - {selectedSeats[seat] || "available"}
          </span>
          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button onClick={() => occupySeat(seat)}>Occupy</button>
            <button onClick={() => confirmBooking(seat)}>Book</button>
            <button onClick={() => releaseSeat(seat)}>Release</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingPage;
