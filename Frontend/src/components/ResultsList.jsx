export default function ResultsList({ results }) {
  console.log("Rendering ResultsList with results:", results);
  return (
    <div className="bg-gray-800 rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Query Results</h2>
      {results.length === 0 ? (
        <p className="text-gray-400">No results found.</p>
      ) : (
        results.map((item, idx) => {

          const getYouTubeId = (url) => {
            if (!url) return null;
            const match = url.match(/(?:v=|youtu.be\/|embed\/|shorts\/)([\w-]{11})/);
            return match ? match[1] : null;
          };
          const videoUrl = Array.isArray(item.video_link) ? item.video_link[0] : item.video_link;
          const videoId = getYouTubeId(videoUrl);
          const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : null;

          return (
            <div key={item.id || idx} className="border-b py-4">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-white text-lg font-bold mb-1">
                    {Array.isArray(item.comment) ? item.comment[0] : item.comment}
                  </h3>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {Array.isArray(item.published_at)
                        ? new Date(item.published_at[0]).toLocaleDateString()
                        : new Date(item.published_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Array.isArray(item.likes) ? `Likes: ${item.likes[0]}` : `Likes: ${item.likes}`}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm rounded-full
                        ${(Array.isArray(item.sentiment) ? item.sentiment[0] : item.sentiment) === "positive" && "bg-green-800 text-white"}
                        ${(Array.isArray(item.sentiment) ? item.sentiment[0] : item.sentiment) === "neutral" && "bg-yellow-800 text-white"}
                        ${(Array.isArray(item.sentiment) ? item.sentiment[0] : item.sentiment) === "negative" && "bg-red-800 text-white"}
                      `}
                    >
                      {(() => {
                        const s = Array.isArray(item.sentiment) ? item.sentiment[0] : item.sentiment;
                        if (!s) return "Unknown";
                        return s.charAt(0).toUpperCase() + s.slice(1);
                      })()}
                    </span>
                  </div>
                </div>

                {videoId && (
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-32 h-24 rounded shadow"
                    />
                  </a>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}