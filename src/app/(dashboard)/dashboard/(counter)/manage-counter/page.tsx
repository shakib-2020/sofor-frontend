import ManageCounter from "./manage-counter-form";
import { OperatorAdminOrAboveRoute } from "@/components/auth/route-guards";

function page() {
	return (
		<OperatorAdminOrAboveRoute>
			<div>
				<div>
					<h2 className="mb-2 font-bold text-2xl">Manage Counter</h2>
					<p className="font-semibold text-gray-600 text-sm">
						Manage all your bus counter. You can add, delete, or edit them.
					</p>
				</div>
				{/* form */}
				<ManageCounter />
			</div>
		</OperatorAdminOrAboveRoute>
	);
}

export default page;
