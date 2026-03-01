import { useState } from "react";

export default function SearchBar({ onSearch }) {

  const [keyword, setKeyword] = useState("");
  const [source, setSource] = useState("All Sources");
  const [sentiment, setSentiment] = useState("All Sentiments");

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        keyword,
        source,
        sentiment
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

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <select 
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-gray-800 text-white"
          >
          <option>All Sources</option>
          <option>Reddit</option>
          <option>Twitter</option>
          <option>News</option>
        </select>

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

        {/* Date input removed, not needed for backend */}
      </div>
    </div>
  );
}