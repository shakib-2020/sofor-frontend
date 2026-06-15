'use client';

import {
  Armchair,
  ArrowUpCircleIcon,
  BusIcon,
  CalendarCheck,
  CalendarPlus,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LocationEdit,
  MapPin,
  SearchIcon,
  SettingsIcon,
  ShieldUser,
  TicketCheck,
  UsersIcon,
} from 'lucide-react';
import type * as React from 'react';

// import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/sidebar/nav-main';
import { NavSecondary } from '@/components/sidebar/nav-secondary';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '',
      icon: LayoutDashboardIcon,
      isActive: false,
    },
    {
      title: 'Bus Owner',
      url: 'bus-owner',
      icon: ShieldUser,
      isActive: false,
      items: [
        {
          title: 'Add Bus Owner',
          url: 'add-bus-owner',
          icon: CalendarPlus,
        },
        {
          title: 'Manage Bus Owner',
          url: 'manage-bus-owner',
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: 'Counter',
      url: 'counter',
      icon: TicketCheck,
      isActive: false,
      items: [
        {
          title: 'Add Counter',
          url: 'add-counter',
          icon: CalendarPlus,
        },
        {
          title: 'Manage Counter',
          url: 'manage-counter',
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: 'Route',
      url: 'route',
      icon: MapPin,
      isActive: false,
      items: [
        {
          title: 'Add Route',
          url: 'add-route',
          icon: LocationEdit,
        },
        {
          title: 'Manage route',
          url: 'manage-route',
          icon: LocationEdit,
        },
      ],
    },
    {
      title: 'Bus',
      url: 'bus',
      icon: BusIcon,
      isActive: false,
      items: [
        {
          title: 'Add Bus',
          url: 'add-bus',
          icon: CalendarPlus,
        },
        {
          title: 'Manage Bus',
          url: 'manage-bus',
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: 'Trip',
      url: 'trip',
      icon: BusIcon,
      isActive: false,
      items: [
        {
          title: 'Add Trip',
          url: 'add-trip',
          icon: CalendarPlus,
        },
        {
          title: 'Manage Trip',
          url: 'manage-trip',
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: 'Seat',
      url: 'seat',
      icon: Armchair,
      isActive: false,
    },
    {
      title: 'User',
      url: 'user',
      icon: UsersIcon,
      isActive: false,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: SettingsIcon,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircleIcon,
    },
    {
      title: 'Search',
      url: '#',
      icon: SearchIcon,
    },
  ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: DatabaseIcon,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: ClipboardListIcon,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: FileIcon,
  //   },
  // ],
};

import { useAuth } from '@/lib/auth-context';
import { ROLES } from '@/lib/permissions';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  const filteredNavMain = data.navMain.filter((item) => {
    // Super admin sees everything
    if (role === ROLES.SUPER_ADMIN || role === 'admin') return true;

    // Operator admin/manager
    if ([ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER].includes(role as any)) {
      if (item.title === 'Bus Owner') return false;
      return true;
    }

    // Operator staff
    if (role === ROLES.OPERATOR_STAFF) {
      if (item.title === 'Bus Owner' || item.title === 'User') return false;
      return true;
    }

    // Counter owner
    if (role === ROLES.COUNTER_OWNER) {
      if (['Dashboard', 'Counter', 'Seat', 'Trip', 'User'].includes(item.title)) {
        return true;
      }
      return false;
    }

    // Counter staff
    if (role === ROLES.COUNTER_STAFF) {
      if (['Dashboard', 'Counter', 'Seat', 'Trip'].includes(item.title)) {
        return true;
      }
      return false;
    }

    // Default: Passenger or other
    return ['Dashboard'].includes(item.title);
  }).map((item) => {
    let title = item.title;
    if (item.title === 'User' && ![ROLES.SUPER_ADMIN, 'admin'].includes(role as any)) {
      title = 'Manage Staff';
    }

    // Filter sub-items (e.g. prevent Counter Owner from seeing "Add Counter")
    let items = item.items;
    if (items) {
      items = items.filter((subItem) => {
        const isSystemAdmin = role === ROLES.SUPER_ADMIN || role === 'admin';
        const isOperatorAdmin = [ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER].includes(role as any);

        if (subItem.title.startsWith('Add ')) {
          return isSystemAdmin || isOperatorAdmin;
        }

        if (subItem.title === 'Manage Counter') {
          return isSystemAdmin || isOperatorAdmin || [ROLES.COUNTER_OWNER, ROLES.COUNTER_STAFF].includes(role as any);
        }

        return true;
      });
    }

    return { ...item, title, items };
  });

  const currentUser = {
    name: user?.name || 'Guest User',
    email: user?.email || 'Not logged in',
    avatar: user?.image || 'https://github.com/shadcn.png',
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="font-semibold text-base">Sofor Panel</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
