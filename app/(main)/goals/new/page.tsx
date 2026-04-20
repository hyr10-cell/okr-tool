'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Cycle { id: string; name: string; }

export default function NewGoalPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [level, setLevel] = useState<'COMPANY' | 'TEAM' | 'INDIVIDUAL'>('INDIVIDUAL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cycles')
      .then(r => r.json())
      .then(d => {
        const data = d.data || [];
        setCycles(data);
        if (data.length > 0) setCycleId(data[0].id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !cycleId) return;
    setLoading(true);
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, cycleId, level }),
    });
    setLoading(false);
    if (res.ok) router.push('/goals');
  }

  return (
    <div className="max-w-lg">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 목록으로
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-6">새 목표 등록</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">목표명 *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="달성하고자 하는 목표를 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="목표에 대한 추가 설명"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사이클 *</label>
          <select
            value={cycleId}
            onChange={e => setCycleId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
            required
          >
            {cycles.length === 0 && <option value="">사이클 없음 (관리자에게 요청)</option>}
            {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">목표 레벨</label>
          <div className="flex gap-2">
            {(['COMPANY', 'TEAM', 'INDIVIDUAL'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  level === l
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {l === 'COMPANY' ? '전사' : l === 'TEAM' ? '팀' : '개인'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '등록 중...' : '목표 등록'}
        </button>
      </form>
    </div>
  );
}
