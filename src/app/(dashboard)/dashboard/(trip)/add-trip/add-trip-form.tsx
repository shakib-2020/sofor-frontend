'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
// import Select from "react-select";
import { number, z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  tripNumber: z.string().min(1, 'Trip number is required'),
  heading: z.string().min(1, 'Heading is required'),
  busId: z.string().min(1, 'Bus selection is required'),
  routeId: z.string().min(1, 'Route selection is required'),
  departureDate: z.date(),
  departureTime: z.string(),
  arrivalDate: z.date(),
  arrivalTime: z.string(),
  boardingPoints: z.array(z.object({ name: z.string(), id: z.int() })),
  droppingPoints: z.array(z.object({ name: z.string(), id: z.int() })),
});

type FormValues = z.infer<typeof formSchema>;

const buses = [
  { name: 'Hanif', id: 1 },
  { name: 'Shyamoli', id: 2 },
  { name: 'Ena', id: 3 },
];

const routes = [
  { name: 'Dhaka – Ashuganj – Sylhet', id: 1 },
  { name: 'Sylhet – Moulvibazar – Dhaka', id: 2 },
];

const counters = [
  { name: 'Gabtoli', id: 1 },
  { name: 'Narayanganj', id: 2 },
  { name: 'Ashuganj', id: 3 },
];

export function AddTripForm() {
  const [openDeparture, setOpenDeparture] = useState(false);
  const [openArrival, setOpenArrival] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripNumber: '',
      heading: '',
      busId: undefined,
      routeId: undefined,
      departureDate: undefined,
      departureTime: '00:00',
      arrivalDate: undefined,
      arrivalTime: '00:00',
      boardingPoints: [],
      droppingPoints: [],
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const departureDateTime = combineDateAndTime(
      data.departureDate,
      data.departureTime
    );
    const arrivalDateTime = combineDateAndTime(
      data.arrivalDate,
      data.arrivalTime
    );

    const payload = {
      tripNumber: data.tripNumber,
      heading: data.heading,
      busId: data.busId,
      routeId: data.routeId,
      departureDateTime,
      arrivalDateTime,
      boardingPoints: data.boardingPoints.map((item) => item.id),
      droppingPoints: data.droppingPoints.map((item) => item.id),
    };

    console.log('Submit Payload:', payload);

    form.reset();
  }

  function combineDateAndTime(date: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    const dt = new Date(date);
    dt.setHours(hours);
    dt.setMinutes(minutes);
    return dt.toISOString();
  }

  return (
    <Form {...form}>
      <form
        className="mb-4 max-w-lg space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="tripNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip Number</FormLabel>
              <FormControl>
                <Input placeholder="TRIP-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="heading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heading</FormLabel>
              <FormControl>
                <Input placeholder="Dhaka – Ashuganj – Sylhet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bus Select */}
        <FormField
          control={form.control}
          name="busId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bus</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Bus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {buses?.map((div: any) => (
                    <SelectItem key={div.id} value={String(div.id)}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Route Select */}
        <FormField
          control={form.control}
          name="routeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Route" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {routes?.map((div: any) => (
                    <SelectItem key={div.id} value={String(div.id)}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Departure Date & Time */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Departure Date</FormLabel>
                <FormControl>
                  <Popover onOpenChange={setOpenDeparture} open={openDeparture}>
                    <PopoverTrigger asChild>
                      <Button
                        className="w-[150px] justify-between font-normal"
                        variant="outline"
                      >
                        {field.value
                          ? format(field.value, 'PPP')
                          : 'Select date'}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        captionLayout="dropdown"
                        mode="single"
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenDeparture(false);
                        }}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="departureTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Departure Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Arrival Date & Time */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="arrivalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Arrival Date</FormLabel>
                <FormControl>
                  <Popover onOpenChange={setOpenArrival} open={openArrival}>
                    <PopoverTrigger asChild>
                      <Button
                        className="w-[150px] justify-between font-normal"
                        variant="outline"
                      >
                        {field.value
                          ? format(field.value, 'PPP')
                          : 'Select date'}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        captionLayout="dropdown"
                        mode="single"
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenArrival(false);
                        }}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="arrivalTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Arrival Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Boarding Points */}
        <FormField
          control={form.control}
          name="boardingPoints"
          render={() => (
            <FormItem>
              <FormLabel>Boarding Points</FormLabel>
              <div className="space-y-2">
                {counters.map((counter) => (
                  <FormField
                    control={form.control}
                    key={counter.id}
                    name="boardingPoints"
                    render={({ field }) => {
                      return (
                        <FormItem
                          className="flex flex-row items-start space-x-3 space-y-0"
                          key={counter.id}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.some(
                                (v) => v.id === counter.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([
                                    ...field.value,
                                    { name: counter.name, id: counter.id },
                                  ]);
                                } else {
                                  field.onChange(
                                    field.value.filter(
                                      (v) => v.id !== counter.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {counter.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dropping Points */}
        <FormField
          control={form.control}
          name="droppingPoints"
          render={() => (
            <FormItem>
              <FormLabel>Dropping Points</FormLabel>
              <div className="space-y-2">
                {counters.map((counter) => (
                  <FormField
                    control={form.control}
                    key={counter.id}
                    name="droppingPoints"
                    render={({ field }) => {
                      return (
                        <FormItem
                          className="flex flex-row items-start space-x-3 space-y-0"
                          key={counter.id}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.some(
                                (v) => v.id === counter.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([
                                    ...field.value,
                                    { name: counter.name, id: counter.id },
                                  ]);
                                } else {
                                  field.onChange(
                                    field.value.filter(
                                      (v) => v.id !== counter.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {counter.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Add Trip</Button>
      </form>
    </Form>
  );
}
