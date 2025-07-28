import CreateRouteForm from "./add-route-form";

function page() {
  return <div>
    <div>
      <h2 className='text-2xl font-bold mb-2'>Create Route</h2>
      <p className='text-sm font-semibold text-gray-600'>Enter information to add a new route to the list.</p>
    </div>
    {/* form */}
    <CreateRouteForm />
  </div>;
}

export default page;
