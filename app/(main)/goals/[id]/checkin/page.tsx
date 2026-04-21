'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'ON_TRACK' | 'OFF_TRACK'>('ON_TRACK');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/goals/${resolvedParams.id}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, status, note }),
    });
    setLoading(false);
    if (res.ok) router.push(`/goals/${resolvedParams.id}`);
  }

  return (
    <div className="max-w-lg">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 목표로 돌아가기
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-6">체크인 작성</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">진행률 ({progress}%)</label>
          <input
            type="range" min={0} max={100} value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">현재 상태</label>
          <div className="flex gap-3">
            {(['ON_TRACK', 'OFF_TRACK'] as const).map((s) => (
              <button
                key={s} type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  status === s
                    ? s === 'ON_TRACK' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {s === 'ON_TRACK' ? '✅ 순항' : '⚠️ 난항'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이번 기간 활동 (선택)</label>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="이번 기간에 한 일을 간략히 적어주세요"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '제출 중...' : '체크인 제출'}
        </button>
      </form>
    </div>
  );
}
