'use client';

import { useEffect, useState } from 'react';
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
}

export default function DashboardPage() {
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
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        const goals = data.data || [];

        const newStats = {
          total: goals.length,
          onTrack: goals.filter((g: Goal) => g.status === 'ON_TRACK').length,
          offTrack: goals.filter((g: Goal) => g.status === 'OFF_TRACK').length,
          completed: goals.filter((g: Goal) => g.status === 'COMPLETED').length,
          pending: goals.filter((g: Goal) => g.status === 'PENDING').length,
        };
        setStats(newStats);
      }
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
      // Demo data
      setActivities([
        {
          id: '1',
          type: 'goal_status',
          title: 'API 보안 강화',
          description: '상태 변경 (순항 → 난항)',
          timestamp: '2024-03-20T14:30:00',
        },
        {
          id: '2',
          type: 'checkin',
          title: '서비스 성능 개선',
          description: '체크인 제출',
          timestamp: '2024-03-19T10:15:00',
        },
        {
          id: '3',
          type: 'feedback',
          title: '좋은 진행 방향입니다',
          description: '피드백 수신',
          timestamp: '2024-03-18T09:45:00',
        },
      ]);
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

      {/* Stats Summary - Current Progress */}
      {stats.total > 0 && (stats.onTrack > 0 || stats.offTrack > 0) && (
        <Card className="mb-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">진행 중인 목표 현황</h3>
            <div className="space-y-2">
              {(() => {
                const activeTotal = stats.onTrack + stats.offTrack;
                const onTrackPct = activeTotal > 0 ? Math.round((stats.onTrack / activeTotal) * 100) : 0;
                const offTrackPct = activeTotal > 0 ? 100 - onTrackPct : 0;
                return (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">순항</span>
                        <span className="text-sm font-medium">{onTrackPct}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${onTrackPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">난항</span>
                        <span className="text-sm font-medium">{offTrackPct}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${offTrackPct}%` }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      )}

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
                  className={`border-l-4 rounded-r p-4 ${getActivityColor(activity.type)}`}
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
