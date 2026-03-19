export default function Header({ indexCount }) {
  return (
    <header className="text-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 gap-4 flex flex-col items-center justify-between">
        <h1 className="text-2xl font-bold">
          Death Penalty Sentiment Analysis
        </h1>
        <p className="bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-md font-semibold mb-2">Total Indexed Comments</h2>
          <h1 className="list-disc list-inside text-sm text-white">
            {indexCount}
          </h1>

        </p>
      </div>
    </header>
  );
}