import React from "react";

export default function WordCloud({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No word cloud data available
      </div>
    );
  }

  const entries = Object.entries(data);
  const maxFreq = Math.max(...entries.map(([, freq]) => freq));
  
  // Color palette for words
  const colors = [
    "text-blue-400", "text-green-400", "text-purple-400", 
    "text-indigo-400", "text-pink-400", "text-yellow-400",
    "text-cyan-400", "text-orange-400"
  ];

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 p-4 h-full overflow-y-auto">
      {entries.map(([word, freq], index) => {
        // Calculate font size relative to max frequency
        // Range: 0.75rem (text-sm) to 3rem (text-5xl)
        const sizeClass = freq > maxFreq * 0.8 ? "text-4xl font-bold" :
                         freq > maxFreq * 0.6 ? "text-3xl font-semibold" :
                         freq > maxFreq * 0.4 ? "text-2xl font-medium" :
                         freq > maxFreq * 0.2 ? "text-xl" : "text-base";
        
        const colorClass = colors[index % colors.length];

        return (
          <span 
            key={word} 
            className={`${sizeClass} ${colorClass} hover:scale-110 transition-transform cursor-default px-2`}
            title={`Frequency: ${freq}`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
