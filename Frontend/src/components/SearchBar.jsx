export default function SearchBar() {
  return (
    <div className="bg-gray-800 rounded-xl shadow p-6">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter keywords..."
          className="flex-1 h-12 border rounded-lg px-4 focus:ring-2 focus:ring-indigo-500"
        />

        <button className="h-12 bg-indigo-600 text-white px-6 rounded-lg hover:bg-indigo-700 transition">
          Search
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <select className="border rounded-lg px-4 py-2 bg-gray-800 text-white">
          <option>All Sources</option>
          <option>Reddit</option>
          <option>Twitter</option>
          <option>News</option>
        </select>

        <select className="border rounded-lg px-4 py-2 bg-gray-800 text-white">
          <option>All Sentiments</option>
          <option>Positive</option>
          <option>Neutral</option>
          <option>Negative</option>
        </select>

        <input
          type="date"
          className="border rounded-lg px-4 py-2"
        />
      </div>
    </div>
  );
}