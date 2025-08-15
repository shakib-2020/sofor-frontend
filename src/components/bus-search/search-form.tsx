'use client';

import { ArrowLeftRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { DatePicker } from '@/components/bus-search/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { _error } from '@/lib/logs';
import { CityPicker } from './city-picker';

export default function SearchForm() {
  const [to, setTo] = useState('Sylhet');
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const router = useRouter();

  const fetchCities = useCallback(async () => {
    try {
      const res = await fetch('/api/city');
      const data = await res.json();
      setCities(data);
    } catch (err) {
      _error('Error fetching cities:', err);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/ticket');
  };

  return (
    <Card className="h-fit max-w-[1024px]">
      <CardDescription>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-4 px-6 py-3">
            <div className="grid items-center gap-4 lg:grid-cols-2">
              <div className="y- flex items-center justify-between gap-4">
                <div className="w-[45.25%] space-y-2">
                  <Label htmlFor="from">From</Label>
                  <CityPicker cities={cities} />
                </div>
                <div className="mt-6 flex h-full w-[5%] items-end justify-center">
                  <ArrowLeftRight />
                </div>
                <div className="w-[45.25%] space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    onChange={(e) => setTo(e.target.value)}
                    required
                    type="text"
                    value={to}
                  />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
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
