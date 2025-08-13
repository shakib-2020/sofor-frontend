import { AddBusOwnerForm } from "./add-bus-owner-form";

function page() {
	return (
		<div>
			<div>
				<h2 className="mb-2 font-bold text-2xl">Create Bus Owner</h2>
				<p className="font-semibold text-gray-600 text-sm">
					Enter information to add a new owner to the list.
				</p>
			</div>
			{/* form */}
			<AddBusOwnerForm />
		</div>
	);
}

export default page;
