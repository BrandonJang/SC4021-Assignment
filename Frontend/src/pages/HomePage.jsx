import { useState } from "react";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ResultsSummary from "../components/ResultsSummary";
import ResultsList from "../components/ResultsList";

export default function HomePage() {  

  const [results, setResults] = useState([]);
  const [wordCloud, setWordCloud] = useState({});
  const [resultStats, setResultStats] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });

  const [lastQuery, setLastQuery] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const categories = ["All Categories", "Economics", "Ethics", "Religion", "Social Justice", "Politics", "General/Agreed"];

   const handleSearch = async (query, forceCategory) => {
    
    const catToUse = forceCategory || activeCategory;
    setLastQuery(query);
    setActiveCategory(catToUse);

    const fullPayload = { ...query, category: catToUse };
    const searchParams = new URLSearchParams(fullPayload).toString();
    const res = await fetch(`http://localhost:8081/api/search?${searchParams}`);

    const data = await res.json();

    const resultsArr = data.results || [];
    setResults(resultsArr);
    setWordCloud(data.wordCloud || {});

    const stats = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    resultsArr.forEach(doc => {
      let s = Array.isArray(doc.sentiment) ? doc.sentiment[0] : doc.sentiment;
      s = s?.toLowerCase();
      if (stats[s] !== undefined) stats[s]++;
    });

    setResultStats(stats);
  };

  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <SearchBar onSearch={(q) => handleSearch(q, activeCategory)} />
        <ResultsSummary stats={results} wordCloud={wordCloud} />
        
        {lastQuery !== null && (
          <div className="flex flex-wrap gap-3 mt-2 mb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleSearch(lastQuery, cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-md transform scale-105"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <ResultsList results={results} />
      </div>
    </div>
  );
}