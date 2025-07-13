import { MapPin } from "lucide-react";
import Image from "next/image";
import React from "react";
import { SheetTrigger } from "./ui/sheet";

function TicketSelectionCard() {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="grid grid-cols-3">
        {/* part 1 */}
        <div className="flex items-start flex-col mb-4 w-auto">
          <Image
            src={
              "https://bus-promotion-bucket.s3-ap-southeast-1.amazonaws.com/production/busowners-logo/hanif.png?v=1.0.0"
            }
            width={100}
            height={100}
            alt="bus company logo"
            className="w-16 h-auto"
          />
          <h2 className="text-lg font-bold">Hanif Enterprise</h2>
          <div className="text-gray-700 mb-4 text-xs font-semibold">
            <p>Hino, AK1J Super Plus Non AC</p>
            <p>Route: Dhaka - Ashuganj - Sayestagong - Sherpur - Sylhet</p>
          </div>{" "}
        </div>

        {/* part 2 */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <span className="text-xl font-bold">04:30 AM</span>
            <p className="text-sm text-gray-500">Fri, 4 Jul</p>
            <span>Sylhet</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500">7h 30m</span>
            <div className="w-40 h-6 relative">
              <div className="border border-yellow-400 w-full absolute top-3"></div>
              <div className="w-4 h-4 bg-white rounded-full absolute left-0-0 top-1">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <div className="w-4 h-4 bg-white rounded-full absolute right-0 top-1">
                <MapPin className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
          <div className="text-end">
            <span className="text-xl font-bold">12:00 PM</span>
            <p className="text-sm text-gray-500">Fri, 4 Jul</p>
            <span>Dhaka</span>
          </div>
        </div>

        {/* part 3 */}
        <div className="flex flex-col items-end justify-between mb-4 text-sm text-gray-500">
          <span className="text-lg font-bold text-blue-600">৳700</span>
          <span>36 Seat(s) Available</span>
          <SheetTrigger className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            BOOK TICKET
          </SheetTrigger>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="bg-green-100 px-4 py-1 rounded-lg">
          Cancellation Policy
        </button>
        <button className="bg-green-100 px-4 py-1 rounded-lg">
          Boarding Point
        </button>
        <button className="bg-green-100 px-4 py-1 rounded-lg">
          Dropping Point
        </button>
        <button className="bg-green-100 px-4 py-1 rounded-lg">Amenities</button>
      </div>
    </div>
  );
}

export default TicketSelectionCard;
