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

  // Calculate Normalized Discounted Cumulative Gain (NDCG) using 'likes' as proxy relevance
  const calculateNDCG = (res) => {
    if (!res || res.length <= 1) return 0;
    
    // Extract numerical likes safely
    const getLikes = (item) => Array.isArray(item.likes) ? Number(item.likes[0]) || 0 : Number(item.likes) || 0;
    
    // 1. Calculate actual DCG of the returned ranking
    let dcg = 0;
    res.forEach((item, index) => {
      dcg += getLikes(item) / Math.log2(index + 2); // rank starts at 1, so index + 2
    });

    // 2. Calculate Ideal DCG (IDCG) by perfectly sorting by likes
    const idealRes = [...res].sort((a, b) => getLikes(b) - getLikes(a));
    let idcg = 0;
    idealRes.forEach((item, index) => {
      idcg += getLikes(item) / Math.log2(index + 2);
    });

    if (idcg === 0) return 0; // Handle division by zero
    return (dcg / idcg).toFixed(4);
  };

  const ndcgScore = calculateNDCG(results);

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2 mb-2">
            <div className="flex flex-wrap gap-2">
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

            {results.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg flex items-center gap-3 shadow-md shrink-0">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Ranking Quality</span>
                  <span className="text-gray-300 text-sm font-semibold">NDCG Metric</span>
                </div>
                <span className={`text-2xl font-black ml-2 ${
                  ndcgScore >= 0.9 ? 'text-green-500' : ndcgScore >= 0.7 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {ndcgScore}
                </span>
              </div>
            )}
          </div>
        )}

        <ResultsList results={results} />
      </div>
    </div>
  );
}