import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <SidebarProvider>
        <AppSidebar variant="sidebar" collapsible="icon" />
        <SidebarInset>
          <SiteHeader />
          <div className="pl-4 pt-2">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </main>
  );
}
