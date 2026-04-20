'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RevieweeGoal {
  id: string;
  title: string;
  status: string;
  checkIns: { progress: number }[];
}

interface Reviewee {
  id: string;
  name: string;
  goals: RevieweeGoal[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  ON_TRACK: 'bg-green-100 text-green-700',
  OFF_TRACK: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기', ON_TRACK: '순항', OFF_TRACK: '난항', COMPLETED: '완료',
};

export default function DashboardPage() {
  const router = useRouter();
  const [reviewees, setReviewees] = useState<Reviewee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setReviewees(d.data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">로드 중...</div>;

  const offTrackCount = reviewees.flatMap(r => r.goals).filter(g => g.status === 'OFF_TRACK').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">리뷰어 대시보드</h1>
      {offTrackCount > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          ⚠️ 난항 목표 {offTrackCount}건이 있습니다. 확인이 필요합니다.
        </div>
      )}

      {reviewees.length === 0 ? (
        <div className="text-center py-12 text-gray-400">담당자가 없습니다.</div>
      ) : (
        <div className="space-y-6">
          {reviewees.map((reviewee) => (
            <div key={reviewee.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">{reviewee.name}</h2>

              {reviewee.goals.length === 0 ? (
                <p className="text-sm text-gray-400">목표 없음</p>
              ) : (
                <div className="space-y-3">
                  {reviewee.goals
                    .sort((a, b) => (a.status === 'OFF_TRACK' ? -1 : 1))
                    .map((goal) => {
                      const progress = goal.checkIns[0]?.progress ?? 0;
                      return (
                        <div
                          key={goal.id}
                          onClick={() => router.push(`/goals/${goal.id}`)}
                          className={`rounded-lg p-3 cursor-pointer transition hover:opacity-80 ${
                            goal.status === 'OFF_TRACK' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-800">{goal.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[goal.status]}`}>
                              {STATUS_LABEL[goal.status]}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${goal.status === 'OFF_TRACK' ? 'bg-red-500' : 'bg-indigo-500'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-right text-xs text-gray-400 mt-1">{progress}%</div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
