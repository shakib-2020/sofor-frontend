import React from "react";
import { AddCounterForm } from "./add-counter-form";
import { addCounterSiteText } from "./sitetext";

function page() {
  const { page_info } = addCounterSiteText;
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold mb-2">{page_info.title}</h2>
        <p className="text-sm font-semibold text-gray-600">{page_info.desc}</p>
      </div>
      {/* form */}
      <AddCounterForm />
    </div>
  );
}

export default page;
