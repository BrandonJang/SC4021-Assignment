import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import SentimentSummary from "../components/SentimentSummary";
import ResultsList from "../components/ResultsList";

export default function HomePage() {
  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <SearchBar />
        <Filters />
        <SentimentSummary />
        <ResultsList />
      </div>
    </div>
  );
}