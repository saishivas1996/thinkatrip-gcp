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
  "6E": "IndiGo", 
  "AI": "Air India", 
  "IX": "Air India Express", 
  "UK": "Vistara",
  "SG": "SpiceJet", 
  "QP": "Akasa Air", 
  
  // All AirAsia subsidiaries
  "I5": "AirAsia", 
  "AK": "AirAsia", 
  "D7": "AirAsia X", 
  "FD": "Thai AirAsia",
  
  // International 
  "EK": "Fly Emirates", 
  "EY": "Etihad Airways",
  "QR": "Qatar Airways",
  "UL": "SriLankan Airlines",
  "SQ": "Singapore Airlines",
  "TR": "Scoot",
  "MH": "Malaysia Airlines",
  "TG": "Thai Airways",
  "FZ": "flydubai",
  "G9": "Air Arabia",
  "WY": "Oman Air"
};

export default function HomePage() {
  // Authentication & State
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  
  // Search State
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [searchOrigin, setSearchOrigin] = useState("VTZ");
  const [searchDestination, setSearchDestination] = useState("BLR");
  const [departDate, setDepartDate] = useState("2026-08-20");
  const [returnDate, setReturnDate] = useState("2026-08-21");
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("e"); 
  
  // Data State
  const [deals, setDeals] = useState<Deal[]>([]);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [liveCoupons, setLiveCoupons] = useState<Coupon[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState("DEL");
  
  // Saved Deals State (Now stores the full deal object)
  const [savedDeals, setSavedDeals] = useState<Deal[]>([]); 
  const [viewSavedOnly, setViewSavedOnly] = useState(false);

  const INDIAN_ORIGINS = ["VTZ", "BLR", "DEL", "BOM", "HYD", "MAA"];
  const EARNKARO_PREFIX = ""; 

  // Initialize Session & Load Saved Deals
  useEffect(() => {
    const storedUser = localStorage.getItem("thinkatrip_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      // Load this specific user's saved deals from storage
      const userSaves = localStorage.getItem(`saved_deals_${user.username}`);
      if (userSaves) {
        setSavedDeals(JSON.parse(userSaves));
      }
    }
  }, []);

  // Fetch Live Data
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
          setDeals(dealsData.map((d, i) => ({ ...d, id: `${d.flightNumber}-${d.travelDate}-${i}` })));
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

  // Handle Authentication
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.username || !authForm.password) return alert("Please enter credentials");
    
    const userData = { username: authForm.username };
    localStorage.setItem("thinkatrip_user", JSON.stringify(userData));
    setCurrentUser(userData);
    
    // Load their saved deals immediately upon login
    const userSaves = localStorage.getItem(`saved_deals_${authForm.username}`);
    setSavedDeals(userSaves ? JSON.parse(userSaves) : []);
    
    setShowAuthModal(false);
    setAuthForm({ username: "", password: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem("thinkatrip_user");
    setCurrentUser(null);
    setSavedDeals([]);
    setViewSavedOnly(false);
  };

  // Toggle Save Deal (Adds or removes the FULL deal object)
  const toggleSaveDeal = (deal: Deal) => {
    if (!currentUser) return setShowAuthModal(true);
    
    let updatedSaves = [...savedDeals];
    const exists = updatedSaves.find(d => d.id === deal.id);
    
    if (exists) {
      updatedSaves = updatedSaves.filter(d => d.id !== deal.id);
    } else {
      updatedSaves.push(deal);
    }
    
    setSavedDeals(updatedSaves);
    localStorage.setItem(`saved_deals_${currentUser.username}`, JSON.stringify(updatedSaves));
  };

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

  // Determine which deals to show based on the active tab
  const displayDeals = viewSavedOnly ? savedDeals : deals;

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-sky-500 selection:text-white pb-20">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#0a1120]/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ThinkATrip Logo" className="h-12 w-auto object-contain rounded-full border border-slate-700/50" />
          <div className="flex flex-col justify-center">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-500 leading-none">thinkatrip</span>
            <span className="text-[10px] sm:text-xs italic text-slate-400 leading-tight">road to heaven</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">
              <span className="text-xs font-bold text-sky-400">👋 {currentUser.username}</span>
              <div className="w-px h-4 bg-slate-600"></div>
              <button onClick={handleLogout} className="text-xs font-semibold text-slate-400 hover:text-white transition">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-[11px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full transition">
              Sign In
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Booking Engine */}
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

        {/* Matrix & Scraped Coupons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              
              {/* Toggle Tabs */}
              <div className="flex bg-[#0a1120] p-1 rounded-xl border border-slate-700/50">
                <button onClick={() => setViewSavedOnly(false)} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${!viewSavedOnly ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"}`}>
                  Live Routes
                </button>
                {currentUser && (
                  <button onClick={() => setViewSavedOnly(true)} className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${viewSavedOnly ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"}`}>
                    Saved Trips <span className="bg-slate-800 text-white rounded-full px-2 py-0.5 text-[10px]">{savedDeals.length}</span>
                  </button>
                )}
              </div>

              {!viewSavedOnly && (
                <div className="flex gap-2">
                  {INDIAN_ORIGINS.map((code) => (
                    <button key={code} onClick={() => setSelectedOrigin(code)} className={`px-3 py-1 text-xs rounded-lg font-bold ${selectedOrigin === code ? "bg-slate-700 text-white" : "bg-[#0a1120] text-slate-400"}`}>{code}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Flight Table */}
            <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-400 text-[10px] uppercase bg-[#0a1120] font-bold">
                    <th className="p-4">Save</th>
                    <th className="p-4">Route & Date</th>
                    <th className="p-4">Airline & Flight</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 text-right">Book</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {displayDeals.length === 0 && (
                     <tr>
                       <td colSpan={5} className="p-8 text-center text-slate-400">
                         {viewSavedOnly ? "You haven't saved any flights yet." : "No live deals found."}
                       </td>
                     </tr>
                  )}
                  {displayDeals.map((deal, idx) => {
                    const isSaved = savedDeals.some(d => d.id === deal.id);
                    
                    // Display Fix: Getting the Airline Name and slicing the Flight Number
                    const safeAirlineCode = deal.airline ? deal.airline.toUpperCase() : "";
                    const fullAirlineName = AIRLINE_MAP[safeAirlineCode] || deal.airline;
                    const cleanFlightNumber = deal.flightNumber.includes('_') 
                        ? deal.flightNumber.split('_').pop() 
                        : deal.flightNumber;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="p-4">
                          <button onClick={() => toggleSaveDeal(deal)} className={`text-lg ${isSaved ? "text-red-500" : "text-slate-600"}`}>{isSaved ? "❤️" : "🤍"}</button>
                        </td>
                        <td className="p-4 font-bold text-white">
                          <div>{deal.origin} <span className="text-sky-500">→</span> {deal.destination}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{deal.travelDate}</div>
                        </td>
                        
                        {/* FLIGHT NUMBER AND AIRLINE FIX */}
                        <td className="p-4">
                          <div className="text-xs font-bold text-slate-200">{fullAirlineName}</div>
                          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded inline-block mt-1">
                            {cleanFlightNumber}
                          </div>
                        </td>

                        <td className="p-4 font-extrabold text-sky-400">₹{deal.dealPrice.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => window.open(generateAffiliateLink(deal.origin, deal.destination, deal.travelDate), "_blank")} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs">Book</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

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

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-2xl font-black text-white mb-2">{authMode === "login" ? "Welcome Back" : "Create Account"}</h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Username</label>
                <input type="text" value={authForm.username} onChange={(e) => setAuthForm({...authForm, username: e.target.value})} className="w-full bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                <input type="password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-white focus:outline-none" required />
              </div>
              <button type="submit" className="w-full bg-sky-500 text-white font-bold py-3 rounded-xl">Submit</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
