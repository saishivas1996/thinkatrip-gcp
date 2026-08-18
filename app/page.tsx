"use client";

import { useState, useEffect } from "react";

interface Flight {
  source?: string;
  origin?: string;
  destination: string;
  date: string;
  journeyTime?: string;
  duration?: string;
  price: string;
  bookingLink?: string; // Added for Travelpayouts integration
}

export default function HomePage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrigin, setSelectedOrigin] = useState("BLR"); // Default to Bangalore

  // Popular Indian Origins Banner
  const indianOrigins = [
    { code: "BLR", name: "Bangalore" },
    { code: "BOM", name: "Mumbai" },
    { code: "DEL", name: "Delhi" },
    { code: "HYD", name: "Hyderabad" },
    { code: "VTZ", name: "Visakhapatnam" },
  ];

  // Fetch data from your FastAPI backend
  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        // We will configure Nginx to route /api to your FastAPI backend
        const response = await fetch(`/api/deals?origin=${selectedOrigin}`);
        const data = await response.json();
        setFlights(data);
      } catch (error) {
        console.error("Failed to fetch flights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [selectedOrigin]); // Re-run whenever the user clicks a new origin

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      {/* India Origins Banner */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Popular India Origins</h2>
        <div className="flex flex-wrap gap-3">
          {indianOrigins.map((airport) => (
            <button
              key={airport.code}
              onClick={() => setSelectedOrigin(airport.code)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedOrigin === airport.code 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {airport.name} ({airport.code})
            </button>
          ))}
        </div>
      </div>

      {/* Flight Data Table (Scrollable Box) */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Best Deals from {selectedOrigin}
      </h3>
      
      {/* max-h-[500px] and overflow-y-auto create the scrollable box */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-xl shadow-lg border border-gray-100">
        <table className="min-w-full text-base text-left text-gray-700 bg-white relative">
          <thead className="text-sm text-gray-600 uppercase bg-blue-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Destination</th>
              <th className="px-6 py-4 font-bold tracking-wider">Date</th>
              <th className="px-6 py-4 font-bold tracking-wider">Price</th>
              <th className="px-6 py-4 font-bold tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">Loading best deals...</td></tr>
            ) : flights.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">No flights found.</td></tr>
            ) : (
              flights.map((flight, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-medium">{flight.destination}</td>
                  <td className="px-6 py-5 text-gray-600">{flight.date}</td>
                  <td className="px-6 py-5 font-bold text-green-600 text-lg">₹{flight.price}</td>
                  <td className="px-6 py-5">
                    {/* Travelpayouts Affiliate Link Button */}
                    <a 
                      href={flight.bookingLink || "#"} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
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
  );
}
