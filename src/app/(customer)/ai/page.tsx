"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChat, UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAuth } from "@/lib/auth-context";
import { apiClient, paymentAPI } from "@/lib/api";
import { generateTicketPDF } from "@/lib/ticket-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Bot,
  User,
  Ticket,
  MapPin,
  Settings,
  ArrowRight,
  Search,
  CreditCard,
  Lock,
  Check,
  Download,
  Plus,
  ChevronRight,
  Snowflake,
  Clock,
  ArrowLeft,
  Loader2,
  Armchair,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  MessageSquare,
  Monitor,
  ExternalLink,
} from "lucide-react";

type Trip = {
  id: number;
  trip_number: string;
  heading: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  duration: string;
  fare: number;
  bus_info: {
    id: number;
    name: string;
    ac: boolean;
  };
  seats_left: number;
  available_seats?: string[];
};

type SeatMapItem = {
  id: number;
  seatName: string;
  status: "available" | "locked" | "booked";
  isMine?: boolean;
};

function renderMarkdown(text: string) {
  if (!text) return null;
  return text.split("\n").map((line, idx) => {
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
    let content = isBullet ? line.trim().substring(2) : line;

    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    const tokens = content.split(regex);

    tokens.forEach((token, index) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={index} className="font-extrabold">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={index} className="italic">
            {token.slice(1, -1)}
          </em>
        );
      } else {
        parts.push(token);
      }
    });

    if (isBullet) {
      return (
        <li key={idx} className="ml-4 list-disc pl-1 mb-1">
          {parts}
        </li>
      );
    }

    return (
      <div key={idx} className={line.trim() === "" ? "h-2" : "min-h-[1.25rem]"}>
        {parts}
      </div>
    );
  });
}

// Renders clickable bKash links found in AI text messages
function renderTextWithLinks(text: string) {
  if (!text) return null;

  // Convert raw URLs to markdown links first
  const processedText = text.replace(/(?<!\]\()https?:\/\/[^\s)]+/g, (url) => {
    if (url.includes("bkash")) {
      return `[Pay with bKash](${url})`;
    }
    return `[Open Link](${url})`;
  });

  // Split text by markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(processedText)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(...(renderMarkdown(processedText.substring(lastIndex, match.index)) || []));
    }

    // Add the link as a button
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={`link-${match.index}`}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-2 mb-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-800/15 transition-all hover:shadow-lg no-underline"
      >
        <CreditCard className="h-3.5 w-3.5" />
        {linkText}
        <ExternalLink className="h-3 w-3 opacity-70" />
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < processedText.length) {
    parts.push(...(renderMarkdown(processedText.substring(lastIndex)) || []));
  }

  return parts.length > 0 ? parts : renderMarkdown(processedText);
}

