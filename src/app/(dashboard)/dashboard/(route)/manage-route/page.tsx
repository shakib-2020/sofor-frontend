import ManageRouteForm from "./manage-route-form";

function page() {
	return (
		<div>
			<div>
				<h2 className="mb-2 font-bold text-2xl">Manage Counter</h2>
				<p className="font-semibold text-gray-600 text-sm">
					Manage all your routes. You can add, delete, or edit them.
				</p>
			</div>
			{/* form */}
			<ManageRouteForm />
		</div>
	);
}

export default page;
