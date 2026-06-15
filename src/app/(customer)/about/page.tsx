"use client";

import { Users, Award, Shield, MapPin, Heart, Target, Bus } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Happy Passengers", value: "100K+" },
    { label: "Active Routes", value: "150+" },
    { label: "Partner Operators", value: "25+" },
    { label: "Customer Satisfaction", value: "4.9/5" },
  ];

  const values = [
    {
      icon: <Shield className="h-6 w-6 text-emerald-600" />,
      title: "Safety First",
      description: "We work only with vetted and highly-rated transport providers to ensure your journeys are safe and comfortable.",
    },
    {
      icon: <Heart className="h-6 w-6 text-emerald-600" />,
      title: "Passenger Love",
      description: "Our customer support works round-the-clock to handle issues, refunds, and rescheduling instantly.",
    },
    {
      icon: <Target className="h-6 w-6 text-emerald-600" />,
      title: "Smart Booking",
      description: "A super-fast three-click booking process with real-time seat availability and instant confirmations.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e5c42] to-[#083b2a] pt-20 pb-24 text-white lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c573e_1px,transparent_1px),linear-gradient(to_bottom,#0c573e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-black text-4xl sm:text-5xl tracking-tight leading-[1.15] mb-6">
            Redefining Bus Travel in <span className="text-[#a7f3d0]">Bangladesh</span>
          </h1>
          <p className="text-emerald-100/90 text-lg max-w-2xl mx-auto leading-relaxed">
            At Sofor, we believe long-distance travel should be stress-free, convenient, and safe. We're bridging the gap between local travelers and premium transport operators.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-bold text-3xl text-gray-900 tracking-tight">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Sofor is Bangladesh's smart bus ticketing platform. We simplify booking workflows for thousands of passengers daily. By integrating secure payments, live seat sync, and immediate ticket confirmation, we allow you to secure your seats in seconds.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We started with a simple goal: to eliminate long queues at the counter and provide travelers with absolute transparency over seat layout, pricing, and timing.
            </p>
          </div>
          <div className="relative p-8 bg-emerald-50 rounded-[32px] border border-emerald-100">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Bus className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl text-emerald-800">100% Digital Ticketing</h3>
              <p className="text-sm text-emerald-700/80 leading-relaxed">
                Show your SMS or PDF ticket at the boarding point and skip the counter queue entirely. That's the Sofor guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-slate-900 text-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="font-black text-3xl sm:text-4xl text-emerald-400">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-14 text-center">
          <h2 className="font-bold text-3xl text-gray-900">Our Core Values</h2>
          <p className="mt-2 text-gray-600">The values that guide our product and service decisions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-6">
                {val.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">{val.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{val.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
