import { AddBusForm } from "./add-bus-form";
import { OperatorAdminOrAboveRoute } from "@/components/auth/route-guards";

function page() {
	return (
		<OperatorAdminOrAboveRoute>
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
		</OperatorAdminOrAboveRoute>
	);
}

export default page;
