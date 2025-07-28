import React, { useEffect, useState } from 'react';
import SearchForm from '../components/search-form';

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-gray-50 py-12">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Bus Ticket Booking
        </h1>

        <SearchForm />
      </div>
    </main>
  );
}
