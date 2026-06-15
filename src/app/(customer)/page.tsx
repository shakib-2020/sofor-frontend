"use client";

import SearchForm from "@/components/bus-search/search-form";
import {
  Ticket,
  ShieldCheck,
  Clock,
  Headset,
  MapPin,
  Star,
  ArrowRight,
  Bus,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Percent,
  Award,
  Users
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  // Coupon copying micro-interaction state
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Static Data
  const promotions = [
    {
      code: "SOFORFIRST",
      discount: "15% OFF",
      title: "First Trip Discount",
      desc: "Get 15% off on your very first booking with Sofor.",
      bgColor: "from-emerald-500 to-teal-600"
    },
    {
      code: "BKASH20",
      discount: "10% CASHBACK",
      title: "bKash Payment Special",
      desc: "Enjoy up to 10% instant cashback when paying via bKash.",
      bgColor: "from-pink-500 to-rose-600"
    },
    {
      code: "WKNDJOY",
      discount: "BDT 150 OFF",
      title: "Weekend Getaways",
      desc: "Flat discount on all weekend departures booked by Thursday.",
      bgColor: "from-amber-500 to-orange-600"
    }
  ];

  const popularRoutes = [
    {
      from: "Dhaka",
      to: "Cox's Bazar",
      price: "1,200",
      duration: "8-9 hours",
      tag: "Best Seller",
      operators: "Hanif, Green Line, Shyamoli",
      gradient: "from-amber-500/20 via-orange-600/30 to-slate-900"
    },
    {
      from: "Dhaka",
      to: "Sylhet",
      price: "650",
      duration: "5-6 hours",
      tag: "Scenic Route",
      operators: "Ena, Shyamoli, Green Line",
      gradient: "from-emerald-500/20 via-teal-700/30 to-slate-900"
    },
    {
      from: "Dhaka",
      to: "Chittagong",
      price: "700",
      duration: "5 hours",
      tag: "Business Route",
      operators: "Hanif, Shohagh, Saintmartin",
      gradient: "from-blue-500/20 via-indigo-700/30 to-slate-900"
    },
    {
      from: "Dhaka",
      to: "Sreemangal",
      price: "550",
      duration: "4.5 hours",
      tag: "Popular Getaway",
      operators: "Ena Transport, Hanif Enterprise",
      gradient: "from-lime-500/20 via-emerald-800/30 to-slate-900"
    }
  ];

  const services = [
    {
      icon: <Ticket className="h-6 w-6 text-emerald-600" />,
      title: "Super Easy Booking",
      desc: "Search, compare, and book bus tickets in just three simple clicks. Our interface is optimized for speed and simplicity."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
      title: "100% Secure Payments",
      desc: "Your transactions are protected. We support bKash, Nagad, local debit/credit cards, and internet banking gateways."
    },
    {
      icon: <Clock className="h-6 w-6 text-emerald-600" />,
      title: "Real-time Seat Selection",
      desc: "See live, up-to-the-minute seat availability. Select your preferred seat and board with complete peace of mind."
    },
    {
      icon: <Headset className="h-6 w-6 text-emerald-600" />,
      title: "24/7 Helpline Support",
      desc: "Have a question or need a cancellation refund? Our dedicated helpdesk operates round the clock to support your journey."
    }
  ];

  const stats = [
    { value: "100K+", label: "Tickets Sold", icon: <Ticket className="h-5 w-5 text-emerald-400" /> },
    { value: "64", label: "Districts Covered", icon: <MapPin className="h-5 w-5 text-emerald-400" /> },
    { value: "500+", label: "Buses Active", icon: <Bus className="h-5 w-5 text-emerald-400" /> },
    { value: "25+", label: "Partner Operators", icon: <Award className="h-5 w-5 text-emerald-400" /> }
  ];

  const testimonials = [
    {
      name: "Rakibul Hasan",
      route: "Dhaka to Sylhet",
      rating: 5,
      comment: "Booking on Sofor was incredibly fast! I bought my ticket in 2 minutes and selected my preferred window seat. The digital SMS ticket was accepted seamlessly at the boarding counter.",
      avatarBg: "bg-emerald-100 text-emerald-800"
    },
    {
      name: "Nusrat Jahan",
      route: "Dhaka to Cox's Bazar",
      rating: 5,
      comment: "Highly impressed by their support team. My plans changed, and they assisted me in rescheduling my trip within minutes. The secure payment checkout is very reliable.",
      avatarBg: "bg-teal-100 text-teal-800"
    },
    {
      name: "Adnan Chowdhury",
      route: "Dhaka to Sreemangal",
      rating: 4,
      comment: "Wonderful interface. I like how simple it is compared to other platforms. Clean design, clear prices, no hidden booking charges. Definitely booking here from now on.",
      avatarBg: "bg-cyan-100 text-cyan-800"
    }
  ];

  const faqs = [
    {
      q: "How do I book a bus ticket on Sofor?",
      a: "Simply select your starting city in 'From', your destination city in 'To', choose your travel date, and click 'Search Buses'. You'll see a list of available buses, operators, and seat layouts. Pick your seats, enter traveler details, complete the payment, and you're good to go!"
    },
    {
      q: "Is payment secure on Sofor?",
      a: "Absolutely. We use industry-standard encryption for all transactions. You can safely pay using popular local mobile wallets (bKash, Nagad, Rocket), cards (Visa, Mastercard), or net banking."
    },
    {
      q: "Will I receive a physical ticket?",
      a: "No physical ticket is needed. Once payment is successful, you will receive a digital ticket via SMS and Email. Show this digital ticket at the counter before boarding to claim your boarding pass."
    },
    {
      q: "Can I cancel my ticket or request a refund?",
      a: "Yes, ticket cancellation policies depend on the respective operator. You can initiate a cancellation from your Profile/My Bookings tab or by contacting our 24/7 customer support team at least 6 hours before departure."
    },
    {
      q: "What if my booking fails but the money was deducted?",
      a: "Do not worry. If the amount is deducted but the ticket is not issued, our system automatically processes a refund back to your payment source. Typically, it takes 24-48 hours depending on your banking provider."
    }
  ];

  const operators = [
    "Green Line Paribahan",
    "Hanif Enterprise",
    "Shyamoli S.P.",
    "Ena Transport",
    "Saintmartin Travels",
    "Shohagh Paribahan",
    "Silk Line"
  ];

  return (
    <main className="min-h-screen w-full bg-slate-50/50">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e5c42] to-[#083b2a] pt-20 pb-24 text-white lg:pt-28 lg:pb-32">
        {/* Subtle decorative grid/glow pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c573e_1px,transparent_1px),linear-gradient(to_bottom,#0c573e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        
        {/* Ticket SVG background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
          <img src="/sofor_ticket_logo.svg" alt="Ticket Backdrop" className="w-full max-w-6xl h-auto object-contain scale-110 lg:scale-125" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-10">
            {/* Header pill with blinking dot */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-950/40 backdrop-blur-md px-5 py-2 text-xs font-semibold text-emerald-300 border border-emerald-500/20 shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              Bangladesh's Smart Bus Platform
            </div>
            
            {/* Main Headline */}
            <div className="space-y-4 max-w-3xl">
              <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15]">
                Book Your Bus Ticket <br className="hidden sm:inline" />
                in <span className="text-[#a7f3d0]">Seconds</span>
              </h1>
            </div>

            {/* Centered Search Card */}
            <div className="w-full max-w-5xl mx-auto">
              <SearchForm />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Lower Highlights Banner */}
      <section className="bg-[#0c5c42] py-4.5 border-t border-[#0b543c] text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap justify-between items-center gap-4 text-center text-xs sm:text-sm font-semibold text-emerald-100/90">
            <span className="flex-1 min-w-[120px]">Secure Payment</span>
            <span className="hidden sm:inline text-emerald-500/50">•</span>
            <span className="flex-1 min-w-[120px]">Instant Confirmation</span>
            <span className="hidden sm:inline text-emerald-500/50">•</span>
            <span className="flex-1 min-w-[120px]">Easy Cancellation</span>
            <span className="hidden sm:inline text-emerald-500/50">•</span>
            <span className="flex-1 min-w-[120px]">24/7 Support</span>
          </div>
        </div>
      </section>

      {/* 3. Promotional Offers Carousel */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="font-bold text-3xl text-gray-900">Exclusive Offers For You</h2>
          <p className="mt-2 text-gray-600">Save big on your next journey with these special coupon codes</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {promotions.map((promo) => (
            <div
              key={promo.code}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.bgColor} p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              {/* Decorative Card Circle */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />

              <div className="flex items-center justify-between">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase backdrop-blur-sm">
                  {promo.discount}
                </span>
                <Percent className="h-5 w-5 text-white/80" />
              </div>
              
              <h3 className="mt-4 font-bold text-xl">{promo.title}</h3>
              <p className="mt-2 text-sm text-white/90 leading-relaxed min-h-[48px]">{promo.desc}</p>
              
              <div className="mt-6 flex items-center justify-between rounded-lg bg-black/15 p-3 backdrop-blur-xs">
                <code className="font-mono font-bold text-sm tracking-wider">{promo.code}</code>
                <button
                  type="button"
                  onClick={() => handleCopyCoupon(promo.code)}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white hover:text-white/80 transition-colors"
                >
                  {copiedCoupon === promo.code ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Popular Routes */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          <div className="text-center sm:text-left">
            <h2 className="font-bold text-3xl text-gray-900">Popular Bus Routes</h2>
            <p className="mt-2 text-gray-600">Quickly book tickets for our most requested destinations</p>
          </div>
          <Link
            href="/ticket"
            className="group flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View All Routes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularRoutes.map((route, index) => (
            <div
              key={`${route.from}-${route.to}-${index}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Styled background abstract gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${route.gradient} opacity-5 transition-opacity group-hover:opacity-10`} />

              <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {route.tag}
              </span>
              
              <h3 className="mt-4 flex items-center gap-2 font-bold text-lg text-gray-900">
                {route.from}
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                {route.to}
              </h3>
              
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-xs text-gray-500">Starts from</span>
                <span className="font-extrabold text-emerald-600 text-xl">৳{route.price}</span>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium text-gray-700">{route.duration}</span>
                </div>
                <div className="truncate flex justify-between gap-2">
                  <span>Operators:</span>
                  <span className="font-medium text-gray-700 truncate max-w-[120px]">{route.operators}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Features Section / Why Choose Us */}
      <section id="services" className="mx-auto mt-24 max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="font-bold text-3xl text-gray-900">Why Choose Sofor?</h2>
          <p className="mt-2 text-gray-600">We make long-distance travel planning completely hassle-free</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((item, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                {item.icon}
              </div>
              <h3 className="mt-5 font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Stats Section */}
      <section className="mt-24 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 py-16 text-white shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {stat.icon}
                </div>
                <span className="font-black text-3xl sm:text-4xl text-emerald-400">
                  {stat.value}
                </span>
                <span className="mt-2 text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Operators Cloud Showcase */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="mb-8 text-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Partnered with leading transport providers
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 opacity-60 hover:opacity-80 transition-opacity">
          {operators.map((op, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200/60 bg-white px-5 py-2.5 font-bold text-sm text-gray-700 tracking-wide shadow-xs hover:border-emerald-300 hover:text-emerald-700 transition-all cursor-default"
            >
              {op}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="font-bold text-3xl text-gray-900">What Our Travelers Say</h2>
          <p className="mt-2 text-gray-600">Read verified reviews from passengers who booked with us</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>
              
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${t.avatarBg}`}>
                  {t.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{t.name}</h4>
                  <span className="text-xs text-gray-500">Traveler ({t.route})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FAQs Section */}
      <section id="about" className="mx-auto my-24 max-w-4xl px-6">
        <div className="mb-12 text-center">
          <h2 className="font-bold text-3xl text-gray-900">Frequently Asked Questions</h2>
          <p className="mt-2 text-gray-600">Quick answers to common questions about booking and cancellations</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between px-6 py-4.5 text-left font-semibold text-gray-900 hover:text-emerald-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-600 leading-relaxed bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
