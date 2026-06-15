import RoleLoginForm from '@/components/auth/role-login-form';
import { ROLES } from '@/lib/permissions';

export default function CounterLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-zinc-900 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <span className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            SOFOR
          </span>
          <span className="block text-xs uppercase tracking-widest text-slate-400 mt-1">
            Ticket Counter
          </span>
        </div>
        <RoleLoginForm
          allowedRoles={[ROLES.COUNTER_OWNER, ROLES.COUNTER_STAFF]}
          portalName="Ticket Counter Portal"
          redirectPath="/dashboard"
          themeColor="sky"
          bgGradient="from-sky-600 to-blue-700"
        />
      </div>
    </div>
  );
}
