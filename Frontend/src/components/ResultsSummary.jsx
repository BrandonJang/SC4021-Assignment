export default function ResultsSummary({ stats }) {
  // If stats is actually the results array, count sentiments here
  let positive = 0, neutral = 0, negative = 0;
  if (Array.isArray(stats)) {
    stats.forEach(item => {
      if (item.sentiment === "positive") positive++;
      else if (item.sentiment === "neutral") neutral++;
      else if (item.sentiment === "negative") negative++;
    });
  } else {
    positive = stats.positive || 0;
    neutral = stats.neutral || 0;
    negative = stats.negative || 0;
  }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-green-800 rounded-xl p-5 shadow">
        <h3 className="text-white font-semibold">Positive</h3>
        <p className="text-3xl font-bold mt-2">{positive}</p>
      </div>
      <div className="bg-yellow-800 rounded-xl p-5 shadow">
        <h3 className="text-white font-semibold">Neutral</h3>
        <p className="text-3xl font-bold mt-2">{neutral}</p>
      </div>
      <div className="bg-red-800 rounded-xl p-5 shadow">
        <h3 className="text-white font-semibold">Negative</h3>
        <p className="text-3xl font-bold mt-2">{negative}</p>
      </div>
    </div>
  );
}