'use client';

import { useAuth } from '@/lib/auth-context';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import {
  Users,
  Bus,
  Store,
  Map,
  Navigation,
  Armchair,
  Ticket,
  UserCog,
} from 'lucide-react';

export default function Page() {
  const { user } = useAuth();
  const role = user?.role || 'customer';
  const isSystemAdmin = role === 'superAdmin' || role === 'admin';
  const isOperatorStaffOrAbove = ['superAdmin', 'admin', 'operatorAdmin', 'operatorManager', 'operatorStaff'].includes(role);
  const isCounterStaffOrAbove = ['superAdmin', 'admin', 'operatorAdmin', 'operatorManager', 'operatorStaff', 'counterOwner', 'counterStaff'].includes(role);
  const canManageStaff = ['superAdmin', 'admin', 'operatorAdmin', 'operatorManager', 'counterOwner'].includes(role);

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <h1 className="mb-6 font-bold text-3xl">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* User Section */}
        {canManageStaff && (
          <DashboardCard
            title="Users"
            count="1,234" // Placeholder
            icon={Users}
            actions={[
              { label: 'Manage Users', href: '/dashboard/user', variant: 'outline' },
            ]}
          />
        )}

        {/* Bus Owner Section */}
        {isSystemAdmin && (
          <DashboardCard
            title="Bus Owners"
            count="56" // Placeholder
            icon={UserCog}
            actions={[
              { label: 'Add Owner', href: '/dashboard/add-bus-owner', variant: 'default' },
              { label: 'Manage Owners', href: '/dashboard/manage-bus-owner', variant: 'outline' },
            ]}
          />
        )}

        {/* Counter Section */}
        {isOperatorStaffOrAbove && (
          <DashboardCard
            title="Counters"
            count="89" // Placeholder
            icon={Store}
            actions={[
              { label: 'Add Counter', href: '/dashboard/add-counter', variant: 'default' },
              { label: 'Manage Counters', href: '/dashboard/manage-counter', variant: 'outline' },
            ]}
          />
        )}

        {/* Bus Section */}
        {isOperatorStaffOrAbove && (
          <DashboardCard
            title="Buses"
            count="120" // Placeholder
            icon={Bus}
            actions={[
              { label: 'Add Bus', href: '/dashboard/add-bus', variant: 'default' },
              { label: 'Manage Buses', href: '/dashboard/manage-bus', variant: 'outline' },
            ]}
          />
        )}

        {/* Route Section */}
        {isOperatorStaffOrAbove && (
          <DashboardCard
            title="Routes"
            count="45" // Placeholder
            icon={Map}
            actions={[
              { label: 'Add Route', href: '/dashboard/add-route', variant: 'default' },
              { label: 'Manage Routes', href: '/dashboard/manage-route', variant: 'outline' },
            ]}
          />
        )}

        {/* Trip Section */}
        {isOperatorStaffOrAbove && (
          <DashboardCard
            title="Trips"
            count="340" // Placeholder
            icon={Navigation}
            actions={[
              { label: 'Add Trip', href: '/dashboard/add-trip', variant: 'default' },
              { label: 'Manage Trips', href: '/dashboard/manage-trip', variant: 'outline' },
            ]}
          />
        )}

        {/* Seat Section */}
        {isCounterStaffOrAbove && (
          <DashboardCard
            title="Seats"
            count="-" // Placeholder or N/A
            icon={Armchair}
            actions={[
              { label: 'Manage Seats', href: '/dashboard/seat', variant: 'outline' },
            ]}
          />
        )}

        {/* Booking Section */}
        <DashboardCard
          title="Bookings"
          count="-" // Placeholder
          icon={Ticket}
          actions={[
            // Placeholder for future implementation
            { label: 'View Bookings', href: '#', variant: 'secondary' },
          ]}
        />
      </div>
    </div>
  );
}

