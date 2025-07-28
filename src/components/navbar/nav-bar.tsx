'use client';
import Link from 'next/link';
import React, { useEffect } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { signOut, useSession } from '@/lib/auth-client';
import { Button } from '../ui/button';
import { usePathname, useRouter } from 'next/navigation';
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
    <nav className="flex justify-between px-16 py-4 border-b-2 sticky top-0 bg-white">
      <Link href={'/'}>
        <h1 className="text-lg font-bold text-black text-center">Sofor 🚌</h1>
      </Link>
      <div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="">
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/">Home</Link>
              </NavigationMenuLink>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/profile">Profile</Link>
              </NavigationMenuLink>
              {!data?.session ? (
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
              ) : (
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Button
                    onClick={async () => {
                      await signOut({
                        fetchOptions: {
                          onSuccess() {
                            route.push('/');
                          },
                        },
                      });
                    }}
                    className="bg-red-600 hover:bg-red-700 hover:text-white"
                  >
                    Sign Out
                  </Button>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

export default NavBar;
