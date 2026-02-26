export default function SentimentSummary() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      
      <div className="bg-green-100 rounded-xl p-5 shadow">
        <h3 className="text-green-700 font-semibold">Positive</h3>
        <p className="text-3xl font-bold mt-2">124</p>
      </div>

      <div className="bg-gray-200 rounded-xl p-5 shadow">
        <h3 className="text-gray-700 font-semibold">Neutral</h3>
        <p className="text-3xl font-bold mt-2">89</p>
      </div>

      <div className="bg-red-100 rounded-xl p-5 shadow">
        <h3 className="text-red-700 font-semibold">Negative</h3>
        <p className="text-3xl font-bold mt-2">203</p>
      </div>

    </div>
  );
}