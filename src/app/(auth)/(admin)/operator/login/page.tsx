import RoleLoginForm from '@/components/auth/role-login-form';
import { ROLES } from '@/lib/permissions';

export default function OperatorLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-zinc-900 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <span className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            SOFOR
          </span>
          <span className="block text-xs uppercase tracking-widest text-slate-400 mt-1">
            Operator Management
          </span>
        </div>
        <RoleLoginForm
          allowedRoles={[ROLES.OPERATOR_ADMIN, ROLES.OPERATOR_MANAGER, ROLES.OPERATOR_STAFF]}
          portalName="Bus Operator Portal"
          redirectPath="/dashboard"
          themeColor="emerald"
          bgGradient="from-emerald-600 to-teal-700"
        />
      </div>
    </div>
  );
}
