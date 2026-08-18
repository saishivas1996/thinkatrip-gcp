"use client";

import { useState } from "react";

export default function HomePage() {
  // We use this state to hold the flight data from your FastAPI backend
  const [flights, setFlights] = useState([
    // Placeholder data to preview the new UI - replace with real API data
    {
      source: "Bangalore (BLR)",
      destination: "Visakhapatnam (VTZ)",
      date: "2026-05-15",
      journeyTime: "1h 45m",
      price: "4,500"
    },
    {
      source: "Bangalore (BLR)",
      destination: "Visakhapatnam (VTZ)",
      date: "2026-05-18",
      journeyTime: "1h 50m",
      price: "5,200"
    }
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      {/* 1. General Flight Search Section (Top) */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mb-10">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Find Your Next Flight</h2>
        
        {/* We will replace these simple inputs with the 'react-select' click-and-choose dropdowns next */}
        <form className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Origin (e.g., BLR)" 
            className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <input 
            type="text" 
            placeholder="Destination (e.g., VTZ)" 
            className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <input 
            type="date" 
            className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-600"
          />
          <button 
            type="button" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg"
          >
            Search Flights
          </button>
        </form>
      </div>

      {/* 2. Flight Data Table (Increased Size & Journey Time Added) */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">Available Flights</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-base text-left text-gray-700 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <thead className="text-sm text-gray-600 uppercase bg-blue-50 border-b border-blue-100">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Source</th>
              <th className="px-6 py-4 font-bold tracking-wider">Destination</th>
              <th className="px-6 py-4 font-bold tracking-wider">Date</th>
              <th className="px-6 py-4 font-bold tracking-wider">Journey Time</th>
              <th className="px-6 py-4 font-bold tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {flights.map((flight, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                
                {/* Fallback added here to ensure data displays whether the API calls it 'source' or 'origin' */}
                <td className="px-6 py-5 font-semibold text-gray-900">
                  {flight.source || flight.origin}
                </td>
                <td className="px-6 py-5 font-medium">{flight.destination}</td>
                <td className="px-6 py-5 text-gray-600">{flight.date}</td>
                
                {/* New Journey Time Column */}
                <td className="px-6 py-5 font-medium text-indigo-600">
                  {flight.journeyTime || flight.duration || "N/A"}
                </td>
                
                <td className="px-6 py-5 font-bold text-green-600 text-lg">
                  ₹{flight.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty State Handler */}
        {flights.length === 0 && (
          <div className="text-center py-10 bg-white shadow-lg rounded-xl mt-4 text-gray-500">
            No flights found. Try adjusting your search!
          </div>
        )}
      </div>

    </div>
  );
}
