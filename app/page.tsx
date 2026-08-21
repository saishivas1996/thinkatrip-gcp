"use client";

import { useState, useEffect } from "react";

interface Deal {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  travelDate: string;
  dealPrice: number;
  originalPrice: number;
  priceDrop: number;
  airline: string;
}

interface TopDeal {
  origin: string;
  destination: string;
  travelDate: string;
  dealPrice: number;
  airline: string;
  image: string;
}

interface Coupon {
  airline: string;
  code: string;
  discount: string;
  desc: string;
  color: string;
}

const AIRLINE_MAP: Record<string, string> = {
  "6E": "IndiGo", "AI": "Air India", "IX": "Air India Express", "UK": "Vistara",
  "SG": "SpiceJet", "QP": "Akasa Air", "I5": "AirAsia", "EK": "Emirates",
};

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [searchOrigin, setSearchOrigin] = useState("VTZ");
  const [searchDestination, setSearchDestination] = useState("BLR");
  const [departDate, setDepartDate] = useState("2026-08-20");
  const [returnDate, setReturnDate] = useState("2026-08-21");
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("e"); 
  
  const [deals, setDeals] = useState<Deal[]>([]);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [liveCoupons, setLiveCoupons] = useState<Coupon[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState("DEL");
  
  const INDIAN_ORIGINS = ["VTZ", "BLR", "DEL", "BOM", "HYD", "MAA"];

  // --- EARNKARO AFFILIATE REDIRECT FORMAT ---
  // Replace YOUR_TRACKING_PREFIX with the URL EarnKaro gives you.
  // Example: "https://earnkaro.in/redirect?id=123456&url="
  const EARNKARO_PREFIX = ""; 

  useEffect(() => {
    const storedUser = localStorage.getItem("thinkatrip_user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    async function fetchDynamicData() {
      try {
        const [dealsRes, topDealsRes, couponsRes] = await Promise.all([
          fetch(`/api/deals?origin=${selectedOrigin}`),
          fetch(`/api/top-deals`),
          fetch(`/api/coupons`)
        ]);

        const dealsData = await dealsRes.json();
        if (Array.isArray(dealsData)) {
          setDeals(dealsData.map((d, i) => ({ ...d, id: `${d.origin}-${d.travelDate}-${i}` })));
        }

        const topData = await topDealsRes.json();
        if (Array.isArray(topData)) setTopDeals(topData);

        const couponsData = await couponsRes.json();
        if (Array.isArray(couponsData)) setLiveCoupons(couponsData);

      } catch (err) {
        console.error("Failed to load dynamic data", err);
      }
    }
    fetchDynamicData();
  }, [selectedOrigin]);

  // Secure Deep Link Generator for Ixigo + EarnKaro
  const generateAffiliateLink = (origin: string, dest: string, dateStr: string, isRoundTrip = false, retDate = "") => {
    const formattedDate = dateStr ? dateStr.replace(/-/g, '') : '';
    const formattedReturn = retDate && isRoundTrip ? retDate.replace(/-/g, '') : '';
    
    let ixigoUrl = `https://www.ixigo.com/search/flights?from=${origin.toUpperCase()}&to=${dest.toUpperCase()}&date=${formattedDate}&adults=${passengers}&class=${travelClass}`;
    if (isRoundTrip) ixigoUrl += `&returnDate=${formattedReturn}`;
    
    if (EARNKARO_PREFIX) return `${EARNKARO_PREFIX}${encodeURIComponent(ixigoUrl)}`;
    return ixigoUrl;
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(generateAffiliateLink(searchOrigin, searchDestination, departDate, tripType === "roundtrip", returnDate), "_blank");
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-sky-500 selection:text-white pb-20">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#0a1120]/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/think-logo.JPG" alt="ThinkATrip Logo" className="h-12 w-auto object-contain rounded-full border border-slate-700/50" />
          <div className="flex flex-col justify-center">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-500 leading-none">thinkatrip</span>
            <span className="text-[10px] sm:text-xs italic text-slate-400 leading-tight">road to heaven</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* 1. Dynamic Booking Engine */}
        <div className="bg-[#0f172a] border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl mb-12">
          <form onSubmit={handleManualSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 grid grid-cols-2 bg-[#0a1120] border border-slate-700/60 rounded-2xl p-2">
              <div className="p-2 border-r border-slate-700/60">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</label>
                <input type="text" value={searchOrigin} onChange={(e) => setSearchOrigin(e.target.value.toUpperCase())} maxLength={3} className="w-full bg-transparent font-mono text-xl font-extrabold text-white focus:outline-none uppercase" required />
              </div>
              <div className="p-2 pl-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</label>
                <input type="text" value={searchDestination} onChange={(e) => setSearchDestination(e.target.value.toUpperCase())} maxLength={3} className="w-full bg-transparent font-mono text-xl font-extrabold text-white focus:outline-none uppercase" required />
              </div>
            </div>
            <div className="md:col-span-3 bg-[#0a1120] border border-slate-700/60 rounded-2xl p-3.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Departure</label>
              <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} className="w-full bg-transparent text-sm font-bold text-white focus:outline-none" required />
            </div>
            <div className="md:col-span-2 bg-[#0a1120] border border-slate-700/60 rounded-2xl p-3.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Travellers</label>
              <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="w-full bg-transparent text-sm font-bold text-white focus:outline-none">
                {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-slate-900">{n}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 font-extrabold py-4 rounded-2xl text-slate-900 text-sm transition">Search Flights</button>
            </div>
          </form>
        </div>

        {/* 2. HIGHLIGHTER: Top 3 Daily Cheapest Deals */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-black text-white tracking-tight">Today's Absolute Cheapest Flights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topDeals.map((deal, idx) => (
              <div key={idx} className="bg-[#0f172a] border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-1 transition duration-300 relative">
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white z-10 border border-white/10">
                  #{idx + 1} Cheapest
                </div>
                <img src={deal.image} alt="Destination" className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black text-white">{deal.origin} <span className="text-sky-500">→</span> {deal.destination}</h3>
                    <span className="text-xl font-black text-emerald-400">₹{deal.dealPrice.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-6 font-medium">Travel Date: {deal.travelDate} • {AIRLINE_MAP[deal.airline] || deal.airline}</div>
                  <button 
                    onClick={() => window.open(generateAffiliateLink(deal.origin, deal.destination, deal.travelDate), "_blank")}
                    className="w-full bg-white hover:bg-sky-50 text-slate-900 font-bold py-3 rounded-xl transition"
                  >
                    Lock in Price
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Full Database Matrix & Scraped Coupons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Route Table */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white">Full Flight Matrix</h2>
              <div className="flex gap-2">
                {INDIAN_ORIGINS.map((code) => (
                  <button key={code} onClick={() => setSelectedOrigin(code)} className={`px-3 py-1 text-xs rounded-lg font-bold ${selectedOrigin === code ? "bg-sky-500 text-white" : "bg-[#0a1120] text-slate-400"}`}>{code}</button>
                ))}
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 text-[10px] uppercase bg-[#0a1120] font-bold">
                    <th className="p-4">Route & Date</th>
                    <th className="p-4">Airline</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 text-right">Book</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {deals.map((deal, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="p-4 font-bold text-white">
                        <div>{deal.origin} <span className="text-sky-500">→</span> {deal.destination}</div>
                        <div className="text-[10px] text-slate-400">{deal.travelDate}</div>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-200">
                        {AIRLINE_MAP[deal.airline] || deal.airline}
                      </td>
                      <td className="p-4 font-extrabold text-sky-400">₹{deal.dealPrice.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => window.open(generateAffiliateLink(deal.origin, deal.destination, deal.travelDate), "_blank")} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs">Book</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scraped Coupons */}
          <div className="lg:col-span-4">
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-5 sticky top-24">
              <h3 className="font-extrabold text-sm text-white border-b border-slate-700/60 pb-3 mb-4">🎟️ Live Scraped Offers</h3>
              <div className="space-y-3">
                {liveCoupons.map((offer, idx) => (
                  <div key={idx} className="bg-[#0a1120] border border-slate-700/50 rounded-xl p-3.5">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${offer.color}`}></span>{offer.airline}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{offer.discount}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2.5">{offer.desc}</p>
                    <div className="bg-[#0f172a] border border-dashed border-slate-700 rounded-lg px-2.5 py-1.5 text-center">
                      <span className="font-mono font-bold text-xs text-sky-400">{offer.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
