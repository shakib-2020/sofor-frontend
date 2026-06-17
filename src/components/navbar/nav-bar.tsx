'use client';
import { useState } from 'react';
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
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

function NavBar() {
  const pathname = usePathname();
  const route = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getSignInUrl = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname + window.location.search;
      return `/sign-in?callbackUrl=${encodeURIComponent(currentUrl)}`;
    }
    return '/sign-in';
  };

  const getSignUpUrl = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname + window.location.search;
      return `/signup?callbackUrl=${encodeURIComponent(currentUrl)}`;
    }
    return '/signup';
  };

  // Hide Navbar on /dashboard and all its subroutes
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center border-b-2 bg-white px-6 md:px-16 py-4">
      <Link href={'/'}>
        <Logo className="h-10 w-auto" />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:block">
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
                    <Link href="/ai">AI Agent</Link>
                  </NavigationMenuLink>
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
                    <Link href={getSignUpUrl()}>Sign Up</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href={getSignInUrl()}>Sign In</Link>
                  </NavigationMenuLink>
                </>
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 p-0 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 bg-white flex flex-col justify-between">
            <div className="flex flex-col space-y-6">
              <SheetHeader className="text-left border-b pb-4">
                <SheetTitle className="flex items-center justify-between">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <Logo className="h-8 w-auto" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse h-10 bg-gray-100 rounded-lg"></div>
                    <div className="animate-pulse h-10 bg-gray-100 rounded-lg"></div>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <Link
                      href="/ai"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3 text-base font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      AI Assistant
                    </Link>
                    <Link
                      href="/my-bookings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3 text-base font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      Bookings
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3 text-base font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      Profile
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-4 py-3 text-base font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all"
                      >
                        Dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href={getSignUpUrl()}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3 text-base font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      Sign Up
                    </Link>
                    <Link
                      href={getSignInUrl()}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3 text-base font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </nav>
            </div>
            {isAuthenticated && !isLoading && (
              <div className="border-t pt-4">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  onClick={async () => {
                    setIsOpen(false);
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
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default NavBar;
