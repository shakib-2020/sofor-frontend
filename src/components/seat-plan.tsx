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
      className={`flex h-10 w-10 items-center justify-center rounded font-medium text-sm ${
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
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded border border-black bg-white" />
          Available
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-gray-300" />
          Sold
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-green-500" />
          Selected
        </div>
      </div>
      <div>
        <p className="font-medium text-red-500 text-sm">
          Maximul 4 seat can be selected
        </p>
      </div>
      <div className="grid w-full grid-cols-5 gap-4 rounded border border-gray-200 p-4">
        {layout[0].map((_: any, rowIndex: any) => (
          <React.Fragment key={rowIndex}>
            {layout.map((column: any, colIndex: any) => {
              const seat = column[rowIndex];
              if (!seat || seat.seat_type === 0) {
                return (
                  <div className="h-10 w-10" key={`${rowIndex}-${colIndex}`} />
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
