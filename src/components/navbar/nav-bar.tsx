import Link from "next/link";
import React from "react";
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
} from "@/components/ui/navigation-menu";
function NavBar() {
  return (
    <nav className="flex justify-between px-16 py-4 border-b-2 sticky top-0 bg-white">
      <Link href={"/"}>
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
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

export default NavBar;
