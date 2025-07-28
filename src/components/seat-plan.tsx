import React from 'react';

const seatStatus: any = {
  0: 'bg-gray-300', // Sold
  1: 'bg-white border border-black', // Available
};

const Seat = ({ seat }: any) => {
  const isAvailable = seat?.seat_availability === 1;
  const statusClass = seat ? seatStatus[seat.seat_availability] : '';

  return (
    <div
      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded ${
        statusClass || ''
      } ${seat?.selected ? 'bg-green-500 text-white' : ''}`}
    >
      {seat?.seat_number || ''}
    </div>
  );
};

const SeatPlan = ({ layout }: any) => {
  const maxRows = Math.max(
    ...layout[0].map((_: any, idx: any) =>
      layout.reduce((acc: any, col: any) => (col[idx] ? acc + 1 : acc), 0)
    )
  );

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-white border border-black rounded"></div>
          Available
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          Sold
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          Selected
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-red-500">
          Maximul 4 seat can be selected
        </p>
      </div>
      <div className="grid grid-cols-5 gap-4 w-full p-4 rounded border border-gray-200">
        {layout[0].map((_: any, rowIndex: any) => (
          <React.Fragment key={rowIndex}>
            {layout.map((column: any, colIndex: any) => {
              const seat = column[rowIndex];
              if (!seat || seat.seat_type === 0) {
                return (
                  <div key={`${rowIndex}-${colIndex}`} className="w-10 h-10" />
                );
              }
              return <Seat key={`${rowIndex}-${colIndex}`} seat={seat} />;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SeatPlan;
