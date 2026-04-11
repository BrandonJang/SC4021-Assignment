export default function Header({ indexCount }) {
  return (
    <header className="text-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 gap-4 flex flex-col items-center justify-between">
        <h1 className="text-2xl font-bold">
          Death Penalty Sentiment Analysis
        </h1>
        <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
          <h2 className="text-md font-semibold mb-2">Total Indexed Comments</h2>
          <span className="text-3xl font-bold text-white">
            {indexCount}
          </span>
        </div>
      </div>
    </header>
  );
}