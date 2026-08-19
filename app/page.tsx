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
  // --- 1. General Flight Search State ---
  const [searchOrigin, setSearchOrigin] = useState("BLR");
  const [searchDestination, setSearchDestination] = useState("DXB");
  const [departDate, setDepartDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  // --- 2. Live Deals Table State ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState("BLR");
  const [loadingDeals, setLoadingDeals] = useState(false);

  // The 8 Main Indian Hubs
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

  // Fetch curated deals from FastAPI backend
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

  // Handle General Flight Search Form Submit
  const handleFlightSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || "YOUR_MARKER_ID";
    const searchUrl = `https://search.aviasales.com/flights/?origin_iata=${searchOrigin.toUpperCase()}&destination_iata=${searchDestination.toUpperCase()}&depart_date=${departDate}&adults=${passengers}&children=0&infants=0&trip_class=0&marker=${marker}&locale=en`;
    window.open(searchUrl, "_blank");
  };

  // Format YYYY-MM-DD to readable date
  const formatTravelDate = (dateStr: string) => {
    if (!dateStr) return "Flexible";
    try {
      const parsed = new Date(dateStr);
      return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      {/* Hero Header */}
      <header className="text-center my-6">
        <h1 className="text-4xl sm:text-5xl font-black text-orange-500 tracking-tight">
          ThinkATrip
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Find live flight deals & book at the lowest prices
        </p>
      </header>

      {/* ============================================================ */}
      {/* ✈️ 1. GENERAL FLIGHT SEARCH BAR                             */}
      {/* ============================================================ */}
      <section className="w-full max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl mb-12 backdrop-blur-md">
        <h2 className="text-lg font-bold text-orange-400 mb-4">
          Search Any Flight Route
        </h2>
        <form
          onSubmit={handleFlightSearch}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end"
        >
          {/* Origin */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              FROM (Airport Code)
            </label>
            <input
              type="text"
              value={searchOrigin}
              maxLength={3}
              onChange={(e) => setSearchOrigin(e.target.value.toUpperCase())}
              placeholder="BLR"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-center font-mono font-bold focus:outline-none focus:border-orange-500 uppercase text-white"
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              TO (Airport Code)
            </label>
            <input
              type="text"
              value={searchDestination}
              maxLength={3}
              onChange={(e) => setSearchDestination(e.target.value.toUpperCase())}
              placeholder="DXB"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-center font-mono font-bold focus:outline-none focus:border-orange-500 uppercase text-white"
              required
            />
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              DEPARTURE DATE
            </label>
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500 text-white"
              required
            />
          </div>

          {/* Passengers */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              PASSENGERS
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500 text-white"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Adult" : "Adults"}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-orange-500/25 cursor-pointer"
            >
              Search Flights
            </button>
          </div>
        </form>
      </section>

      {/* ============================================================ */}
      {/* 📊 2. CURATED LIVE DEALS (8 INDIAN HUBS)                    */}
      {/* ============================================================ */}
      <section className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Today's Cheapest Flight Deals</h2>
            <p className="text-slate-400 text-sm">Automated daily price drops in INR</p>
          </div>

          {/* Origin Filter - 8 Hubs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold w-full sm:w-auto">
              Departing From:
            </span>
            {INDIAN_ORIGINS.map(({ code, name }) => (
              <button
                key={code}
                onClick={() => setSelectedOrigin(code)}
                title={name}
                className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all ${
                  selectedOrigin === code
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Deals Table */}
        <div className="overflow-x-auto bg-slate-900/60 border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-900/80">
                <th className="p-4">Route</th>
                <th className="p-4">Travel Date</th>
                <th className="p-4">Airline</th>
                <th className="p-4">Deal Price & Drop</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingDeals ? (
                <tr>
                  <td colSpan={5} className="text-center p-12 text-slate-400">
                    <span className="animate-pulse">Fetching the best flight deals...</span>
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-12 text-slate-500">
                    No deals currently cached for {selectedOrigin}. Check back soon!
                  </td>
                </tr>
              ) : (
                deals.map((deal, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-800/50 hover:bg-slate-800/40 transition"
                  >
                    {/* Route */}
                    <td className="p-4 font-bold text-white text-base">
                      {deal.origin} <span className="text-slate-500">→</span> {deal.destination}
                    </td>

                    {/* Travel Date */}
                    <td className="p-4 text-slate-300 font-medium">
                      {formatTravelDate(deal.travelDate)}
                    </td>

                    {/* Airline */}
                    <td className="p-4 text-slate-400">
                      {deal.airline || "Various"}
                    </td>

                    {/* Price & Price Drop */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 line-through">
                          ₹{deal.originalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="font-extrabold text-green-400 text-lg">
                          ₹{deal.dealPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-bold text-orange-400">
                          Drop: ₹{deal.priceDrop.toLocaleString("en-IN")} ↓
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right align-middle">
                      <a
                        href={deal.bookingLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-md transition transform hover:scale-105"
                      >
                        Book Deal
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
