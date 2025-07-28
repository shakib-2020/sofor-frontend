import { AddTripForm } from './add-trip-form';

function page() {
  return <div>
    <div>
      <h2 className='text-2xl font-bold mb-2'>Add Trip</h2>
      <p className='text-sm font-semibold text-gray-600'>Enter information to add a new counter to the list.</p>
    </div>
    {/* form */}
    <AddTripForm />
  </div>;
}

export default page;
