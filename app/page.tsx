
import React from "react";
import Image from "next/image";
import { auth, signIn, signOut } from "../auth";
import { Plane, Calendar, ArrowRight, User, MessageCircle, ExternalLink, ShieldCheck, Tag } from "lucide-react";
import ChatBot from "../components/ChatBot";
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  > 
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const CITY_IMAGES: Record<string, string> = {
  DXB: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", // Dubai
  BKK: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80", // Bangkok
  SIN: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80", // Singapore
  DPS: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", // Bali
  LHR: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80", // London
  CDG: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", // Paris
  JFK: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80", // New York
  MLE: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80", // Maldives
  NRT: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80", // Tokyo
  KUL: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80", // Kuala Lumpur
  DEFAULT: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
};
async function getDeals() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/deals', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.deals && data.deals.length > 0) return data.deals;
    }
  } catch (error) {
    console.error("FastAPI fetch error:", error);
  }
  // Resilient fallback mock deals if DB is syncing or empty
  return [
    { flight_number: "EK-501", origin: "BOM", destination: "DXB", price: "₹18,450", date: "Oct 2026", airline: "Emirates" },
    { flight_number: "TG-318", origin: "DEL", destination: "BKK", price: "₹14,200", date: "Nov 2026", airline: "Thai Airways" },
    { flight_number: "SQ-503", origin: "BLR", destination: "SIN", price: "₹19,800", date: "Sep 2026", airline: "Singapore Airlines" },
    { flight_number: "MH-193", origin: "HYD", destination: "DPS", price: "₹24,500", date: "Oct 2026", airline: "Malaysia Airlines" },
    { flight_number: "BA-118", origin: "BOM", destination: "LHR", price: "₹42,300", date: "Dec 2026", airline: "British Airways" },
    { flight_number: "AF-225", origin: "DEL", destination: "CDG", price: "₹44,900", date: "Nov 2026", airline: "Air France" },
  ];
}
export default async function Home() {
  const session = await auth();
  const deals = await getDeals();
  const INSTAGRAM_URL = "https://instagram.com/thinkatrip"; // Update with your page URL
  const WHATSAPP_URL = "https://wa.me/919999999999?text=Hello%20thinkatrip!%20I%20want%20to%20inquire%20about%20flight%20deals.";
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Interactive Chatbot */}
      <ChatBot />
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm">
              <img
                src="/llogo.png"
                alt="thinkatrip logo"
                className="object-cover h-full w-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                thinkatrip<span className="text-emerald-500">.</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 -mt-1">
                Road to Heaven
              </p>
            </div>
          </div>
          {/* Social Links & User Status */}
          <div className="flex items-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
              title="Follow on Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            {session ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                    {session.user?.email}
                  </span>
                </div>
                <form action={async () => { "use server"; await signOut(); }}>
                  <button className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <form action={async () => { "use server"; await signIn(); }}>
                <button className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md ml-2">
                  VIP Login
                </button>
              </form>
            )}
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="relative bg-slate-900 overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 opacity-95"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            <ShieldCheck className="h-4 w-4" /> Live Global Outbound Database
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 max-w-4xl leading-tight">
            Stop overpaying. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
              Fly the world for pennies.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal mb-8 leading-relaxed">
            Exclusive airfare drops, error fares, and non-stop flight discounts curated from top Indian international hubs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#deals"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
            >
              Explore Live Deals <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-3.5 rounded-full font-bold text-sm transition-all flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp Flight Desk
            </a>
          </div>
        </div>
      </div>
      {/* Main Deal Section */}
      <div id="deals" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Today's Hottest Deals</h3>
            <p className="text-slate-500 text-sm mt-1">Verified outbound routes departing from India</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Auto-refreshed daily
          </div>
        </div>
        {/* Deals Grid with Destination Cover Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.map((deal: any, index: number) => {
            const currentPrice = parseInt(String(deal.price).replace(/[^0-9]/g, '')) || 25000;
            const fakeOriginal = Math.floor(currentPrice * 1.45);
            const discountPct = Math.round(((fakeOriginal - currentPrice) / fakeOriginal) * 100);
            const coverImage = CITY_IMAGES[deal.destination] || CITY_IMAGES.DEFAULT;
            return (
              <div
                key={index}
                className="group flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Destination Photo Header */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={coverImage}
                    alt={`${deal.destination} flight`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                    {discountPct}% OFF
                  </div>
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {deal.airline || "Standard Airline"}
                  </div>
                  <div className="absolute bottom-3 left-6 text-white">
                    <span className="text-3xl font-black tracking-tight">{deal.origin}</span>
                    <span className="mx-2 text-emerald-400 font-bold">➔</span>
                    <span className="text-3xl font-black tracking-tight">{deal.destination}</span>
                  </div>
                </div>
                {/* Deal Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> {deal.date || "Multiple Dates"}
                      </span>
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {deal.flight_number}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 line-through font-medium">
                        ₹{fakeOriginal.toLocaleString("en-IN")}
                      </p>
                      <p className="text-2xl font-black text-slate-900">{deal.price}</p>
                    </div>
                    <a
                      href={`https://wa.me/919999999999?text=Hi%20thinkatrip!%20I%20am%20interested%20in%20booking%20the%20${deal.origin}%20to%20${deal.destination}%20deal%20(${deal.flight_number})%20for%20${deal.price}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      Book Deal <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-emerald-500">
              <img src="/llogo.png" alt="thinkatrip" className="object-cover h-full w-full" />
            </div>
            <div>
              <p className="text-white font-bold text-base">thinkatrip</p>
              <p className="text-xs text-emerald-400 font-medium">Road to Heaven</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 text-sm">
              <InstagramIcon className="h-4 w-4 text-pink-500" /> Instagram
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 text-sm">
              <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
            </a>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 thinkatrip. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
