import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <SidebarProvider>
        <AppSidebar collapsible="icon" variant="sidebar" />
        <SidebarInset>
          <SiteHeader />
          <div className="pt-2 pl-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
     </main>
  );
}
