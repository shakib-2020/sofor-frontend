import RoleLoginForm from '@/components/auth/role-login-form';
import { ROLES } from '@/lib/permissions';

export default function CounterLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <RoleLoginForm
          allowedRoles={[ROLES.COUNTER_OWNER, ROLES.COUNTER_STAFF]}
          portalName="Ticket Counter Portal"
          redirectPath="/dashboard"
        />
      </div>
    </div>
  );
}
