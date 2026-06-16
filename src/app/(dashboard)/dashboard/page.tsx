'use client';

import { useAuth } from '@/lib/auth-context';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
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

  const getBookingCardTitle = () => {
    if (isSystemAdmin) return 'Bookings (System)';
    if (['operatorAdmin', 'operatorManager', 'operatorStaff'].includes(role)) return 'Bookings (Operator)';
    if (['counterOwner', 'counterStaff'].includes(role)) return 'Bookings (Counter)';
    return 'Bookings';
  };

  const [counts, setCounts] = useState({
    users: null as number | null | string,
    busOwners: null as number | null | string,
    counters: null as number | null | string,
    buses: null as number | null | string,
    routes: null as number | null | string,
    trips: null as number | null | string,
    bookings: null as number | null | string,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const promises = [];

        // Scoped requests depending on permissions
        if (canManageStaff) {
          promises.push(
            apiClient.get('/api/user/staff')
              .then(res => ({ key: 'users', value: Array.isArray(res.data) ? res.data.length : 0 }))
              .catch(() => ({ key: 'users', value: 'Error' }))
          );
        }

        if (isSystemAdmin) {
          promises.push(
            apiClient.get('/api/bus-owner')
              .then(res => ({ key: 'busOwners', value: Array.isArray(res.data) ? res.data.length : 0 }))
              .catch(() => ({ key: 'busOwners', value: 'Error' }))
          );
        }

        if (isOperatorStaffOrAbove) {
          promises.push(
            apiClient.get('/api/counter')
              .then(res => ({ key: 'counters', value: Array.isArray(res.data) ? res.data.length : 0 }))
              .catch(() => ({ key: 'counters', value: 'Error' })),
            apiClient.get('/api/bus')
              .then(res => ({ key: 'buses', value: Array.isArray(res.data) ? res.data.length : 0 }))
              .catch(() => ({ key: 'buses', value: 'Error' })),
            apiClient.get('/api/route')
              .then(res => ({ key: 'routes', value: Array.isArray(res.data) ? res.data.length : 0 }))
              .catch(() => ({ key: 'routes', value: 'Error' })),
            apiClient.get('/api/trip')
              .then(res => ({ key: 'trips', value: Array.isArray(res.data) ? res.data.length : 0 }))
              .catch(() => ({ key: 'trips', value: 'Error' }))
          );
        }

        // Bookings (scoped by backend)
        promises.push(
          apiClient.get('/api/booking?limit=1')
            .then(res => ({ key: 'bookings', value: res.data?.data?.pagination?.total ?? 0 }))
            .catch(() => ({ key: 'bookings', value: 'Error' }))
        );

        const results = await Promise.all(promises);
        const newCounts = { ...counts };
        for (const res of results) {
          if (res) {
            newCounts[res.key as keyof typeof counts] = res.value;
          }
        }
        setCounts(newCounts as any);
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
      }
    };

    fetchCounts();
  }, [canManageStaff, isSystemAdmin, isOperatorStaffOrAbove]);

  const formatCount = (val: number | string | null) => {
    if (val === null) return 'Loading...';
    return String(val);
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <h1 className="mb-6 font-bold text-3xl">Dashboard Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* User Section */}
        {canManageStaff && (
          <DashboardCard
            title="Users"
            count={formatCount(counts.users)}
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
            count={formatCount(counts.busOwners)}
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
            count={formatCount(counts.counters)}
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
            count={formatCount(counts.buses)}
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
            count={formatCount(counts.routes)}
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
            count={formatCount(counts.trips)}
            icon={Navigation}
            actions={[
              { label: 'Add Trip', href: '/dashboard/add-trip', variant: 'default' },
              { label: 'Manage Trips', href: '/dashboard/manage-trip', variant: 'outline' },
            ]}
          />
        )}

        {/* Booking Section */}
        <DashboardCard
          title={getBookingCardTitle()}
          count={formatCount(counts.bookings)}
          icon={Ticket}
          actions={[
            { label: 'View Bookings', href: '/dashboard/booking', variant: 'secondary' },
          ]}
        />
      </div>
    </div>
  );
}
