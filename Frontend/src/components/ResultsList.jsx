export default function ResultsList({ results }) {
  return (
    <div className="bg-gray-800 rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Query Results</h2>
      {results.length === 0 ? (
        <p className="text-gray-400">No results found.</p>
      ) : (
        results.map((item, idx) => (
          <div key={item.id || idx} className="border-b py-4">
            <h3 className="text-white text-lg font-bold mb-1">{Array.isArray(item.title) ? item.title[0] : item.title}</h3>
            <p className="text-gray-200 mb-2">{Array.isArray(item.content) ? item.content[0] : item.content}</p>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">
                Source: {item.source}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {Array.isArray(item.created_at) ? new Date(item.created_at[0]).toLocaleString() : item.created_at}
              </span>
              <span
                className={`px-3 py-1 text-sm rounded-full
                  ${item.sentiment === "positive" && "bg-green-800 text-white"}
                  ${item.sentiment === "neutral" && "bg-yellow-800 text-white"}
                  ${item.sentiment === "negative" && "bg-red-800 text-white"}
                `}
              >
                {item.sentiment?.charAt(0).toUpperCase() + item.sentiment?.slice(1)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}