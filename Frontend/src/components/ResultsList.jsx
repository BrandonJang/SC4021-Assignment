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
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Query Results</h2>

      {data.map(item => (
        <div key={item.id} className="border-b py-4">
          
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">
              Source: {item.source}
            </span>

            <span
              className={`px-3 py-1 text-sm rounded-full
                ${item.sentiment === "Positive" && "bg-green-200 text-green-800"}
                ${item.sentiment === "Neutral" && "bg-gray-200 text-gray-800"}
                ${item.sentiment === "Negative" && "bg-red-200 text-red-800"}
              `}
            >
              {item.sentiment}
            </span>
          </div>

          <p className="text-gray-800">{item.text}</p>

          <p className="text-xs text-gray-400 mt-1">
            {item.date}
          </p>

        </div>
      ))}
    </div>
  );
}