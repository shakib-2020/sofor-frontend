'use client';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { usePathname, useRouter } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { signOut } from '@/lib/auth-client';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/auth-context';

function NavBar() {
  const pathname = usePathname();
  const route = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Hide Navbar on /dashboard and all its subroutes
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 flex justify-between border-b-2 bg-white px-16 py-4">
      <Link href={'/'}>
        <Logo className="h-10 w-auto" />
      </Link>
      <div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="">
              {isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : isAuthenticated ? (
                <>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/my-bookings">Bookings</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/profile">Profile</Link>
                  </NavigationMenuLink>


                  {user?.role === 'admin' && (
                    <Button className="ml-2" type="button" variant="secondary">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  )}

                  <Button
                    className="ml-2 bg-red-600 hover:bg-red-700 text-white"
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
                    <Link href="/sign-in">Sign In</Link>
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
