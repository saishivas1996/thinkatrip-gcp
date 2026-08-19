"use client";

import { useState, useEffect } from "react";

interface Deal {
  flightNumber: string;
  origin: string;
  destination: string;
  travelDate: string;
  dealPrice: number;
  originalPrice: number;
  priceDrop: number;
  airline: string;
  bookingLink: string;
}

export default function HomePage() {
  // --- 1. Search State ---
  const [searchOrigin, setSearchOrigin] = useState("BLR");
  const [searchDestination, setSearchDestination] = useState("DXB");
  const [departDate, setDepartDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [preferredPlatform, setPreferredPlatform] = useState("ixigo"); // 'ixigo' or 'aviasales'

  // --- 2. Deals & UI State ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState("BLR");
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const INDIAN_ORIGINS = [
    { code: "BLR", name: "Bengaluru" },
    { code: "DEL", name: "Delhi" },
    { code: "BOM", name: "Mumbai" },
    { code: "HYD", name: "Hyderabad" },
    { code: "MAA", name: "Chennai" },
    { code: "CCU", name: "Kolkata" },
    { code: "COK", name: "Kochi" },
    { code: "VTZ", name: "Visakhapatnam" },
  ];

  // Active Promo & Bank Offers List
  const PROMO_OFFERS = [
    {
      code: "IXIGOFLIGHT",
      bank: "Instant Discount",
      desc: "Get up to ₹1,200 off on domestic & international flights.",
      validity: "Valid till Apr 30",
    },
    {
      code: "HDFCCC",
      bank: "HDFC Bank Credit Cards",
      desc: "Flat 10% off up to ₹1,500 on weekend getaways.",
      validity: "Every Saturday & Sunday",
    },
    {
      code: "ICICIFLEET",
      bank: "ICICI Netbanking / Cards",
      desc: "Save up to ₹1,000 on bookings above ₹5,000.",
      validity: "Limited Period Offer",
    },
    {
      code: "TRIPFIRST",
      bank: "New User Special",
      desc: "Zero convenience fees + extra ₹500 instant off.",
      validity: "First Booking Only",
    },
  ];

  useEffect(() => {
    async function fetchDeals() {
      setLoadingDeals(true);
      try {
        const res = await fetch(`/api/deals?origin=${selectedOrigin}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setDeals(data);
        } else {
          setDeals([]);
        }
      } catch (err) {
        console.error("Failed to load deals", err);
        setDeals([]);
      } finally {
        setLoadingDeals(false);
      }
    }
    fetchDeals();
  }, [selectedOrigin]);

  // Handle Flight Search redirection (Ixigo vs Aviasales)
  const handleFlightSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || "YOUR_MARKER";
    
    let searchUrl = "";
    if (preferredPlatform === "ixigo") {
      // Ixigo partner deep link format
      searchUrl = `https://www.ixigo.com/search/flights?from=${searchOrigin.toUpperCase()}&to=${searchDestination.toUpperCase()}&date=${departDate.replace(/-/g, '')}&adults=${passengers}&class=e`;
    } else {
      // Aviasales deep link format
      searchUrl = `https://search.aviasales.com/flights/?origin_iata=${searchOrigin.toUpperCase()}&destination_iata=${searchDestination.toUpperCase()}&depart_date=${departDate}&adults=${passengers}&marker=${marker}&locale=en`;
    }

    window.open(searchUrl, "_blank");
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-orange-500">Think<span className="text-white">A</span>Trip</span>
          <span className="text-xs bg-orange-500/10 text-orange-400 font-semibold px-2 py-0.5 rounded-full border border-orange-500/20">Live Deals Hub</span>
        </div>
        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Powered by <span className="text-slate-200 font-bold">Ixigo & Global Aggregators</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Hero Search Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Where do you want to fly?
              </h1>
              <p className="text-slate-400 text-sm mt-1">Compare live airfares across top booking platforms instantly.</p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreferredPlatform("ixigo")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                  preferredPlatform === "ixigo" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                }`}
              >
                Book via Ixigo
              </button>
              <button
                type="button"
                onClick={() => setPreferredPlatform("aviasales")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                  preferredPlatform === "aviasales" ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                }`}
              >
                Global Aggregator
              </button>
            </div>
          </div>

          <form onSubmit={handleFlightSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">FROM (Airport)</label>
              <input
                type="text"
                value={searchOrigin}
                maxLength={3}
                onChange={(e) => setSearchOrigin(e.target.value.toUpperCase())}
                placeholder="BLR"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center font-mono font-bold focus:outline-none focus:border-orange-500 uppercase text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">TO (Airport)</label>
              <input
                type="text"
                value={searchDestination}
                maxLength={3}
                onChange={(e) => setSearchDestination(e.target.value.toUpperCase())}
                placeholder="DXB"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center font-mono font-bold focus:outline-none focus:border-orange-500 uppercase text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">DEPARTURE DATE</label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">PASSENGERS</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 text-white"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Adult" : "Adults"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Search Flights 🚀
              </button>
            </div>
          </form>
        </div>

        {/* Main Content Grid: Deals on Left (7 cols), Promo Sidebar on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Curated Deals Table */}
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Top Live Flight Drops</h2>
                <p className="text-slate-400 text-xs">Updated daily from major Indian hubs</p>
              </div>

              {/* Origin Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {INDIAN_ORIGINS.map(({ code }) => (
                  <button
                    key={code}
                    onClick={() => setSelectedOrigin(code)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                      selectedOrigin === code
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-900/90 font-semibold tracking-wider">
                      <th className="p-4">Route</th>
                      <th className="p-4">Travel Date</th>
                      <th className="p-4">Airline</th>
                      <th className="p-4">Price & Drop</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loadingDeals ? (
                      <tr>
                        <td colSpan={5} className="text-center p-12 text-slate-400">
                          <span className="animate-pulse">Scanning live flight databases...</span>
                        </td>
                      </tr>
                    ) : deals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-12 text-slate-500">
                          No active deals found for {selectedOrigin} right now.
                        </td>
                      </tr>
                    ) : (
                      deals.map((deal, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-bold text-white">
                            {deal.origin} <span className="text-orange-500">→</span> {deal.destination}
                          </td>
                          <td className="p-4 text-slate-300 text-xs font-medium">
                            {deal.travelDate}
                          </td>
                          <td className="p-4 text-slate-400 text-xs">
                            {deal.airline}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-500 line-through">
                                ₹{deal.originalPrice.toLocaleString("en-IN")}
                              </span>
                              <span className="font-extrabold text-emerald-400 text-base">
                                ₹{deal.dealPrice.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] font-bold text-orange-400">
                                Save ₹{deal.priceDrop.toLocaleString("en-IN")} ↓
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <a
                              href={deal.bookingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition transform active:scale-95"
                            >
                              Book Now
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Coupon Codes & Promo Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>🎟️</span> Live Promo & Bank Offers
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Verified
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-5">
                  Copy these promo codes and apply them at checkout on Ixigo or partner sites for extra instant savings.
                </p>

                <div className="space-y-3.5">
                  {PROMO_OFFERS.map((offer, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-xs font-semibold text-orange-400">{offer.bank}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{offer.validity}</span>
                      </div>
                      
                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        {offer.desc}
                      </p>

                      <div className="flex items-center justify-between bg-slate-900 border border-dashed border-slate-700 rounded-lg px-3 py-1.5">
                        <span className="font-mono font-bold text-xs text-emerald-400 tracking-wider">
                          {offer.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(offer.code)}
                          className="text-[11px] font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer"
                        >
                          {copiedCode === offer.code ? "Copied! ✅" : "Copy Code 📋"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Callout */}
                <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-orange-300 font-medium">
                    Want automated alerts for massive price drops? Follow our travel page on Instagram!
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
