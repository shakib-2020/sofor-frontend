import CreateRouteForm from './add-route-form';

function page() {
  return (
    <div>
      <div>
        <h2 className="mb-2 font-bold text-2xl">Create Route</h2>
        <p className="font-semibold text-gray-600 text-sm">
          Enter information to add a new route to the list.
        </p>
      </div>
      {/* form */}
      <CreateRouteForm />
    </div>
  );
}

export default page;
