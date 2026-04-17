'use client';

export default function CyclesPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">사이클</h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 font-medium">
          + 새 사이클
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900 text-lg">2024년 Q2</h3>
          <p className="text-sm text-gray-600 mt-2">2024-04-01 ~ 2024-06-30</p>
          <p className="text-xs text-gray-500 mt-2">목표 3개</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900 text-lg">2024년 Q1</h3>
          <p className="text-sm text-gray-600 mt-2">2024-01-01 ~ 2024-03-31</p>
          <p className="text-xs text-gray-500 mt-2">목표 5개</p>
        </div>
      </div>
    </div>
  );
}
