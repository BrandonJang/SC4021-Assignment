export default function SearchBar() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Search Query</h2>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter keywords..."
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
        />

        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
          Search
        </button>
      </div>
    </div>
  );
}