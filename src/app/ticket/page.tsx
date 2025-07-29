import Image from 'next/image';
import React from 'react';
import SeatPlan from '@/components/seat-plan';
import TicketSelectionCard from '@/components/ticket-selection-card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import seatplan from '@/lib/seatplan.json' with { type: 'json' };

function TicketPage() {
  return (
    <Sheet>
      <h2 className="my-4 font-semibold text-3xl">
        Choose Departing Ticket :{' '}
      </h2>
      <TicketSelectionCard />
      <SheetContent className="m-0 items-start overflow-x-hidden overflow-y-scroll border-none p-0">
        <div className="p-4">
          <div className="">
            <SheetHeader className="mb-3">
              <SheetTitle>
                Choose your preferred seats for your journey.
              </SheetTitle>
            </SheetHeader>
            <div className="my-2 rounded-sm border p-3">
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
                  <p>
                    Route: Dhaka - Ashuganj - Sayestagong - Sherpur - Sylhet
                  </p>
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
                </div>
                <div className="text-end">
                  <span className="font-bold text-xl">12:00 PM</span>
                  <p className="text-gray-500 text-sm">Fri, 4 Jul</p>
                  <span>Dhaka</span>
                </div>
              </div>
            </div>
          </div>
          {/* <SeatPlan /> */}
          <SeatPlan layout={seatplan?.data.seats[0].layout} />
        </div>
        {/* Confirm Order */}
        <div className="sticky bottom-0 w-full border-gray-200 border-t bg-white p-4">
          <div className="mb-2 flex justify-between">
            <span className="font-medium text-green-600">
              2 ticket(s) selected
            </span>
            <span className="font-bold text-green-600">৳1400</span>
          </div>
          <Button className="w-full bg-green-500">Confirm Order</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default TicketPage;
