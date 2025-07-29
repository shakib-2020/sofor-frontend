import React, { useEffect, useState } from 'react';
import SearchForm from '../components/search-form';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gray-50 py-12">
      <div className="flex flex-col items-center">
        <h1 className="mb-8 text-center font-bold text-4xl text-gray-800">
          Bus Ticket Booking
        </h1>

        <SearchForm />
      </div>
    </main>
  );
}
