'use client';

import { useEffect, useState } from 'react';

interface Goal {
  id: string;
  title: string;
  status: string;
  owner: { name: string };
  level: string;
  weight?: number;
  description?: string;
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  ON_TRACK: 'bg-green-100 text-green-800',
  OFF_TRACK: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  STOPPED: 'bg-gray-200 text-gray-600',
};

const statusLabel: Record<string, string> = {
  PENDING: '대기',
  ON_TRACK: '순항',
  OFF_TRACK: '난항',
  COMPLETED: '완료',
  STOPPED: '중단',
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data.data || []);
      }
    } catch (err) {
      console.error('목표 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateGoal() {
    if (title.trim()) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title,
        status: 'PENDING',
        owner: { name: '나' },
        level: 'INDIVIDUAL',
        description: '',
      };
      setGoals([newGoal, ...goals]);
      setTitle('');
      setShowModal(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">로드 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">목표</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 font-medium"
        >
          + 새 목표
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
          아직 목표가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[goal.status]}`}>
                      {statusLabel[goal.status]}
                    </span>
                    <span className="text-xs text-gray-500">담당: {goal.owner.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">새 목표 만들기</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목표명</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="목표명을 입력하세요"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateGoal()}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateGoal}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
