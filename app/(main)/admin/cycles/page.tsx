'use client';

import { useEffect, useState } from 'react';

interface Cycle { id: string; name: string; startDate: string; endDate: string; }

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cycles')
      .then(r => r.json())
      .then(d => setCycles(d.data || []));
  }, []);

  async function createCycle() {
    if (!name || !startDate || !endDate) return;
    setLoading(true);
    const res = await fetch('/api/admin/cycles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, startDate, endDate }),
    });
    if (res.ok) {
      const data = await res.json();
      setCycles(prev => [data.data, ...prev]);
      setName('');
      setStartDate('');
      setEndDate('');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">사이클 관리</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-700">새 사이클 만들기</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="예: 2026년 2분기"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <div className="flex gap-2">
          <input
            type="date" value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <input
            type="date" value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={createCycle}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '생성 중...' : '사이클 생성'}
        </button>
      </div>

      <div className="space-y-2">
        {cycles.map(c => (
          <div key={c.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm flex justify-between">
            <span className="font-medium text-gray-900">{c.name}</span>
            <span className="text-gray-400">
              {new Date(c.startDate).toLocaleDateString('ko-KR')} ~ {new Date(c.endDate).toLocaleDateString('ko-KR')}
            </span>
          </div>
        ))}
        {cycles.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">사이클이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
