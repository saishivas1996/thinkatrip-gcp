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
  bookingLink: string;
}

export default function HomePage() {
  // --- 1. Authentication State (Simulating Dynamic Backend) ---
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });

  // --- 2. Search & UI State ---
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [searchOrigin, setSearchOrigin] = useState("VTZ");
  const [searchDestination, setSearchDestination] = useState("BLR");
  const [departDate, setDepartDate] = useState("2026-08-20");
  const [returnDate, setReturnDate] = useState("2026-08-21");
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("e"); // 'e' for Economy
  
  // --- 3. Deals & Wishlist State ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState("VTZ");
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [savedDeals, setSavedDeals] = useState<string[]>([]); // Array of Deal IDs

  const INDIAN_ORIGINS = [
    { code: "VTZ", name: "Visakhapatnam" },
    { code: "BLR", name: "Bengaluru" },
    { code: "DEL", name: "Delhi" },
    { code: "BOM", name: "Mumbai" },
    { code: "HYD", name: "Hyderabad" },
    { code: "MAA", name: "Chennai" },
  ];

  const AIRLINE_COUPONS = [
    {
      airline: "Ixigo Special",
      code: "IXIGOFLIGHT",
      discount: "Flat ₹1,200 Off",
      desc: "Valid on domestic & international flights.",
      validity: "Valid till Aug 31",
    },
    {
      airline: "IndiGo",
      code: "6EGO",
      discount: "Flat ₹750 Off",
      desc: "Valid on domestic routes across all morning flights.",
      validity: "Valid till Aug 31",
    },
    {
      airline: "Air India",
      code: "AIFLYNOW",
      discount: "Up to 20% Off",
      desc: "Special discount on international and domestic connections.",
      validity: "Limited Period",
    },
    {
      airline: "Credit Card Offer",
      code: "HDFCCC",
      discount: "10% Instant Off",
      desc: "Extra savings on weekends with specific bank cards.",
      validity: "Weekend Only",
    }
  ];

  // Initialize Auth & Wishlist from Local Storage (Pre-Backend Setup)
  useEffect(() => {
    const storedUser = localStorage.getItem("thinkatrip_user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      const userSaves = localStorage.getItem(`saved_deals_${JSON.parse(storedUser).username}`);
      if (userSaves) setSavedDeals(JSON.parse(userSaves));
    }
  }, []);

  // Fetch Live Deals from FastAPI
  useEffect(() => {
    async function fetchDeals() {
      setLoadingDeals(true);
      try {
        const res = await fetch(`/api/deals?origin=${selectedOrigin}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // Map backend data to include a unique ID for saving
          const formattedDeals = data.map((d, i) => ({
            ...d,
            id: `${d.origin}-${d.destination}-${d.travelDate}-${i}`
          }));
          setDeals(formattedDeals);
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

  // Handle Authentication Submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.username || !authForm.password) return alert("Please enter credentials");
    
    // In a dynamic app, this sends a POST to FastAPI. For now, it saves locally.
    const userData = { username: authForm.username };
    localStorage.setItem("thinkatrip_user", JSON.stringify(userData));
    
    // Simulate user database creation
    if (authMode === "signup") {
      localStorage.setItem(`user_db_${authForm.username}`, JSON.stringify(authForm));
    }

    setCurrentUser(userData);
    setShowAuthModal(false);
    setAuthForm({ username: "", password: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem("thinkatrip_user");
    setCurrentUser(null);
    setSavedDeals([]);
  };

  // Handle Wishlist Toggle
  const toggleSaveDeal = (dealId: string) => {
    if (!currentUser) return setShowAuthModal(true);
    
    let updatedSaves = [...savedDeals];
    if (updatedSaves.includes(dealId)) {
      updatedSaves = updatedSaves.filter(id => id !== dealId);
    } else {
      updatedSaves.push(dealId);
    }
    setSavedDeals(updatedSaves);
    localStorage.setItem(`saved_deals_${currentUser.username}`, JSON.stringify(updatedSaves));
  };

  // Ixigo Affiliate Search Redirect
  const handleIxigoSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = departDate ? departDate.replace(/-/g, '') : '';
    const formattedReturn = returnDate && tripType === 'roundtrip' ? returnDate.replace(/-/g, '') : '';
    
    // Ixigo Affiliate Tracking URL format
    let searchUrl = `https://www.ixigo.com/search/flights?from=${searchOrigin.toUpperCase()}&to=${searchDestination.toUpperCase()}&date=${formattedDate}&adults=${passengers}&class=${travelClass}`;
    
    if (tripType === "roundtrip") {
      searchUrl += `&returnDate=${formattedReturn}`;
    }
    
    // Append your affiliate tracking parameters here when provided by EarnKaro/Ixigo
    // searchUrl += `&affiliate=YOUR_AFFILIATE_ID`;
    
    window.open(searchUrl, "_blank");
  };

  const handleSwapAirports = () => {
    const temp = searchOrigin;
    setSearchOrigin(searchDestination);
    setSearchDestination(temp);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 🚀 Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          {/* Ensure your logo image is saved in the 'public' folder of your Next.js app */}
          <img 
            src="/logo.png" 
            alt="ThinkATrip - Road to Heaven" 
            className="h-10 w-auto bg-white px-2 py-1 rounded-md" 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-300 hidden md:flex items-center gap-1.5">
            <span>🛡️</span> Hassle-Free Bookings
          </span>
          <span className="text-xs font-semibold text-slate-300 hidden md:flex items-center gap-1.5 mr-4">
            <span>📞</span> 24x7 Support
          </span>

          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-full">
              <span className="text-xs font-bold text-orange-400">👋 {currentUser.username}</span>
              <div className="w-px h-4 bg-slate-700"></div>
              <button onClick={handleLogout} className="text-xs font-semibold text-slate-400 hover:text-white transition">Logout</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-md shadow-orange-500/20"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* ✈️ Booking Engine (Ixigo Integrated) */}
        <div className="bg-gradient-to-br from-[#111827] via-[#1e1b4b]/40 to-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-10 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-800 pb-4 gap-4">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button type="button" onClick={() => setTripType("oneway")} className={`px-5 py-2 text-xs font-bold rounded-lg transition ${tripType === "oneway" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>One Way</button>
              <button type="button" onClick={() => setTripType("roundtrip")} className={`px-5 py-2 text-xs font-bold rounded-lg transition ${tripType === "roundtrip" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>Round Trip</button>
            </div>
            <div className="text-xs text-orange-400 font-semibold bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
              ✨ Guaranteed Best Fares & Instant Cashbacks
            </div>
          </div>

          <form onSubmit={handleIxigoSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-4 grid grid-cols-2 relative bg-slate-950 border border-slate-800 rounded-2xl p-2 gap-2">
              <div className="p-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">From</label>
                <input type="text" value={searchOrigin} onChange={(e) => setSearchOrigin(e.target.value.toUpperCase())} maxLength={3} className="w-full bg-transparent font-mono text-xl font-extrabold text-white focus:outline-none uppercase" required />
              </div>
              <button type="button" onClick={handleSwapAirports} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-orange-400 hover:bg-orange-500 hover:text-white transition shadow-md z-10">⇄</button>
              <div className="p-2 border-l border-slate-800 pl-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">To</label>
                <input type="text" value={searchDestination} onChange={(e) => setSearchDestination(e.target.value.toUpperCase())} maxLength={3} className="w-full bg-transparent font-mono text-xl font-extrabold text-white focus:outline-none uppercase" required />
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Departure</label>
              <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} className="w-full bg-transparent text-sm font-bold text-white focus:outline-none" required />
            </div>

            <div className={`md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 ${tripType === 'roundtrip' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Return</label>
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full bg-transparent text-sm font-bold text-white focus:outline-none" />
            </div>

            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Travellers</label>
              <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="w-full bg-transparent text-sm font-bold text-white focus:outline-none">
                {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-slate-900">{n} Traveller{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-extrabold py-4 px-4 rounded-2xl transition shadow-lg shadow-orange-500/25 text-white text-sm">Search Ixigo</button>
            </div>
          </form>
        </div>

        {/* 📊 Matrix & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Automated Price Drops</h2>
                <p className="text-slate-400 text-xs">Real-time alerts curated from backend bots</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {INDIAN_ORIGINS.map(({ code }) => (
                  <button key={code} onClick={() => setSelectedOrigin(code)} className={`px-3 py-1.5 text-xs rounded-xl font-bold transition ${selectedOrigin === code ? "bg-orange-500 text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"}`}>{code}</button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase bg-slate-950 font-bold">
                    <th className="p-4">Save</th>
                    <th className="p-4">Route</th>
                    <th className="p-4">Travel Date</th>
                    <th className="p-4">Price Drop</th>
                    <th className="p-4 text-right">Book</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {deals.map((deal, idx) => {
                    const isSaved = savedDeals.includes(deal.id);
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="p-4">
                          <button onClick={() => toggleSaveDeal(deal.id)} className={`text-lg transition ${isSaved ? "text-red-500 scale-110" : "text-slate-600 hover:text-red-400"}`}>
                            {isSaved ? "❤️" : "🤍"}
                          </button>
                        </td>
                        <td className="p-4 font-bold text-white">
                          {deal.origin} <span className="text-orange-500 text-xs">→</span> {deal.destination}
                        </td>
                        <td className="p-4 text-slate-300 text-xs font-medium">{deal.travelDate}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 line-through">₹{deal.originalPrice.toLocaleString()}</span>
                            <span className="font-extrabold text-emerald-400 text-base">₹{deal.dealPrice.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <a href={deal.bookingLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-slate-800 hover:bg-orange-500 hover:text-white border border-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition">
                            Book Now
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl sticky top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="font-extrabold text-sm text-white">🎟️ Active Coupons</h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">Verified</span>
              </div>
              
              <div className="space-y-3">
                {AIRLINE_COUPONS.map((offer, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white">{offer.airline}</span>
                      <span className="text-[10px] font-extrabold text-emerald-400">{offer.discount}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">{offer.desc}</p>
                    <div className="flex items-center justify-between bg-slate-900 border border-dashed border-slate-700 rounded-lg px-2 py-1.5">
                      <span className="font-mono font-bold text-xs text-orange-400">{offer.code}</span>
                      <button onClick={() => copyToClipboard(offer.code)} className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition text-white">
                        {copiedCode === offer.code ? "Copied ✅" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔐 Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-2xl font-black text-white mb-2">{authMode === "login" ? "Welcome Back" : "Create Account"}</h2>
            <p className="text-xs text-slate-400 mb-6">Store user data securely and save your favorite deals.</p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Username</label>
                <input type="text" value={authForm.username} onChange={(e) => setAuthForm({...authForm, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="johndoe" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                <input type="password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-orange-500 focus:outline-none" placeholder="••••••••" required />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-orange-500/20 mt-2">
                {authMode === "login" ? "Sign In" : "Sign Up"}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition">
                {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
