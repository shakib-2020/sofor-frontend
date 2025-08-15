import ManageBus from "./manage-bus-form";

function page() {
	return (
		<div>
			<div>
				<h2 className="mb-2 font-bold text-2xl">Manage Bus</h2>
				<p className="font-semibold text-gray-600 text-sm">
					Manage all your buses. You can add, delete, or edit them.
				</p>
			</div>
			{/* form */}
			<ManageBus />
		</div>
	);
}

export default page;
