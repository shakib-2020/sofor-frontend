import ManageBusOwner from './manage-bus-owner-form';

function page() {
  return (
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
  );
}

export default page;
