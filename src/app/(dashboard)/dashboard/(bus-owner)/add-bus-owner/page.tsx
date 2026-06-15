import { AddBusOwnerForm } from "./add-bus-owner-form";
import { SuperAdminOnlyRoute } from "@/components/auth/route-guards";

function page() {
	return (
		<SuperAdminOnlyRoute>
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
		</SuperAdminOnlyRoute>
	);
}

export default page;
