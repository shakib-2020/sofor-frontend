import ManageTrip from "./manage-trip-form";

function page() {
	return (
		<div>
			<div>
				<h2 className="mb-2 font-bold text-2xl">Manage Trips</h2>
				<p className="font-semibold text-gray-600 text-sm">
					Manage all trips. You can add, delete, or edit them.
				</p>
			</div>
			{/* form */}
			<ManageTrip />
		</div>
	);
}

export default page;
