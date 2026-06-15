import ManageBusOwner from './manage-bus-owner-form';
import { SuperAdminOnlyRoute } from '@/components/auth/route-guards';

function page() {
  return (
    <SuperAdminOnlyRoute>
      <div>
        <div>
          <h2 className="mb-2 font-bold text-2xl">Manage Bus Owner</h2>
          <p className="font-semibold text-gray-600 text-sm">
            Manage all your bus owner. You can add, delete, or edit them.
          </p>
        </div>
        {/* form */}
        <ManageBusOwner />
      </div>
    </SuperAdminOnlyRoute>
  );
}

export default page;
