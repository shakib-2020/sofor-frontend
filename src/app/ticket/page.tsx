import TicketSelectionCard from "@/components/ticket-selection-card";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import seatplan from "@/lib/seatplan.json";
import SeatPlan from "@/components/seat-plan";
import Image from "next/image";
import { Button } from "@/components/ui/button";
function TicketPage() {
  return (
    <Sheet>
      <h2 className="text-3xl font-semibold my-4">
        Choose Departing Ticket :{" "}
      </h2>
      <TicketSelectionCard />
      <SheetContent className="items-start overflow-y-scroll overflow-x-hidden p-0 m-0 border-none">
        <div className="p-4">
          <div className="">
            <SheetHeader className="mb-3">
              <SheetTitle>
                Choose your preferred seats for your journey.
              </SheetTitle>
            </SheetHeader>
            <div className="my-2 border p-3 rounded-sm">
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
                  <p>
                    Route: Dhaka - Ashuganj - Sayestagong - Sherpur - Sylhet
                  </p>
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
                </div>
                <div className="text-end">
                  <span className="text-xl font-bold">12:00 PM</span>
                  <p className="text-sm text-gray-500">Fri, 4 Jul</p>
                  <span>Dhaka</span>
                </div>
              </div>
            </div>
          </div>
          {/* <SeatPlan /> */}
          <SeatPlan layout={seatplan?.data.seats[0].layout} />
        </div>
        {/* Confirm Order */}
        <div className="bottom-0 w-full sticky bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between mb-2">
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
