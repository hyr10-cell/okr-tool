'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/components/ui';
import { formatDateTimeKo } from '@/app/lib/dateUtils';

interface Goal {
  id: string;
  title: string;
  status: string;
}

interface Activity {
  id: string;
  type: 'goal_status' | 'checkin' | 'feedback';
  title: string;
  description: string;
  timestamp: string;
  goalId?: string;
  feedbackId?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    onTrack: 0,
    offTrack: 0,
    completed: 0,
    pending: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      const url = currentUser ? `/api/goals?user=${encodeURIComponent(currentUser.name)}` : '/api/goals';
      const res = await fetch(url);
      let apiGoals: Goal[] = [];

      if (res.ok) {
        const data = await res.json();
        apiGoals = data.data || [];
      }

      // localStorage에서 사용자가 만든 목표 로드
      const userGoalsStr = localStorage.getItem('userGoals');
      const userGoals = userGoalsStr ? JSON.parse(userGoalsStr) : [];

      // API 목표와 사용자 목표 병합 (사용자 목표가 우선)
      const allGoals = [...userGoals, ...apiGoals];

      // 중복 제거 (같은 id는 userGoals 버전 사용)
      const uniqueGoals = Array.from(
        new Map(allGoals.map(goal => [goal.id, goal])).values()
      );

      // 담당자이거나 리뷰어인 목표만 필터링
      const myGoals = uniqueGoals.filter((g: Goal) =>
        g.owner?.name === currentUser?.name || g.sharedWith?.includes(currentUser?.name)
      );

      const newStats = {
        total: myGoals.length,
        onTrack: myGoals.filter((g: Goal) => g.status === 'ON_TRACK').length,
        offTrack: myGoals.filter((g: Goal) => g.status === 'OFF_TRACK').length,
        completed: myGoals.filter((g: Goal) => g.status === 'COMPLETED').length,
        pending: myGoals.filter((g: Goal) => g.status === 'PENDING').length,
      };
      setStats(newStats);
    } catch (err) {
      console.error('대시보드 데이터 로드 실패:', err);
      // Demo data
      setStats({
        total: 8,
        onTrack: 3,
        offTrack: 2,
        completed: 3,
        pending: 0,
      });
    }

    try {
      const res = await fetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.data || []);
      }
    } catch (err) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'goal_status':
        return '🎯';
      case 'checkin':
        return '✅';
      case 'feedback':
        return '💬';
      default:
        return '📌';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'goal_status':
        return 'border-l-indigo-500 bg-indigo-50';
      case 'checkin':
        return 'border-l-green-500 bg-green-50';
      case 'feedback':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return <div className="text-center py-12">로드 중...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">나의 성장 대시보드</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">총 목표</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">순항</p>
            <p className="text-3xl font-bold text-green-600">{stats.onTrack}</p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">난항</p>
            <p className="text-3xl font-bold text-red-600">{stats.offTrack}</p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">완료</p>
            <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">대기</p>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>

          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">아직 활동이 없습니다.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  onClick={() => {
                    if (activity.goalId) {
                      router.push(`/goals/${activity.goalId}`);
                    } else if (activity.feedbackId) {
                      router.push(`/feedback/${activity.feedbackId}`);
                    }
                  }}
                  className={`border-l-4 rounded-r p-4 ${getActivityColor(activity.type)} cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDateTimeKo(activity.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
