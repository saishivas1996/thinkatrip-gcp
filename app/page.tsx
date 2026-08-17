import React from "react";
import { auth, signIn, signOut } from "../auth";
import { Plane, Calendar, ArrowRight, User, MessageCircle, ExternalLink, Search, MapPin, Users, TrendingDown, TrendingUp } from "lucide-react";
import ChatBot from "../components/ChatBot";

// Custom Instagram Icon SVG
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

async function getLiveFlights(searchParams: any) {
  // In the next step, we will connect this directly to a Live API via your FastAPI backend.
  // For now, it filters our database/mock data based on the live search parameters.
  try {
    const res = await fetch('http://127.0.0.1:8000/api/deals', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.deals && data.deals.length > 0) return data.deals;
    }
  } catch (error) {
    console.error("FastAPI fetch error:", error);
  }
  
  return [
    { flight_number: "6E-112", origin: "VTZ", destination: "SIN", price: 12200, previous_price: 14500, date: "2026-11-15", airline: "Indigo" },
    { flight_number: "EK-501", origin: "BOM", destination: "DXB", price: 18450, previous_price: 18000, date: "2026-10-12", airline: "Emirates" },
    { flight_number: "SQ-503", origin: "BLR", destination: "BKK", price: 19800, previous_price: 24000, date: "2026-09-20", airline: "Singapore Airlines" },
    { flight_number: "AI-193", origin: "DEL", destination: "LHR", price: 44500, previous_price: 52000, date: "2026-10-05", airline: "Air India" },
  ];
}

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  
  // Live Search Parameters
  const origin = typeof searchParams?.origin === 'string' ? searchParams.origin.toUpperCase() : 'VTZ';
  const destination = typeof searchParams?.destination === 'string' ? searchParams.destination.toUpperCase() : '';
  const date = typeof searchParams?.date === 'string' ? searchParams.date : '';
  const pax = typeof searchParams?.pax === 'string' ? searchParams.pax : '1';

  let flights = await getLiveFlights(searchParams);

  // Apply Live Filters if user searched
  if (origin && destination) {
    flights = flights.filter((f: any) => f.origin === origin && f.destination.includes(destination));
  }

  const AFFILIATE_ID = "YOUR_AFFILIATE_ID"; 
  const WHATSAPP_URL = "https://wa.me/919999999999?text=Hello%20thinkatrip!%20Need%20help%20with%20a%20booking.";
  const INSTAGRAM_URL = "https://instagram.com/thinkatrip";

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <ChatBot />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="thinkatrip logo" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{session.user?.email}</span>
                </div>
                <form action={async () => { "use server"; await signOut(); }}>
                  <button className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">Sign Out</button>
                </form>
              </div>
            ) : (
              <form action={async () => { "use server"; await signIn(); }}>
                <button className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md ml-2">VIP Login</button>
              </form>
            )}
          </div>
        </div>
      </nav>

      {/* Live Search Hero */}
      <div className="bg-slate-900 overflow-hidden text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-8">
            Find your next <span className="text-emerald-400">escape.</span>
          </h2>

          {/* Real-Time Flight Search Engine */}
          <form method="GET" action="/" className="bg-white rounded-3xl shadow-2xl p-4 flex flex-col md:flex-row gap-4 border border-slate-700 text-slate-900 text-left">
            
            <div className="flex-1 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From</label>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-emerald-500 mr-2" />
                <input type="text" name="origin" defaultValue={origin} placeholder="e.g. VTZ" className="w-full bg-transparent font-black text-lg focus:outline-none uppercase" required />
              </div>
            </div>

            <div className="flex-1 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">To</label>
              <div className="flex items-center">
                <Plane className="h-4 w-4 text-blue-500 mr-2" />
                <input type="text" name="destination" defaultValue={destination} placeholder="e.g. DXB" className="w-full bg-transparent font-black text-lg focus:outline-none uppercase" required />
              </div>
            </div>

            <div className="flex-1 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Depart Date</label>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                <input type="date" name="date" defaultValue={date} className="w-full bg-transparent font-bold text-slate-700 focus:outline-none" />
              </div>
            </div>

            <div className="w-full md:w-32 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Passengers</label>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-slate-400 mr-2" />
                <input type="number" name="pax" min="1" defaultValue={pax} className="w-full bg-transparent font-bold text-slate-700 focus:outline-none" />
              </div>
            </div>

            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black transition-colors flex items-center justify-center gap-2">
              <Search className="h-5 w-5" /> Search
            </button>
          </form>
        </div>
      </div>

      {/* Sequential Deal List */}
      <div id="deals" className="max-w-5xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8 border-b border-slate-200 pb-4">
          Today's Best Flight Deals
        </h3>

        {flights.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <Plane className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No flights found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your dates or destinations.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {flights.map((flight: any, index: number) => {
              
              // Formatting prices strictly in INR
              const currentPriceRaw = typeof flight.price === 'string' ? parseInt(flight.price.replace(/[^0-9]/g, '')) : flight.price;
              const prevPriceRaw = typeof flight.previous_price === 'string' ? parseInt(flight.previous_price.replace(/[^0-9]/g, '')) : flight.previous_price || (currentPriceRaw * 1.3);
              
              const currentPrice = currentPriceRaw.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
              const prevPrice = prevPriceRaw.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
              
              // Calculate Price Trend
              const isCheaper = currentPriceRaw < prevPriceRaw;
              const diffAmt = Math.abs(prevPriceRaw - currentPriceRaw).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
              const affiliateUrl = `https://c.travelpayouts.com/click?origin=${flight.origin}&destination=${flight.destination}&affiliate_id=${AFFILIATE_ID}`;

              return (
                <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* Flight Info */}
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {flight.airline}
                      </span>
                      <span className="text-slate-400 text-xs font-mono">{flight.flight_number}</span>
                      <span className="text-slate-500 text-xs font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {flight.date}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-black text-slate-900">{flight.origin}</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center px-4">
                        <div className="w-full h-px bg-slate-300 relative">
                          <Plane className="h-4 w-4 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Direct</span>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-slate-900">{flight.destination}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Booking */}
                  <div className="w-full md:w-auto flex flex-col items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                    
                    {/* Price History Comparison */}
                    {isCheaper ? (
                      <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mb-2">
                        <TrendingDown className="h-3.5 w-3.5" /> Dropped by {diffAmt}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-bold mb-2">
                        <TrendingUp className="h-3.5 w-3.5" /> Increased by {diffAmt}
                      </div>
                    )}

                    <div className="text-right mb-4">
                      <p className="text-xs text-slate-400 line-through font-medium">Was {prevPrice}</p>
                      <p className="text-3xl font-black text-slate-900">{currentPrice}</p>
                    </div>

                    <a href={affiliateUrl} target="_blank" rel="noreferrer" className="w-full text-center bg-slate-900 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-md">
                      Book Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800">
         <p>© 2026 thinkatrip. All rights reserved.</p>
      </footer>
    </main>
  );
}
