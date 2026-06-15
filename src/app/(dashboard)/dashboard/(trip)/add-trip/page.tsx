import { AddTripForm } from './add-trip-form';
import { OperatorAdminOrAboveRoute } from '@/components/auth/route-guards';

function page() {
  return (
    <OperatorAdminOrAboveRoute>
      <div>
        <div>
          <h2 className="mb-2 font-bold text-2xl">Add Trip</h2>
          <p className="font-semibold text-gray-600 text-sm">
            Enter information to add a new counter to the list.
          </p>
        </div>
        {/* form */}
        <AddTripForm />
      </div>
    </OperatorAdminOrAboveRoute>
  );
}

export default page;
