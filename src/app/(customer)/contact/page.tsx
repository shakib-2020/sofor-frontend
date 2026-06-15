"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormState({ name: "", email: "", subject: "", message: "" });
  };

  const contactDetails = [
    {
      icon: <Mail className="h-5 w-5 text-emerald-600" />,
      title: "Email Support",
      details: "support@sofor.com",
      subtext: "Expect a response within 2 hours.",
    },
    {
      icon: <Phone className="h-5 w-5 text-emerald-600" />,
      title: "Customer Hotline",
      details: "+1 (555) 123-4567",
      subtext: "Available 24/7 for booking issues.",
    },
    {
      icon: <MapPin className="h-5 w-5 text-emerald-600" />,
      title: "Our Head Office",
      details: "123 Bus Station Road, City Center, Country",
      subtext: "Walk-in support: 9:00 AM - 5:00 PM.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e5c42] to-[#083b2a] pt-20 pb-24 text-white lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c573e_1px,transparent_1px),linear-gradient(to_bottom,#0c573e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-black text-4xl sm:text-5xl tracking-tight leading-[1.15] mb-6">
            We'd Love to Hear <span className="text-[#a7f3d0]">From You</span>
          </h1>
          <p className="text-emerald-100/90 text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about booking refunds, rescheduling, or operator partners? Get in touch with our support crew.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <h2 className="font-bold text-3xl text-gray-900 tracking-tight">Contact Information</h2>
              <p className="text-gray-600 text-sm">
                Get in touch through any of the channels below or fill out our enquiry form.
              </p>
            </div>

            <div className="space-y-6">
              {contactDetails.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-gray-900">{item.title}</h3>
                    <p className="text-sm font-semibold text-emerald-700">{item.details}</p>
                    <p className="text-xs text-gray-500">{item.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-2xl text-gray-900">Message Sent!</h3>
                <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to Sofor. Our support desk will review your submission and reply shortly.
                </p>
                <Button
                  onClick={() => setIsSuccess(false)}
                  variant="outline"
                  className="mt-4 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-gray-900">Send an Enquiry</h3>
                  <p className="text-xs text-gray-500">Fill in the details below and we will get back to you.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      required
                      id="name"
                      type="text"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="e.g. Adnan Rahman"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      required
                      id="email"
                      type="email"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="e.g. adnan@gmail.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    required
                    id="subject"
                    type="text"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="How can we help you?"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    required
                    id="message"
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="Describe your issue or feedback in details..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
