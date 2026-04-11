
import { useState } from "react";
import countries from "./countries";

export default function SearchBar({ onSearch, spellcheckSuggestion }) {

  const [keyword, setKeyword] = useState("");
  const [sentiment, setSentiment] = useState("All Sentiments");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [country, setCountry] = useState("");
  const [maxResults, setMaxResults] = useState(10000);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        keyword,
        sentiment,
        startDate,
        endDate,
        country,
        maxResults

      });
    }
  };


  return (
    <div className="bg-gray-800 rounded-xl shadow p-6">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter query..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 h-12 border rounded-lg px-4 focus:ring-2 focus:ring-indigo-500"
        />

        <button 
          onClick={handleSearch}
          className="h-12 bg-indigo-600 text-white px-6 rounded-lg hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </div>

      {spellcheckSuggestion && spellcheckSuggestion !== keyword && (
        <p className="mt-2 text-red-400">
          Did you mean{" "}
          <span
            className="underline cursor-pointer"
            onClick={() => {
              setKeyword(spellcheckSuggestion);
              handleSearch(spellcheckSuggestion);
            }}
          >
            {spellcheckSuggestion}
          </span>
          ?
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <select 
          value={sentiment} 
          onChange={(e) => setSentiment(e.target.value)} 
          className="border rounded-lg px-4 py-2 bg-gray-800 text-white"
        >
          <option>All Sentiments</option>
          <option>Positive</option>
          <option>Neutral</option>
          <option>Negative</option>
        </select>

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-gray-800 text-white"
        >
          <option value="All Countries">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-1/2 border rounded-lg px-2 py-2 bg-gray-800 text-white"
            title="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-1/2 border rounded-lg px-2 py-2 bg-gray-800 text-white"
            title="End Date"
          />
        </div>

        <select
          value={maxResults}
          onChange={(e) => setMaxResults(Number(e.target.value))}
          className="border rounded-lg px-4 py-2 bg-gray-800 text-white"
        >
          <option value={10000}>All Results</option>
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </select>
      </div>
    </div>
  );
}