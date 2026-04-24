'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState<any>(null);
  const [goal, setGoal] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'PENDING' | 'ON_TRACK' | 'OFF_TRACK' | 'COMPLETED'>('ON_TRACK');
  const [note, setNote] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchGoal();
  }, []);

  async function fetchGoal() {
    try {
      const userGoalsStr = localStorage.getItem('userGoals');
      if (userGoalsStr) {
        const userGoals = JSON.parse(userGoalsStr);
        const userGoal = userGoals.find((g: any) => g.id === resolvedParams.id);
        if (userGoal) {
          setGoal(userGoal);
          setPageLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/goals/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setGoal(data.data);
      }
    } catch (error) {
      console.error('목표 조회 실패:', error);
    } finally {
      setPageLoading(false);
    }
  }

  const getAutoStatus = (prog: number) => {
    if (prog === 0) return 'PENDING';
    if (prog === 100) return 'COMPLETED';
    return null;
  };

  const autoStatus = getAutoStatus(progress);
  const needsManualStatus = progress > 0 && progress < 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const newCheckIn = {
      id: Date.now().toString(),
      progress,
      status,
      note,
      createdAt: new Date().toISOString(),
      comments: [],
      attachmentCount: attachments.length,
      attachmentNames: attachments.map(f => f.name),
    };

    try {
      // localStorage에 체크인 저장
      const userGoalsStr = localStorage.getItem('userGoals');
      if (userGoalsStr) {
        const userGoals = JSON.parse(userGoalsStr);
        const goalIndex = userGoals.findIndex((g: any) => g.id === resolvedParams.id);
        if (goalIndex !== -1) {
          if (!userGoals[goalIndex].checkIns) {
            userGoals[goalIndex].checkIns = [];
          }
          userGoals[goalIndex].checkIns.unshift(newCheckIn);
          userGoals[goalIndex].progress = progress;
          userGoals[goalIndex].status = status;
          localStorage.setItem('userGoals', JSON.stringify(userGoals));
        }
      }

      // API에도 요청 (goal 정보 함께 전송)
      await fetch(`/api/goals/${resolvedParams.id}/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress,
          status,
          note,
          attachmentCount: attachments.length,
          attachmentNames: attachments.map(f => f.name),
          goal, // goal 정보 함께 전송
        }),
      });

      // 활동 기록 저장
      const activitiesStr = localStorage.getItem('userActivities');
      const activities = activitiesStr ? JSON.parse(activitiesStr) : [];
      activities.unshift({
        id: Date.now().toString(),
        type: 'checkin',
        title: goal?.title || '목표',
        description: `체크인: ${progress}% (${status === 'ON_TRACK' ? '순항' : status === 'OFF_TRACK' ? '난항' : '완료'})`,
        timestamp: new Date().toISOString(),
        goalId: resolvedParams.id,
      });
      localStorage.setItem('userActivities', JSON.stringify(activities.slice(0, 20)));
    } catch (error) {
      console.error('체크인 저장 실패:', error);
    } finally {
      setLoading(false);
      router.push(`/goals/${resolvedParams.id}`);
    }
  }

  if (pageLoading) {
    return <div className="text-center py-12 text-gray-500">로드 중...</div>;
  }

  if (!goal) {
    return <div className="text-center py-12 text-gray-500">목표를 찾을 수 없습니다.</div>;
  }

  const isOwner = user?.name === goal.owner?.name;

  return (
    <div className="max-w-lg">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 목표로 돌아가기
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-6">체크인 작성</h1>
      {!isOwner && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">담당자만 체크인을 작성할 수 있습니다.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">진행률 ({progress}%)</label>
          <input
            type="range" min={0} max={100} value={progress}
            onChange={(e) => {
              const newProgress = Number(e.target.value);
              setProgress(newProgress);
              const auto = getAutoStatus(newProgress);
              if (auto) {
                setStatus(auto as 'PENDING' | 'ON_TRACK' | 'OFF_TRACK' | 'COMPLETED');
              }
            }}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
          {autoStatus && (
            <p className="text-xs text-indigo-600 mt-2">
              진행률에 따라 상태가 자동으로 설정됩니다: {
                autoStatus === 'PENDING' ? '대기' : '완료'
              }
            </p>
          )}
        </div>

        {needsManualStatus && (
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
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이번 기간 활동 (선택)</label>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="이번 기간에 한 일을 간략히 적어주세요"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">파일 첨부 (선택)</label>
          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setAttachments(Array.from(e.target.files));
              }
            }}
            className="w-full"
          />
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-medium text-gray-600">첨부된 파일:</p>
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:text-red-700"
                  >
                    제거
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit" disabled={loading || !isOwner}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '제출 중...' : '체크인 제출'}
        </button>
      </form>
    </div>
  );
}
