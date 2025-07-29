import React from 'react';
import { AddCounterForm } from './add-counter-form';
import { addCounterSiteText } from './sitetext';

function page() {
  const { page_info } = addCounterSiteText;
  return (
    <div>
      <div>
        <h2 className="mb-2 font-bold text-2xl">{page_info.title}</h2>
        <p className="font-semibold text-gray-600 text-sm">{page_info.desc}</p>
      </div>
      {/* form */}
      <AddCounterForm />
    </div>
  );
}

export default page;
