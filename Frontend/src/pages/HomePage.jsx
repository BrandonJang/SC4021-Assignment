import { useState, useEffect, useRef } from "react";


import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ResultsSummary from "../components/ResultsSummary";
import ResultsList from "../components/ResultsList";

export default function HomePage() {
  const [results, setResults] = useState([]);
  const [queryTime, setQueryTime] = useState(0);
  const [totalRenderTime, setTotalRenderTime] = useState(0);
  const renderStartRef = useRef(null);
  const renderCountRef = useRef(0);
  const [indexCount, setIndexCount] = useState(0);

  useEffect(() => {
    const fetchIndexCount = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/indexCount");
        const count = await res.json();
        setIndexCount(count);
      } catch (error) {
        console.error("Error fetching index count:", error);
      }
    };

    fetchIndexCount();
  }, []);


  const handleSearch = async (query) => {
    const searchParams = new URLSearchParams(query).toString();
    const res = await fetch(`http://localhost:8081/api/search?${searchParams}`);
    const data = await res.json();
    const resultsArr = data.results || [];
    setResults(resultsArr);
    setQueryTime(data.QTime);

    renderStartRef.current = performance.now();
    renderCountRef.current = 0;
  };

  const handleChildRendered = () => {
    renderCountRef.current += 1;
    if (renderCountRef.current === 2 && renderStartRef.current) {
      setTotalRenderTime(performance.now() - renderStartRef.current);
    }
  };

  return (
    <div>
      <Header indexCount={indexCount} />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <SearchBar onSearch={handleSearch} />
        <ResultsSummary stats={results} onRenderComplete={handleChildRendered} />
        <div className="text-center text-white mt-2">Total Render Time: {(totalRenderTime / 1000).toFixed(2)}s</div>
        <ResultsList results={results} qtime={queryTime} onRenderComplete={handleChildRendered} />
      </div>
    </div>
  );
}