export default function AIAssistantPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // ===== Mode State =====
  const [interactionMode, setInteractionMode] = useState<"chat" | "ui">("chat");

  // Custom Chat and Booking states
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedRoute, setSelectedRoute] = useState<string>("Bogra → Dhaka · Tomorrow");

  const [tripsList, setTripsList] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const [seatsList, setSeatsList] = useState<SeatMapItem[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatMapItem[]>([]);
  const [seatLoading, setSeatLoading] = useState(false);

  const [passengerName, setPassengerName] = useState(user?.name || "");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerEmail, setPassengerEmail] = useState(user?.email || "");
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Nagad" | "Card">("bKash");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [bkashUrl, setBkashUrl] = useState<string | null>(null);
  const [paymentPolling, setPaymentPolling] = useState(false);

  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Sort/Filter states inside interactive Trip Card
  const [sortCriteria, setSortCriteria] = useState<"price" | "time">("price");
  const [acFilter, setAcFilter] = useState(false);

  // Chat-mode payment polling state
  const [chatPaymentPolling, setChatPaymentPolling] = useState(false);
  const [chatPaymentId, setChatPaymentId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");

  // Create transport that sends mode along with messages
  const chatTransportRef = useRef(
    new DefaultChatTransport({
      api: "/api/ai/chat",
      body: { mode: "chat" },
    })
  );

  // Update transport when mode changes
  useEffect(() => {
    chatTransportRef.current = new DefaultChatTransport({
      api: "/api/ai/chat",
      body: { mode: interactionMode },
    });
  }, [interactionMode]);

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: chatTransportRef.current,
    messages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Hi! I am **Sofor AI**, your smart ticketing assistant. 🚌\n\nI can help you search, compare, and book bus tickets instantly. Where would you like to travel? (e.g. *\"bogra to dhaka tomorrow\"*)"
          }
        ]
      }
    ] as UIMessage[],
    onError: (err) => {
      toast.error(err.message || "Failed to query AI assistant.");
    },
    onFinish: () => {
      // Auto scroll to bottom
      scrollToBottom();
    }
  });

  const aiLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  // Load user details when auth context loads
  useEffect(() => {
    if (user) {
      if (!passengerName) setPassengerName(user.name || "");
      if (!passengerEmail) setPassengerEmail(user.email || "");
    }
  }, [user]);

  // Handle parsing of tool execution inside Vercel AI SDK messages (UI mode)
  useEffect(() => {
    if (interactionMode !== "ui") return; // Only auto-advance steps in UI mode

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && lastMessage.parts) {
      for (const part of lastMessage.parts) {
        const p = part as any;
        if (p.type === "tool-search_trips" && p.state === "output-available") {
          const result = p.output;
          if (result.trips && result.trips.length > 0 && tripsList.length === 0) {
            setTripsList(result.trips);
            setSelectedRoute(`${result.origin} → ${result.destination} · ${result.date}`);
            setCurrentStep(2); // Move to Trips step
          }
        }
      }
    }
  }, [messages, tripsList.length, interactionMode]);

  // Chat-mode: detect create_booking tool results for payment polling
  useEffect(() => {
    if (interactionMode !== "chat") return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && lastMessage.parts) {
      for (const part of lastMessage.parts) {
        const p = part as any;
        if (p.type === "tool-create_booking" && p.state === "output-available") {
          const result = p.output;
          if (result.success && result.paymentId && chatPaymentId !== result.paymentId) {
            setChatPaymentId(result.paymentId);
            setChatPaymentPolling(true);
            if (result.bkashURL) {
              window.open(result.bkashURL, "_blank");
            }
            startChatPaymentPolling(result.paymentId);
          }
        }
      }
    }
  }, [messages, interactionMode, chatPaymentPolling, chatPaymentId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStep]);

  // Handle click on quick chip buttons
  const handleQuickChip = (text: string) => {
    sendMessage({ text });
  };

  // Filter and sort trips dynamically
  const getProcessedTrips = () => {
    let list = [...tripsList];
    if (acFilter) {
      list = list.filter(t => t.bus_info.ac);
    }
    if (sortCriteria === "price") {
      list.sort((a, b) => a.fare - b.fare);
    } else {
      list.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    }
    return list;
  };

  // Select Trip & Load Seats
  const handleSelectTrip = async (trip: Trip) => {
    setActiveTrip(trip);
    setSeatLoading(true);
    setCurrentStep(3); // Seats step
    setSelectedSeats([]);

    try {
      const res = await apiClient.get(`/api/seat/trip/${trip.id}/map?busId=${trip.bus_info.id}`);
      if (res.data.success) {
        const { seats, myPendingSeatIds } = res.data.data;
        const mappedSeats = (seats || []).map((s: any) => {
          let status = s.status;
          if (status === "pending") {
            status = "locked";
          }
          return {
            id: s.id,
            seatName: s.seatName,
            status: status
          };
        });
        setSeatsList(mappedSeats);

        // Pre-populate selectedSeats with any seats that are currently pending and belong to me
        const myPendingSeats = (seats || [])
          .filter((s: any) => s.status === "pending" && myPendingSeatIds.includes(s.id))
          .map((s: any) => ({
            id: s.id,
            seatName: s.seatName,
            status: "locked" as const
          }));
        setSelectedSeats(myPendingSeats);
      } else {
        toast.error("Failed to load seat layout");
      }
    } catch (err) {
      toast.error("Error loading seats");
    } finally {
      setSeatLoading(false);
    }
  };

  // Lock Seat selection
  const handleSeatClick = async (seatItem: SeatMapItem) => {
    if (!activeTrip) return;
    if (seatItem.status === "booked") return;

    const isSelected = selectedSeats.some(s => s.id === seatItem.id);

    if (isSelected) {
      // Release seat
      try {
        await apiClient.post("/api/seat/release", {
          tripId: activeTrip.id,
          seatId: seatItem.id
        });
        setSelectedSeats(prev => prev.filter(s => s.id !== seatItem.id));
        setSeatsList(prev => prev.map(s => s.id === seatItem.id ? { ...s, status: "available" } : s));
      } catch (err) {
        toast.error("Failed to release seat");
      }
    } else {
      // Check limit
      if (selectedSeats.length >= 4) {
        toast.error("You can select up to 4 seats maximum");
        return;
      }

      // Lock seat
      try {
        const res = await apiClient.post("/api/seat/lock", {
          tripId: activeTrip.id,
          seatId: seatItem.id,
          connectionId: "ai-session"
        });

        if (res.data.success) {
          setSelectedSeats(prev => [...prev, seatItem]);
          setSeatsList(prev => prev.map(s => s.id === seatItem.id ? { ...s, status: "locked" } : s));
        } else {
          toast.error(res.data.message || "Failed to lock seat");
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Seat is taken");
      }
    }
  };

  const calculateTotal = () => {
    if (!activeTrip) return 0;
    return activeTrip.fare * selectedSeats.length;
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    setCurrentStep(4); // Payment form step
  };

  // Submit payment form to get bKash checkout URL
  const handleConfirmPayment = async () => {
    if (!activeTrip || selectedSeats.length === 0) return;
    if (!passengerName || !passengerPhone || !passengerEmail) {
      toast.error("Please fill in all passenger details");
      return;
    }

    const phoneRegex = /^(\+?88)?0?1[3-9]\d{8}$/;
    if (!phoneRegex.test(passengerPhone)) {
      toast.error("Please enter a valid Bangladesh mobile number");
      return;
    }

    setIsPaying(true);

    try {
      const payload = {
        tripId: activeTrip.id,
        busId: activeTrip.bus_info.id,
        seatIds: selectedSeats.map(s => s.id),
        boardingPointId: 1, // Bogra central counter default
        droppingPointId: 2, // Dhaka Gabtoli counter default
        passengerName,
        passengerPhone,
        passengerEmail,
        totalAmount: calculateTotal().toString()
      };

      const res = await paymentAPI.createBookingWithPayment(payload);

      if (res.data.success) {
        const { bkashURL, paymentId } = res.data.data;
        setPaymentId(paymentId);
        setBkashUrl(bkashURL);
        setPaymentPolling(true);

        toast.success("Redirecting to payment portal...");

        // Open bKash in a new tab/window so the chatbot session remains alive in the current tab
        window.open(bkashURL, "_blank");

        // Start polling payment status in background
        startPaymentPolling(paymentId);
      } else {
        toast.error("Failed to initialize payment");
        setIsPaying(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create booking");
      setIsPaying(false);
    }
  };

  // Poll payment status endpoint until completed (UI mode)
  const startPaymentPolling = (payId: string) => {
    let iterations = 0;
    const interval = setInterval(async () => {
      iterations++;
      // Stop polling after 4 minutes (80 iterations)
      if (iterations > 80) {
        clearInterval(interval);
        setPaymentPolling(false);
        setIsPaying(false);
        toast.error("Payment timeout. Please try again.");
        return;
      }

      try {
        const res = await apiClient.get(`/api/payment/status/${payId}`);
        if (res.data.success) {
          const status = res.data.data.status;

          if (status === "completed") {
            clearInterval(interval);
            setPaymentPolling(false);
            setIsPaying(false);

            // Success! Load booking details
            const bookingId = res.data.data.bookingId;
            const bookingRes = await apiClient.get(`/api/booking/${bookingId}`);

            if (bookingRes.data.success) {
              setConfirmedBooking(bookingRes.data.data);
              setCurrentStep(5); // Done!
              toast.success("Ticket booking confirmed!");
            }
          } else if (status === "failed" || status === "cancelled") {
            clearInterval(interval);
            setPaymentPolling(false);
            setIsPaying(false);
            toast.error(`Payment ${status}. Please try again.`);
          }
        }
      } catch (err) {
        // Suppress errors during polling to keep interface smooth
      }
    }, 3000);
  };

  // Poll payment status for chat mode
  const startChatPaymentPolling = (payId: string) => {
    let iterations = 0;
    const interval = setInterval(async () => {
      iterations++;
      if (iterations > 80) {
        clearInterval(interval);
        setChatPaymentPolling(false);
        toast.error("Payment timeout. Please try again.");
        return;
      }

      try {
        const res = await apiClient.get(`/api/payment/status/${payId}`);
        if (res.data.success) {
          const status = res.data.data.status;

          if (status === "completed") {
            clearInterval(interval);
            setChatPaymentPolling(false);

            const bookingId = res.data.data.bookingId;
            const bookingRes = await apiClient.get(`/api/booking/${bookingId}`);

            if (bookingRes.data.success) {
              setConfirmedBooking(bookingRes.data.data);
              toast.success("🎉 Ticket booking confirmed!");
            }
          } else if (status === "failed" || status === "cancelled") {
            clearInterval(interval);
            setChatPaymentPolling(false);
            toast.error(`Payment ${status}. Please try again.`);
          }
        }
      } catch (err) {
        // Suppress errors during polling
      }
    }, 3000);
  };

  // Download PDF ticket
  const handleDownloadTicket = async () => {
    if (!confirmedBooking) return;
    try {
      const seatNames = confirmedBooking.seats?.map((s: any) => s.seatName) || [confirmedBooking.seat?.seatName];
      const seatLabel = seatNames.join(", ");

      const ticketData = {
        bookingNumber: confirmedBooking.bookingNumber,
        passengerName: confirmedBooking.passengerName,
        passengerPhone: confirmedBooking.passengerPhone,
        passengerEmail: confirmedBooking.passengerEmail || "N/A",
        tripHeading: confirmedBooking.trip?.heading || activeTrip?.heading || "Bogra → Dhaka",
        departureDate: confirmedBooking.trip?.departureDateTime?.split("T")[0] || activeTrip?.departure_date || "N/A",
        departureTime: confirmedBooking.trip?.departureDateTime?.split("T")[1]?.substring(0, 5) || activeTrip?.departure_time || "N/A",
        arrivalDate: confirmedBooking.trip?.arrivalDateTime?.split("T")[0] || activeTrip?.arrival_date || "N/A",
        arrivalTime: confirmedBooking.trip?.arrivalDateTime?.split("T")[1]?.substring(0, 5) || activeTrip?.arrival_time || "N/A",
        busName: confirmedBooking.bus?.name || activeTrip?.bus_info.name || "Bus",
        seatNumber: seatLabel,
        seatNumbers: seatNames,
        boardingPoint: confirmedBooking.boardingPoint?.name || "Bogra Central Terminal",
        droppingPoint: confirmedBooking.droppingPoint?.name || "Gabtoli Terminal, Dhaka",
        totalAmount: confirmedBooking.totalAmount,
        paymentMethod: "bKash",
        status: "Confirmed"
      };

      await generateTicketPDF(ticketData);
      toast.success("PDF ticket downloaded!");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleNewSearch = () => {
    window.location.reload();
  };

  // Mode toggle handler
  const handleModeSwitch = (newMode: "chat" | "ui") => {
    setInteractionMode(newMode);
  };

  if (isLoading) {
    return (
      <main className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#0E6E56]" />
          <p className="text-sm text-slate-500 font-semibold">Loading your profile...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="w-full min-h-screen bg-slate-50 flex flex-col">
        {/* Page Header Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0e5c42] to-[#083b2a] py-12 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c573e_1px,transparent_1px),linear-gradient(to_bottom,#0c573e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/40 px-3.5 py-1.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sofor AI Ticketing Agent
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              AI Ticket Booking Assistant
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 max-w-2xl mx-auto">
              Unlock the power of our smart AI assistant to search departures, compare operators, select seats, and complete payment in real time.
            </p>
          </div>
        </section>

        {/* Login Card */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#0E6E56] shadow-sm">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-extrabold text-xl text-slate-900">Login Required</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                You must be logged in to chat with Sofor AI and book tickets. Please sign in or create an account to get started.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <a
                href="/sign-in?callbackUrl=/ai"
                className="w-full h-11 bg-[#0E6E56] hover:bg-[#085041] text-white rounded-xl text-sm font-bold flex items-center justify-center shadow-md shadow-emerald-800/10 hover:shadow-lg transition-all"
              >
                Sign In to Your Account
              </a>
              <a
                href="/signup"
                className="text-xs font-bold text-[#0E6E56] hover:text-[#085041] transition-all"
              >
                Don't have an account? Sign up
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-slate-50 flex flex-col">
      {/* Page Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e5c42] to-[#083b2a] py-8 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c573e_1px,transparent_1px),linear-gradient(to_bottom,#0c573e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/40 px-3.5 py-1.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sofor AI Ticketing Agent
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                AI Ticket Booking Assistant
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
                Chat with Sofor AI to search departures, compare operators, select seats, and complete payment in real time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a href="/ticket" className="text-xs font-bold bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl border border-white/5 text-white transition-all">
                Manual Search
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 md:py-8 flex gap-6 h-[680px]">
        {/* Sidebar Component */}
        <div className="hidden lg:flex w-72 bg-gradient-to-b from-[#0a4837] to-[#052b20] border border-[#0d503d] rounded-2xl flex-col text-slate-100 shrink-0 overflow-hidden shadow-md">
          <div className="flex items-center gap-3 p-6 border-b border-[#0d503d]">
            <div className="h-10 w-10 bg-[#0E6E56] rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wider text-white">SOFOR AI</h1>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Agent
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-emerald-300 font-semibold text-sm cursor-default">
                <Bot className="h-5 w-5 text-emerald-400" />
                AI Assistant
              </div>
              <a href="/my-bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100/70 hover:text-white hover:bg-white/5 transition-all text-sm">
                <Ticket className="h-5 w-5 text-emerald-400/70" />
                My Tickets
              </a>
            </div>

            <div>
              <h3 className="px-4 text-xs font-semibold text-emerald-500/70 uppercase tracking-widest mb-3">
                Quick Routes
              </h3>
              <div className="space-y-1">
                <div onClick={() => handleQuickChip("Dhaka to Cox's Bazar")} className="px-4 py-2 text-xs text-emerald-100/60 hover:bg-white/5 rounded-lg hover:text-white cursor-pointer transition-colors truncate">
                  Dhaka → Cox's Bazar
                </div>
                <div onClick={() => handleQuickChip("Sylhet to Dhaka")} className="px-4 py-2 text-xs text-emerald-100/60 hover:bg-white/5 rounded-lg hover:text-white cursor-pointer transition-colors truncate">
                  Sylhet → Dhaka
                </div>
                <div onClick={() => handleQuickChip("Bogra to Dhaka")} className="px-4 py-2 text-xs text-emerald-100/60 hover:bg-white/5 rounded-lg hover:text-white cursor-pointer transition-colors truncate">
                  Bogra → Dhaka
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-md flex flex-col overflow-hidden min-w-0">

          {/* Top Header with Mode Toggle + Progress Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-6 bg-white border-b border-slate-100 gap-4 shrink-0">
            {/* Left: Mode Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200">
                <button
                  onClick={() => handleModeSwitch("chat")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 ${
                    interactionMode === "chat"
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat
                </button>
                <button
                  onClick={() => handleModeSwitch("ui")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 ${
                    interactionMode === "ui"
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  UI
                </button>
              </div>

              {/* Route badge */}
              {interactionMode === "ui" && (
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 truncate max-w-[200px]">
                    {selectedRoute}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Progress Bar (only in UI mode) */}
            {interactionMode === "ui" && (
              <div className="flex items-center gap-2 md:gap-3">
                {[
                  { s: 1, label: "Search" },
                  { s: 2, label: "Trips" },
                  { s: 3, label: "Seats" },
                  { s: 4, label: "Pay" },
                  { s: 5, label: "Done" }
                ].map((step, idx) => (
                  <React.Fragment key={step.s}>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep > step.s
                        ? "bg-emerald-600 text-white"
                        : currentStep === step.s
                          ? "bg-emerald-600 text-white animate-pulse"
                          : "bg-slate-100 text-slate-400"
                        }`}>
                        {currentStep > step.s ? <Check className="h-3 w-3" /> : step.s}
                      </span>
                      <span className={`text-[10px] md:text-xs font-bold hidden sm:inline ${currentStep >= step.s ? "text-emerald-800" : "text-slate-400"
                        }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 4 && <ChevronRight className="h-3 w-3 text-slate-350 hidden sm:inline" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Chat Stream Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 md:gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>

                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${m.role === "user" ? "bg-emerald-100 text-emerald-800" : "bg-emerald-600 text-white"
                  }`}>
                  {m.role === "user" ? "U" : "S"}
                </div>

                {/* Bubble Container */}
                <div className="flex flex-col space-y-3 max-w-[85%] sm:max-w-[75%]">

                  {/* Text Content Parts or Content Fallback */}
                  {m.parts && m.parts.length > 0 ? (
                    m.parts.map((part, index) => {
                      const p = part as any;
                      if (p.type === "text") {
                        return (
                          <div key={index} className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border shadow-xs ${m.role === "user"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-800 border-slate-100"
                            }`}>
                            {interactionMode === "chat" ? renderTextWithLinks(p.text) : renderMarkdown(p.text)}
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    (m as any).content && (
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border shadow-xs ${m.role === "user"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-800 border-slate-100"
                        }`}>
                        {interactionMode === "chat" ? renderTextWithLinks((m as any).content) : renderMarkdown((m as any).content)}
                      </div>
                    )
                  )}

                  {/* === UI MODE ONLY: Render interactive trip card === */}
                  {interactionMode === "ui" && m.parts?.map((part) => {
                    const p = part as any;
                    if (p.type === "tool-search_trips") {
                      if (p.state === "output-available") {
                        const result = p.output;
                        const trips = getProcessedTrips();

                        return (
                          <div key={p.toolCallId} className="w-full bg-white border border-slate-150 rounded-2xl p-4 shadow-md mt-2 space-y-4 max-w-[600px]">

                            {/* Card Header & Filters */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">
                                  Available Departures ({trips.length})
                                </h4>
                                <p className="text-xs text-slate-400">
                                  {result.origin} to {result.destination}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSortCriteria("price")}
                                  className={`h-7 px-2.5 text-[10px] rounded-lg font-bold gap-1 ${sortCriteria === "price" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "text-slate-500"}`}
                                >
                                  <TrendingDown className="h-3 w-3" />
                                  Price
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSortCriteria("time")}
                                  className={`h-7 px-2.5 text-[10px] rounded-lg font-bold gap-1 ${sortCriteria === "time" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "text-slate-500"}`}
                                >
                                  <Clock className="h-3 w-3" />
                                  Time
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAcFilter(!acFilter)}
                                  className={`h-7 px-2.5 text-[10px] rounded-lg font-bold gap-1 ${acFilter ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "text-slate-500"}`}
                                >
                                  <Snowflake className="h-3 w-3" />
                                  AC
                                </Button>
                              </div>
                            </div>

                            {/* Trip Cards List */}
                            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                              {trips.map((t) => (
                                <div
                                  key={t.id}
                                  onClick={() => handleSelectTrip(t)}
                                  className={`border p-3.5 rounded-xl cursor-pointer hover:border-emerald-500 transition-all shadow-xs relative overflow-hidden group ${activeTrip?.id === t.id ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20" : "border-slate-100 bg-white"
                                    }`}
                                >
                                  {/* Fast / Cheap tag */}
                                  <div className="absolute right-0 top-0">
                                    {t.fare <= 550 && (
                                      <span className="bg-emerald-100 text-emerald-800 font-semibold text-[8px] px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                        Cheapest
                                      </span>
                                    )}
                                    {t.bus_info.ac && (
                                      <span className="bg-blue-100 text-blue-800 font-semibold text-[8px] px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                        AC Bus
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1">
                                        <span className="font-extrabold text-slate-800 text-sm">{t.departure_time}</span>
                                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="font-semibold text-slate-500 text-xs">{t.arrival_time}</span>
                                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium ml-2">{t.duration}</span>
                                      </div>
                                      <p className="text-xs font-bold text-slate-700">{t.bus_info.name}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-black text-emerald-700 text-lg">৳{t.fare}</span>
                                      <p className="text-[10px] text-slate-400">{t.seats_left} seats remaining</p>
                                    </div>
                                  </div>

                                  {/* Trip Selector Overlay button */}
                                  <div className="mt-2.5 hidden group-hover:flex items-center justify-center py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold gap-1 transition-all animate-fade-in shadow-sm">
                                    <Armchair className="h-4 w-4" />
                                    Select this trip
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Quick AI Suggestions Chips */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <span onClick={() => { setSortCriteria("price"); setAcFilter(false); }} className="px-3 py-1.5 bg-slate-50 border border-slate-150 hover:border-emerald-300 text-slate-600 rounded-full text-[10px] font-semibold cursor-pointer transition-colors shadow-2xs flex items-center gap-1">
                                ৳ Give cheap one ↗
                              </span>
                              <span onClick={() => { setAcFilter(true); }} className="px-3 py-1.5 bg-slate-50 border border-slate-150 hover:border-emerald-300 text-slate-600 rounded-full text-[10px] font-semibold cursor-pointer transition-colors shadow-2xs flex items-center gap-1">
                                ❄️ AC bus only ↗
                              </span>
                              <span onClick={() => { setSortCriteria("time"); setAcFilter(false); }} className="px-3 py-1.5 bg-slate-50 border border-slate-150 hover:border-emerald-300 text-slate-600 rounded-full text-[10px] font-semibold cursor-pointer transition-colors shadow-2xs flex items-center gap-1">
                                ⚡ Earliest trip ↗
                              </span>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })}

                </div>
              </div>
            ))}

            {/* AI thinking state */}
            {aiLoading && (
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2 border border-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce delay-100" />
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce delay-200" />
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce delay-300" />
                </div>
              </div>
            )}

            {/* Chat mode: payment polling indicator */}
            {interactionMode === "chat" && chatPaymentPolling && (
              <div className="flex gap-4 animate-fade-in">
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  S
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 space-y-2 max-w-[400px]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">Waiting for payment...</span>
                  </div>
                  <p className="text-xs text-amber-600">
                    Please complete the bKash payment in the tab that was opened. I'll confirm your ticket once it's done.
                  </p>
                </div>
              </div>
            )}

            {/* Chat mode: confirmed booking inline card */}
            {interactionMode === "chat" && confirmedBooking && (
              <div className="flex gap-4 animate-fade-in">
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  S
                </div>
                <div className="w-full max-w-[420px] bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-800 text-sm">Ticket Confirmed!</h4>
                      <p className="text-[10px] text-emerald-600">Your reservation is complete 🎉</p>
                    </div>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3.5 text-xs space-y-2 shadow-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">PNR Code:</span>
                      <span className="font-mono font-bold text-emerald-700 tracking-wider">
                        {confirmedBooking.bookingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Route:</span>
                      <span className="font-semibold text-slate-800">
                        {confirmedBooking.trip?.heading || activeTrip?.heading}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bus:</span>
                      <span className="font-semibold text-slate-800">
                        {confirmedBooking.bus?.name || activeTrip?.bus_info.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seats:</span>
                      <span className="font-semibold text-slate-800">
                        {confirmedBooking.seats?.map((s: any) => s.seatName).join(", ") || confirmedBooking.seat?.seatName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Departure:</span>
                      <span className="font-semibold text-slate-800">
                        {confirmedBooking.trip?.departureDateTime?.split("T")[0]} at{" "}
                        {confirmedBooking.trip?.departureDateTime?.split("T")[1]?.substring(0, 5)}
                      </span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-800">
                      <span>Total Paid:</span>
                      <span className="text-emerald-700">৳{confirmedBooking.totalAmount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleDownloadTicket}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-md gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNewSearch}
                      className="border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50/50 font-bold text-xs h-9"
                    >
                      New Search
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* === UI MODE ONLY: Step 3 Seat Selection Card === */}
            {interactionMode === "ui" && currentStep === 3 && activeTrip && (
              <div className="flex gap-4 animate-fade-in">
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  S
                </div>
                <div className="w-full max-w-[480px] bg-white border border-slate-150 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Select Your Seat</h4>
                      <p className="text-xs text-slate-400">{activeTrip.bus_info.name} · ৳{activeTrip.fare}/seat</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)} className="text-slate-400 hover:text-slate-600 text-[10px]">
                      <ArrowLeft className="h-3 w-3 mr-1" /> Change bus
                    </Button>
                  </div>

                  {/* Seat Grid Layout */}
                  {seatLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                      Loading live seat layout...
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                        <span className="flex items-center gap-1">
                          <Smartphone className="h-3.5 w-3.5" /> Driver Cabin (Front)
                        </span>
                        <span>Rear →</span>
                      </div>

                      <div className="grid grid-cols-5 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        {seatsList.map((s) => {
                          const isPicked = selectedSeats.some(sel => sel.id === s.id);
                          const isTaken = s.status === "booked" || (s.status === "locked" && !isPicked);

                          return (
                            <button
                              key={s.id}
                              disabled={isTaken}
                              onClick={() => handleSeatClick(s)}
                              className={`h-9 w-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${isTaken
                                ? "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed"
                                : isPicked
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10 scale-105"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                                }`}
                              title={`Seat ${s.seatName}`}
                            >
                              {s.seatName}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1">
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-emerald-600 border border-emerald-600 inline-block" /> Picked
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-slate-200 border border-slate-200 inline-block" /> Taken
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded bg-white border border-slate-200 inline-block" /> Available
                        </span>
                      </div>

                      {/* Summary & Checkout */}
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400">Total Fare ({selectedSeats.length} Seats)</p>
                          <span className="font-extrabold text-emerald-800 text-base">৳{calculateTotal()}</span>
                        </div>
                        <Button
                          onClick={handleProceedToPayment}
                          disabled={selectedSeats.length === 0}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-md"
                        >
                          Confirm Seats
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* === UI MODE ONLY: Step 4 Payment Form Card === */}
            {interactionMode === "ui" && currentStep === 4 && activeTrip && selectedSeats.length > 0 && (
              <div className="flex gap-4 animate-fade-in">
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  S
                </div>
                <div className="w-full max-w-[480px] bg-white border border-slate-150 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Passenger Details</h4>
                      <p className="text-xs text-slate-400">Complete booking for Seat: {selectedSeats.map(s => s.seatName).join(", ")}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)} className="text-slate-400 hover:text-slate-600 text-[10px]">
                      <ArrowLeft className="h-3 w-3 mr-1" /> Edit Seats
                    </Button>
                  </div>

                  {/* Payment Loader state */}
                  {isPaying ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                      {paymentPolling ? (
                        <>
                          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-800 text-sm">Waiting for Payment...</h5>
                            <p className="text-xs text-slate-400 max-w-xs">
                              We opened the bKash payment portal in a new tab. Please complete the transaction there.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="text-[10px] gap-1 font-semibold" onClick={() => window.open(bkashUrl || "", "_blank")}>
                              <RefreshCw className="h-3 w-3" /> Re-open payment tab
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                          <p className="text-xs text-slate-400">Initializing secure payment gateway...</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Passenger Name</label>
                        <Input
                          value={passengerName}
                          onChange={(e) => setPassengerName(e.target.value)}
                          placeholder="Passenger Name"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number (bKash Wallet)</label>
                        <Input
                          value={passengerPhone}
                          onChange={(e) => setPassengerPhone(e.target.value)}
                          placeholder="e.g. 017XXXXXXXX"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                        <Input
                          value={passengerEmail}
                          onChange={(e) => setPassengerEmail(e.target.value)}
                          placeholder="e.g. passenger@email.com"
                          type="email"
                          className="h-9 text-xs"
                        />
                      </div>

                      {/* Payment Method Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Select Payment Wallet</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["bKash", "Nagad", "Card"].map((m) => (
                            <button
                              key={m}
                              onClick={() => setPaymentMethod(m as any)}
                              className={`py-2 rounded-xl text-xs font-bold border text-center transition-all ${paymentMethod === m
                                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-350"
                                }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fare Summary */}
                      <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                          <span>Route:</span>
                          <span className="font-semibold text-slate-800">{activeTrip.heading}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Bus Operator:</span>
                          <span className="font-semibold text-slate-800">{activeTrip.bus_info.name}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Seats:</span>
                          <span className="font-semibold text-slate-800">{selectedSeats.map(s => s.seatName).join(", ")}</span>
                        </div>
                        <div className="border-t border-slate-150 pt-2 flex justify-between font-bold text-sm text-slate-800">
                          <span>Total Amount:</span>
                          <span className="text-emerald-700">৳{calculateTotal()}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleConfirmPayment}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 shadow-md gap-1"
                      >
                        <Lock className="h-3.5 w-3.5" /> Pay & Confirm Ticket
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === UI MODE ONLY: Step 5 Ticket Confirmed Card === */}
            {interactionMode === "ui" && currentStep === 5 && confirmedBooking && (
              <div className="flex gap-4 animate-fade-in">
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  S
                </div>
                <div className="w-full max-w-[480px] bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-lg space-y-5 text-center">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                      <Check className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-emerald-800 text-base">Ticket Confirmed!</h4>
                    <p className="text-xs text-emerald-600">Your reservation is complete. Have a pleasant journey!</p>
                  </div>

                  {/* Ticket Summary strip */}
                  <div className="bg-white border border-emerald-100 rounded-2xl p-4 text-left text-xs space-y-2.5 shadow-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">PNR Code:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm tracking-wider">
                        {confirmedBooking.bookingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Route:</span>
                      <span className="font-semibold text-slate-800">
                        {confirmedBooking.trip?.heading || activeTrip?.heading}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bus Operator:</span>
                      <span className="font-semibold text-slate-800">
                        {confirmedBooking.bus?.name || activeTrip?.bus_info.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Selected Seats:</span>
                      <span className="font-semibold text-slate-800">
                        {confirmedBooking.seats?.map((s: any) => s.seatName).join(", ") || confirmedBooking.seat?.seatName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Departure:</span>
                      <span className="font-semibold text-slate-800">
                        {confirmedBooking.trip?.departureDateTime?.split("T")[0] || activeTrip?.departure_date} at{" "}
                        {confirmedBooking.trip?.departureDateTime?.split("T")[1]?.substring(0, 5) || activeTrip?.departure_time}
                      </span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-800">
                      <span>Total Paid:</span>
                      <span className="text-emerald-700">৳{confirmedBooking.totalAmount}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Button
                      onClick={handleDownloadTicket}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-md gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNewSearch}
                      className="border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50/50 font-bold text-xs h-10"
                    >
                      New Search
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Chat Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                id="chat-input"
                value={input}
                onChange={handleInputChange}
                disabled={interactionMode === "ui" && currentStep > 2}
                placeholder={
                  interactionMode === "chat"
                    ? "Type your message — 'book ticket bogra to dhaka tomorrow'..."
                    : currentStep > 2
                      ? "Complete the selection forms above..."
                      : "Ask anything — 'give cheap one', 'AC bus only', '6am departure'..."
                }
                className="flex-1 h-11 px-4 text-xs rounded-full bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 focus-visible:ring-2 placeholder:text-slate-400"
              />
              <Button
                id="send-btn"
                type="submit"
                disabled={(interactionMode === "ui" && currentStep > 2) || !input.trim()}
                className="h-11 w-11 rounded-full bg-[#0F6E56] hover:bg-[#085041] text-white shrink-0 flex items-center justify-center shadow-md shadow-emerald-800/10 hover:shadow-lg"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </div>

      </div>
    </main>
  );
}
