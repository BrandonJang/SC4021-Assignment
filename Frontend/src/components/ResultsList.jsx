export default function ResultsList() {
  const data = [
    {
      id: 1,
      source: "Reddit",
      sentiment: "Negative",
      text: "The death penalty does not deter crime.",
      date: "2026-02-25"
    },
    {
      id: 2,
      source: "News",
      sentiment: "Positive",
      text: "Some studies suggest capital punishment reduces crime.",
      date: "2026-02-24"
    },
    {
      id: 3,
      source: "Twitter",
      sentiment: "Neutral",
      text: "Some studies suggest capital punishment reduces crime.",
      date: "2026-02-24"
    }
  ];

  return (
    <div className="bg-gray-800 rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Query Results</h2>

      {data.map(item => (
        <div key={item.id} className="border-b py-4">

          <p className="text-white">{item.text}</p>
          
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">
              Source: {item.source}
            </span>

            <p className="text-xs text-gray-400 mt-1">
              {item.date}
            </p>

            <span
              className={`px-3 py-1 text-sm rounded-full
                ${item.sentiment === "Positive" && "bg-green-800 text-white"}
                ${item.sentiment === "Neutral" && "bg-yellow-800 text-white"}
                ${item.sentiment === "Negative" && "bg-red-800 text-white"}
              `}
            >
              {item.sentiment}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}