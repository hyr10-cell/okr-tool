'use client';

import { useEffect, useState } from 'react';
import { StatusBadge, Card, Button, Modal, FormInput } from '@/app/components/ui';
import { GoalDetail } from '@/app/components/goals/GoalDetail';

interface Goal {
  id: string;
  title: string;
  status: string;
  owner: { name: string };
  level: string;
  weight?: number;
  description?: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

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

  const filteredGoals = goals.filter((goal) => {
    if (statusFilter && goal.status !== statusFilter) return false;
    if (levelFilter && goal.level !== levelFilter) return false;
    if (searchQuery && !goal.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">로드 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">목표</h1>
        <Button onClick={() => setShowModal(true)}>+ 새 목표</Button>
      </div>

      {/* 필터 영역 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormInput
          label="검색"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="목표 검색..."
          type="text"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">전체</option>
            <option value="PENDING">대기</option>
            <option value="ON_TRACK">순항</option>
            <option value="OFF_TRACK">난항</option>
            <option value="COMPLETED">완료</option>
            <option value="STOPPED">중단</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">전체</option>
            <option value="COMPANY">회사</option>
            <option value="TEAM">팀</option>
            <option value="INDIVIDUAL">개인</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">초기화</label>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
              setLevelFilter('');
            }}
            className="w-full"
          >
            필터 초기화
          </Button>
        </div>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
          {goals.length === 0 ? '아직 목표가 없습니다.' : '조건에 맞는 목표가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <Card key={goal.id} hoverable onClick={() => setSelectedGoalId(goal.id)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <StatusBadge status={goal.status} />
                    <span className="text-xs text-gray-500">담당: {goal.owner.name}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="새 목표 만들기" onConfirm={handleCreateGoal} confirmText="만들기">
        <FormInput
          label="목표명"
          value={title}
          onChange={setTitle}
          placeholder="목표명을 입력하세요"
          onKeyDown={(e) => e.key === 'Enter' && handleCreateGoal()}
        />
      </Modal>

      {/* Goal Detail Sidebar */}
      {selectedGoalId && (
        <GoalDetail
          goal={filteredGoals.find((g) => g.id === selectedGoalId)!}
          onClose={() => setSelectedGoalId(null)}
          onCheckIn={() => {
            console.log('Check-in clicked for goal:', selectedGoalId);
          }}
          onWriteFeedback={() => {
            console.log('Write feedback clicked for goal:', selectedGoalId);
          }}
        />
      )}
    </div>
  );
}
