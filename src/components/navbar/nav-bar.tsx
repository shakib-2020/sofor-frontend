'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { signOut, useSession } from '@/lib/auth-client';
import { Button } from '../ui/button';

function NavBar() {
  const pathname = usePathname();
  // Hide Navbar on /dashboard and all its subroutes
  if (pathname.startsWith('/dashboard')) return null;

  const route = useRouter();
  const { data, error, isPending } = useSession();
  useEffect(() => {
    console.log({ data, error, isPending });
  }, [data, error, isPending]);
  return (
    <nav className="sticky top-0 flex justify-between border-b-2 bg-white px-16 py-4">
      <Link href={'/'}>
        <h1 className="text-center font-bold text-black text-lg">Sofor 🚌</h1>
      </Link>
      <div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="">
              {data?.session ? (
                <>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/profile">Profile</Link>
                  </NavigationMenuLink>

                  {data.user.role === 'admin' && (
                    <Button className="ml-2" type="button" variant="secondary">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  )}
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Button
                      className="ml-2 bg-red-600 hover:bg-red-700 hover:text-white"
                      onClick={async () => {
                        await signOut({
                          fetchOptions: {
                            onSuccess() {
                              route.push('/');
                            },
                          },
                        });
                      }}
                    >
                      Sign Out
                    </Button>
                  </NavigationMenuLink>
                </>
              ) : (
                <>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/signup">Sign Up</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/signin">Sign In</Link>
                  </NavigationMenuLink>
                </>
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

export default NavBar;
