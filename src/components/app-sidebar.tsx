"use client";

import * as React from "react";
import {
  Armchair,
  ArrowUpCircleIcon,
  BarChartIcon,
  BusIcon,
  CalendarCheck,
  CalendarPlus,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  ShieldUser,
  TicketCheck,
  UsersIcon,
} from "lucide-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboardIcon,
      isActive: false,
    },
    {
      title: "Bus Owner",
      url: "/bus-owner",
      icon: ShieldUser,
      isActive: false,
      items: [
        {
          title: "Add Bus Owner",
          url: "/add-bus-owner",
          icon: CalendarPlus,
        },
        {
          title: "Manage Counter",
          url: "/manage-bus-owner",
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: "Counter",
      url: "/counter",
      icon: TicketCheck,
      isActive: false,
      items: [
        {
          title: "Add Counter",
          url: "/add-counter",
          icon: CalendarPlus,
        },
        {
          title: "Manage Counter",
          url: "/manage-counter",
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: "Bus",
      url: "/bus",
      icon: BusIcon,
      isActive: false,
      items: [
        {
          title: "Add Bus",
          url: "/add-bus",
          icon: CalendarPlus,
        },
        {
          title: "Manage Bus",
          url: "/manage-bus",
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: "Seat",
      url: "/seat",
      icon: Armchair,
      isActive: false,
    },
    {
      title: "User",
      url: "/user",
      icon: UsersIcon,
      isActive: false,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Sofor-Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
