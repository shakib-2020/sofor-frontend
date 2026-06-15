import SearchForm from '@/components/bus-search/search-form';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gray-50 py-12">
      <div className="flex flex-col items-center">
        <h1 className="mb-8 text-center font-bold text-4xl text-gray-800">
          Bus Ticket Booking
        </h1>

        <SearchForm />

        {/* About Us Section */}
        <section id="about" className="mt-24 w-full max-w-6xl px-6">
          <div className="rounded-2xl bg-white p-8 shadow-sm md:p-12">
            <h2 className="mb-6 text-center font-bold text-3xl text-gray-900">About Us</h2>
            <p className="mx-auto max-w-3xl text-center text-gray-600 text-lg leading-relaxed">
              Sofor is your premier bus ticket booking platform, dedicated to making your travel experience seamless and comfortable. 
              We connect you with top-rated bus operators across the country, ensuring safe and reliable journeys. 
              Whether you're planning a quick getaway or a long-distance trip, Sofor simplifies the booking process so you can focus on the journey ahead.
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="mt-16 w-full max-w-6xl px-6 pb-16">
          <h2 className="mb-10 text-center font-bold text-3xl text-gray-900">Our Services</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Service 1 */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ticket"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
              </div>
              <h3 className="mb-2 font-semibold text-xl text-gray-900">Easy Booking</h3>
              <p className="text-gray-600">
                Search, compare, and book bus tickets in just a few clicks. Our user-friendly interface makes booking a breeze.
              </p>
            </div>

            {/* Service 2 */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="mb-2 font-semibold text-xl text-gray-900">Secure Payments</h3>
              <p className="text-gray-600">
                Your transactions are safe with us. We use industry-standard encryption to ensure secure and reliable payments.
              </p>
            </div>

            {/* Service 3 */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="mb-2 font-semibold text-xl text-gray-900">Real-time Availability</h3>
              <p className="text-gray-600">
                Get up-to-the-minute updates on seat availability. Choose your preferred seats and travel with peace of mind.
              </p>
            </div>

            {/* Service 4 */}
            <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-headset"><path d="M3 11v3a8 8 0 0 0 16 0v-3"/><path d="M14 6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M18 11.5V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2.5"/><path d="M6 11.5V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2.5"/><path d="M22 11v3a10.6 10.6 0 0 1-1.6 5.5"/><path d="M2 11v3a10.6 10.6 0 0 0 1.6 5.5"/><path d="M12 22a7 7 0 0 0 7-7h-2a5 5 0 0 1-5 5 5 5 0 0 1-5-5H5a7 7 0 0 0 7 7Z"/></svg>
              </div>
              <h3 className="mb-2 font-semibold text-xl text-gray-900">24/7 Support</h3>
              <p className="text-gray-600">
                Our dedicated customer support team is available round the clock to assist you with any queries or issues.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
