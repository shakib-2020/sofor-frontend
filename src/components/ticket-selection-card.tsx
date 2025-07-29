import { MapPin } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { SheetTrigger } from './ui/sheet';

function TicketSelectionCard() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="grid grid-cols-3">
        {/* part 1 */}
        <div className="mb-4 flex w-auto flex-col items-start">
          <Image
            alt="bus company logo"
            className="h-auto w-16"
            height={100}
            src={
              'https://bus-promotion-bucket.s3-ap-southeast-1.amazonaws.com/production/busowners-logo/hanif.png?v=1.0.0'
            }
            width={100}
          />
          <h2 className="font-bold text-lg">Hanif Enterprise</h2>
          <div className="mb-4 font-semibold text-gray-700 text-xs">
            <p>Hino, AK1J Super Plus Non AC</p>
            <p>Route: Dhaka - Ashuganj - Sayestagong - Sherpur - Sylhet</p>
          </div>{' '}
        </div>

        {/* part 2 */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <span className="font-bold text-xl">04:30 AM</span>
            <p className="text-gray-500 text-sm">Fri, 4 Jul</p>
            <span>Sylhet</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500">7h 30m</span>
            <div className="relative h-6 w-40">
              <div className="absolute top-3 w-full border border-yellow-400" />
              <div className="absolute top-1 left-0-0 h-4 w-4 rounded-full bg-white">
                <MapPin className="h-4 w-4 text-red-600" />
              </div>
              <div className="absolute top-1 right-0 h-4 w-4 rounded-full bg-white">
                <MapPin className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
          <div className="text-end">
            <span className="font-bold text-xl">12:00 PM</span>
            <p className="text-gray-500 text-sm">Fri, 4 Jul</p>
            <span>Dhaka</span>
          </div>
        </div>

        {/* part 3 */}
        <div className="mb-4 flex flex-col items-end justify-between text-gray-500 text-sm">
          <span className="font-bold text-blue-600 text-lg">৳700</span>
          <span>36 Seat(s) Available</span>
          <SheetTrigger className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            BOOK TICKET
          </SheetTrigger>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="rounded-lg bg-green-100 px-4 py-1">
          Cancellation Policy
        </button>
        <button className="rounded-lg bg-green-100 px-4 py-1">
          Boarding Point
        </button>
        <button className="rounded-lg bg-green-100 px-4 py-1">
          Dropping Point
        </button>
        <button className="rounded-lg bg-green-100 px-4 py-1">Amenities</button>
      </div>
    </div>
  );
}

export default TicketSelectionCard;
