export default function SentimentSummary() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      
      <div className="bg-green-800 rounded-xl p-5 shadow">
        <h3 className="text-white font-semibold">Positive</h3>
        <p className="text-3xl font-bold mt-2">124</p>
      </div>

      <div className="bg-yellow-800 rounded-xl p-5 shadow">
        <h3 className="text-white font-semibold">Neutral</h3>
        <p className="text-3xl font-bold mt-2">89</p>
      </div>

      <div className="bg-red-800 rounded-xl p-5 shadow">
        <h3 className="text-white font-semibold">Negative</h3>
        <p className="text-3xl font-bold mt-2">203</p>
      </div>

    </div>
  );
}