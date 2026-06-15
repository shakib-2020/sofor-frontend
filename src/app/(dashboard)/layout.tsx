import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ROLES } from '@/lib/permissions';

export default function Layout({ children }: { children: React.ReactNode }) {
  const allowedDashboardRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.OPERATOR_ADMIN,
    ROLES.OPERATOR_MANAGER,
    ROLES.OPERATOR_STAFF,
    ROLES.COUNTER_OWNER,
    ROLES.COUNTER_STAFF,
    'admin',
    'operator_admin',
    'operator_manager',
    'operator_staff',
    'counter_owner',
    'counter_staff',
  ];

  return (
    <AuthGuard allowedRoles={allowedDashboardRoles} redirectTo="/sign-in">
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
    </AuthGuard>
  );
}
