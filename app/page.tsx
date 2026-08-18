"use client";

import { useState, useEffect } from "react";

interface Deal {
  flightNumber: string;
  origin: string;
  destination: string;
  date: string;
  price: string;
  airline: string;
  bookingLink: string;
}

export default function HomePage() {
  // --- 1. Custom Flight Search State ---
  const [searchOrigin, setSearchOrigin] = useState("BLR");
  const [searchDestination, setSearchDestination] = useState("DXB");
  const [departDate, setDepartDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  // --- 2. Deals Table State ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState("BLR");
  const [loadingDeals, setLoadingDeals] = useState(false);

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
      {/* ✈️ GENERAL FLIGHT SEARCH BAR (Directly inside page.tsx)     */}
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

          {/* Date */}
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

          {/* Submit */}
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
      {/* 📊 CURATED LIVE DEALS SECTION                                */}
      {/* ============================================================ */}
      <section className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Today's Cheapest Flight Deals</h2>
            <p className="text-slate-400 text-sm">Automated daily price drops</p>
          </div>

          {/* Quick Origin Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Origin:
            </span>
            {["BLR", "DEL", "BOM", "HYD", "VTZ"].map((code) => (
              <button
                key={code}
                onClick={() => setSelectedOrigin(code)}
                className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
                  selectedOrigin === code
                    ? "bg-orange-500 text-white"
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
                <th className="p-4">Date</th>
                <th className="p-4">Airline</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingDeals ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-400">
                    Loading freshest deals...
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-500">
                    No deals found for {selectedOrigin}. Check back soon!
                  </td>
                </tr>
              ) : (
                deals.map((deal, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-800/50 hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-bold text-white">
                      {deal.origin} → {deal.destination}
                    </td>
                    <td className="p-4 text-slate-400">{deal.date}</td>
                    <td className="p-4 text-slate-300">{deal.airline || "Various"}</td>
                    <td className="p-4 font-extrabold text-green-400">
                      ₹{deal.price}
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={deal.bookingLink || `https://search.aviasales.com/flights/?origin_iata=${deal.origin}&destination_iata=${deal.destination}&depart_date=${deal.date}&marker=${process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || "YOUR_MARKER_ID"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition"
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
      </section>
    </main>
  );
}
