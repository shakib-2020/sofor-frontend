import { AddBusForm } from "./add-bus-form";

function page() {
	return (
		<div>
			<div>
				<h2 className="mb-2 font-bold text-2xl">Create Bus</h2>
				<p className="font-semibold text-gray-600 text-sm">
					Enter information to add a new bus to the list.
				</p>
			</div>
			{/* form */}
			<AddBusForm />
		</div>
	);
}

export default page;
