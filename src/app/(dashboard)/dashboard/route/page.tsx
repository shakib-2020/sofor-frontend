import React from 'react';
import { OperatorAdminOrAboveRoute } from '@/components/auth/route-guards';

function page() {
  return (
    <OperatorAdminOrAboveRoute>
      <div>Route</div>
    </OperatorAdminOrAboveRoute>
  );
}

export default page;
