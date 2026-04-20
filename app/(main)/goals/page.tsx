'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Goal {
  id: string;
  title: string;
  status: string;
  owner: { name: string };
  level: string;
  checkIns: { progress: number; status: string }[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기', ON_TRACK: '순항', OFF_TRACK: '난항', COMPLETED: '완료', STOPPED: '중단',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  ON_TRACK: 'bg-green-100 text-green-700',
  OFF_TRACK: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  STOPPED: 'bg-gray-200 text-gray-500',
};

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchGoals(); }, []);

  async function fetchGoals() {
    const res = await fetch('/api/goals');
    if (res.ok) {
      const data = await res.json();
      setGoals(data.data || []);
    }
    setLoading(false);
  }

  const filtered = filter === 'ALL' ? goals : goals.filter(g => g.status === filter);

  if (loading) return <div className="text-center py-12 text-gray-500">로드 중...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">나의 목표</h1>
        <button
          onClick={() => router.push('/goals/new')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + 새 목표
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['ALL', 'ON_TRACK', 'OFF_TRACK', 'PENDING', 'COMPLETED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              filter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {s === 'ALL' ? '전체' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          목표가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((goal) => {
            const progress = goal.checkIns[0]?.progress ?? 0;
            return (
              <div
                key={goal.id}
                onClick={() => router.push(`/goals/${goal.id}`)}
                className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[goal.status]}`}>
                    {STATUS_LABEL[goal.status]}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>진행률</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${goal.status === 'OFF_TRACK' ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
