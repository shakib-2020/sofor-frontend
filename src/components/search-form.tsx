'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Card, CardDescription, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { ArrowLeftRight } from 'lucide-react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { DatePicker } from './date-picker';

export default function SearchForm() {
  const [from, setFrom] = useState('Dhaka');
  const [to, setTo] = useState('Sylhet');
  const [isOneWay, setIsOneWay] = useState(false);
  const [journyDate, setJournyDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(new Date());
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/ticket');
  };

  return (
    <Card className="max-w-[1024px]  h-fit">
      <CardDescription>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-3 flex flex-col gap-4 items-center">
            <div className="grid lg:grid-cols-2 gap-4 items-center">
              <div className="flex justify-between y- gap-4 items-center">
                <div className="space-y-2 w-[45.25%]">
                  <Label htmlFor="from">From</Label>
                  <Input
                    type="text"
                    id="from"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                  />
                </div>
                <div className="w-[5%] h-full flex justify-center items-end mt-6">
                  <ArrowLeftRight />
                </div>
                <div className="space-y-2 w-[45.25%]">
                  <Label htmlFor="to">To</Label>
                  <Input
                    type="text"
                    id="to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="mr-4">Journy Date</Label>
                  <DatePicker curretDate={true} />
                </div>
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <DatePicker />
                </div>
                {/* <div className="flex justify-end">
              </div> */}
              </div>
            </div>
            <div>
              <Button className="h-full w-full bg-green-500" type="submit">
                Search Buses
              </Button>
            </div>
          </div>
        </form>
      </CardDescription>
    </Card>
  );
}
