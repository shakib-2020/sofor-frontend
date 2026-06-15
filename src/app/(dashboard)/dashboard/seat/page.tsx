import React from 'react';
import { CounterStaffOrAboveRoute } from '@/components/auth/route-guards';

function page() {
  return (
    <CounterStaffOrAboveRoute>
      <div>Seat</div>
    </CounterStaffOrAboveRoute>
  );
}

export default page;
