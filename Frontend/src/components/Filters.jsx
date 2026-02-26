export default function Filters() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <select className="border rounded-lg px-4 py-2">
          <option>All Sources</option>
          <option>Reddit</option>
          <option>Twitter</option>
          <option>News</option>
        </select>

        <select className="border rounded-lg px-4 py-2">
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