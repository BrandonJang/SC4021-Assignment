import { useState } from "react";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ResultsSummary from "../components/ResultsSummary";
import ResultsList from "../components/ResultsList";

export default function HomePage() {  

  const [results, setResults] = useState([]);
  const [resultStats, setResultStats] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });

   const handleSearch = async (query) => {

    const searchParams = new URLSearchParams(query).toString();
    const res = await fetch(`http://localhost:8081/api/search?${searchParams}`);

    const data = await res.json();

    const resultsArr = data.results || [];
    setResults(resultsArr);

    const stats = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    resultsArr.forEach(doc => {
      const s = doc.sentiment?.toLowerCase();
      if (stats[s] !== undefined) stats[s]++;
    });

    setResultStats(stats);
  };

  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <SearchBar onSearch={handleSearch} />
        <ResultsSummary stats={results} />
        <ResultsList results={results} />
      </div>
    </div>
  );
}