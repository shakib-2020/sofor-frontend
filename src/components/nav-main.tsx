'use client';

import {
  MailIcon,
  PlusCircleIcon,
  CornerUpRight,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();
  const router = useRouter();
  const path = usePathname();
  const { theme } = useTheme();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* {items.map((item) => (
            <SidebarMenuItem
              key={item.title}
              onClick={() => {
                router.push(`/dashboard/${item.url}`);
              }}
            >
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))} */}
          {items.map((item: any) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="cursor-pointer "
                    onClick={() => {
                      if (!item?.items) {
                        router.push(`/dashboard/${item?.url}`);
                      } else {
                        !open && setOpen(true);
                      }
                    }}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>

                    {item?.items && (
                      <ChevronRight className="ml-auto text-gray-700 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item?.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem: any) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={`
                          flex items-center gap-1  transition-colors rounded-sm
                          ${
                            path === subItem.url
                              ? 'bg-gray-200 dark:bg-gray-700'
                              : ''
                          }
                          hover:bg-gray-200 dark:hover:bg-gray-700
                          ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        `}
                          >
                            <Link
                              href={`/dashboard/${subItem.url}`}
                              className="flex items-center gap-1 w-full px-2 py-1"
                            >
                              {subItem.icon && <subItem.icon />}
                              <span className="capitalize">
                                {subItem.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
