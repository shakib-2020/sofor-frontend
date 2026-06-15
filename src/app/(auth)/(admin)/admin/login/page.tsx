import RoleLoginForm from '@/components/auth/role-login-form';
import { ROLES } from '@/lib/permissions';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-zinc-900 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <span className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500">
            SOFOR
          </span>
          <span className="block text-xs uppercase tracking-widest text-slate-400 mt-1">
            System Administration
          </span>
        </div>
        <RoleLoginForm
          allowedRoles={[ROLES.SUPER_ADMIN, 'admin']}
          portalName="Super Admin Portal"
          redirectPath="/dashboard"
          themeColor="rose"
          bgGradient="from-rose-600 to-red-700"
        />
      </div>
    </div>
  );
}
