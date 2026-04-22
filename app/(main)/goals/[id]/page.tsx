'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateTimeKo } from '@/app/lib/dateUtils';

interface CheckIn {
  id: string;
  progress: number;
  status: string;
  note?: string;
  createdAt: string;
  comments: { id: string; content: string; author: { name: string }; createdAt: string }[];
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  level: string;
  owner: { name: string };
  sharedWith?: string[];
  cycle?: { name: string };
  checkIns: CheckIn[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기', ON_TRACK: '순항', OFF_TRACK: '난항', COMPLETED: '완료',
};

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState<any>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [activeCheckinId, setActiveCheckinId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchGoal();
  }, []);

  async function fetchGoal() {
    try {
      // localStorage에서 먼저 찾기
      const userGoalsStr = localStorage.getItem('userGoals');
      if (userGoalsStr) {
        const userGoals = JSON.parse(userGoalsStr);
        const userGoal = userGoals.find((g: any) => g.id === resolvedParams.id);
        if (userGoal) {
          setGoal(userGoal);
          setLoading(false);
          return;
        }
      }

      // API에서 찾기
      const res = await fetch(`/api/goals/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        let goal = data.data;

        // 진행률이 100%면 자동으로 완료 상태로 변경
        const latestProgress = goal.checkIns[0]?.progress ?? 0;
        if (latestProgress === 100 && goal.status !== 'COMPLETED') {
          goal = { ...goal, status: 'COMPLETED' };
        }

        setGoal(goal);
      }
    } catch (err) {
      console.error('목표 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function submitComment(checkinId: string) {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      content: comment,
      author: { name: user?.name || '익명' },
      createdAt: new Date().toISOString(),
    };

    try {
      // localStorage에 코멘트 저장
      const userGoalsStr = localStorage.getItem('userGoals');
      if (userGoalsStr) {
        const userGoals = JSON.parse(userGoalsStr);
        const goalIndex = userGoals.findIndex((g: any) => g.id === resolvedParams.id);
        if (goalIndex !== -1 && userGoals[goalIndex].checkIns) {
          const checkinIndex = userGoals[goalIndex].checkIns.findIndex((c: any) => c.id === checkinId);
          if (checkinIndex !== -1) {
            if (!userGoals[goalIndex].checkIns[checkinIndex].comments) {
              userGoals[goalIndex].checkIns[checkinIndex].comments = [];
            }
            userGoals[goalIndex].checkIns[checkinIndex].comments.push(newComment);
            localStorage.setItem('userGoals', JSON.stringify(userGoals));

            // 활동 기록 저장
            const activitiesStr = localStorage.getItem('userActivities');
            const activities = activitiesStr ? JSON.parse(activitiesStr) : [];
            activities.unshift({
              id: Date.now().toString(),
              type: 'comment',
              title: goal?.title || '목표',
              description: `코멘트: ${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}`,
              timestamp: new Date().toISOString(),
              goalId: resolvedParams.id,
            });
            localStorage.setItem('userActivities', JSON.stringify(activities.slice(0, 20))); // 최근 20개만 보관
          }
        }
      }

      // API에도 요청
      await fetch(`/api/goals/${resolvedParams.id}/checkins/${checkinId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });
    } catch (err) {
      console.error('코멘트 저장 실패:', err);
    }

    setComment('');
    setActiveCheckinId(null);
    fetchGoal();
  }

  if (loading) return <div className="text-center py-12 text-gray-500">로드 중...</div>;
  if (!goal) return <div className="text-center py-12 text-gray-500">목표를 찾을 수 없습니다.</div>;

  const latestProgress = goal.checkIns?.[0]?.progress ?? 0;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← 목록으로
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">{goal.title}</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{STATUS_LABEL[goal.status]}</span>
        </div>
        {goal.description && <p className="text-gray-600 text-sm mb-4">{goal.description}</p>}

        <div className="text-xs text-gray-600 mb-4">
          <span>담당: {goal.owner.name}</span>
          {goal.sharedWith && goal.sharedWith.length > 0 && (
            <span className="ml-2">/ 리뷰어: {goal.sharedWith.join(', ')}</span>
          )}
          {goal.cycle && <span className="ml-4">사이클: {goal.cycle.name}</span>}
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>전체 진행률</span><span>{latestProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${latestProgress}%` }} />
          </div>
        </div>

        <button
          onClick={() => router.push(`/goals/${goal.id}/checkin`)}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          체크인 작성
        </button>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">체크인 히스토리</h2>
      {!goal.checkIns || goal.checkIns.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">아직 체크인이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {goal.checkIns.map((ci) => (
            <div key={ci.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">진행률 {ci.progress}%</span>
                <span className="text-gray-400 text-xs">{formatDateTimeKo(ci.createdAt)}</span>
              </div>
              {ci.note && <p className="text-sm text-gray-600 mt-1">{ci.note}</p>}

              {(ci.comments || []).length > 0 && (
                <div className="mt-3 space-y-2">
                  {ci.comments.map((c) => (
                    <div key={c.id} className="bg-indigo-50 rounded p-2 text-sm">
                      <span className="font-medium text-indigo-700">{c.author.name}</span>
                      <span className="text-gray-700 ml-2">{c.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeCheckinId === ci.id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="코멘트 입력..."
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                  />
                  <button onClick={() => submitComment(ci.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700">
                    등록
                  </button>
                  <button onClick={() => setActiveCheckinId(null)} className="text-gray-400 text-sm px-2">취소</button>
                </div>
              ) : (
                <button onClick={() => setActiveCheckinId(ci.id)} className="mt-2 text-xs text-indigo-600 hover:underline">
                  코멘트 달기
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
