'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, Card, Button, Modal, FormInput } from '@/app/components/ui';

interface Goal {
  id: string;
  title: string;
  status: string;
  owner: { name: string };
  level: string;
  weight?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  sharedWith?: string[];
}


export default function GoalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [owner, setOwner] = useState('');
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setOwner(parsedUser.name);
    }
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      const url = currentUser ? `/api/goals?user=${encodeURIComponent(currentUser.name)}` : '/api/goals';
      const res = await fetch(url);
      let apiGoals: Goal[] = [];

      if (res.ok) {
        const data = await res.json();
        apiGoals = (data.data || []).map((goal: Goal) => {
          // 진행률이 100%면 자동으로 완료 상태로 변경
          if ((goal.progress ?? 0) === 100 && goal.status !== 'COMPLETED') {
            return { ...goal, status: 'COMPLETED' };
          }
          return goal;
        });
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

      setGoals(uniqueGoals);
    } catch (err) {
      console.error('목표 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGoal() {
    if (!title.trim() || !startDate || !endDate) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert('종료일이 시작일보다 나중이어야 합니다');
      return;
    }

    const goalData: Goal = {
      id: editingGoalId || Date.now().toString(),
      title,
      description,
      startDate,
      endDate,
      status: editingGoalId ? goals.find(g => g.id === editingGoalId)?.status || 'PENDING' : 'PENDING',
      owner: { name: owner },
      level: 'INDIVIDUAL',
      progress: editingGoalId ? goals.find(g => g.id === editingGoalId)?.progress || 0 : 0,
      sharedWith,
    };

    try {
      await fetch('/api/goals', {
        method: editingGoalId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
    } catch (err) {
      console.error('목표 저장 실패:', err);
    }

    let updatedGoals: Goal[];
    if (editingGoalId) {
      updatedGoals = goals.map(g => g.id === editingGoalId ? goalData : g);
    } else {
      updatedGoals = [goalData, ...goals];
    }

    setGoals(updatedGoals);
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setOwner(user?.name || '');
    setSharedWith([]);
    setEditingGoalId(null);
    setShowModal(false);
  }

  // userMembers에서 부서별 필터링
  const userMembersStr = localStorage.getItem('userMembers');
  const userMembers = userMembersStr ? JSON.parse(userMembersStr) : [];

  const departmentMembers = user?.org
    ? userMembers.filter((m: any) => m.dept === user.org)
    : userMembers;

  const filteredMembers = owner.trim()
    ? departmentMembers.filter((m: any) =>
        m.name.toLowerCase().includes(owner.toLowerCase())
      )
    : [];

  const handleEditGoal = (goal: Goal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setStartDate(goal.startDate || '');
    setEndDate(goal.endDate || '');
    setOwner(goal.owner.name);
    setSharedWith(goal.sharedWith || []);
    setShowModal(true);
  };

  const handleDeleteGoal = (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 목표를 삭제하시겠습니까?')) {
      const updatedGoals = goals.filter(g => g.id !== goalId);
      setGoals(updatedGoals);
      localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
    }
  };

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
            <Card
              key={goal.id}
              hoverable
              onClick={() => router.push(`/goals/${goal.id}`)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <StatusBadge status={goal.status} />
                    <span className="text-xs text-gray-500">담당: {goal.owner.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{goal.progress || 0}%</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => handleEditGoal(goal, e)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    수정
                  </button>
                  <button
                    onClick={(e) => handleDeleteGoal(goal.id, e)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGoalId(null);
        }}
        title={editingGoalId ? '목표 수정' : '새 목표 만들기'}
        onConfirm={handleCreateGoal}
        confirmText={editingGoalId ? '수정하기' : '만들기'}
      >
        <div className="space-y-4">
          <FormInput
            label="목표명"
            value={title}
            onChange={setTitle}
            placeholder="목표명을 입력하세요"
            required
          />

          <FormInput
            label="설명"
            value={description}
            onChange={setDescription}
            type="textarea"
            placeholder="목표에 대한 설명을 입력하세요"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="시작일"
              value={startDate}
              onChange={setStartDate}
              type="date"
              required
            />
            <FormInput
              label="종료일"
              value={endDate}
              onChange={setEndDate}
              type="date"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => {
                setOwner(e.target.value);
                setShowOwnerSuggestions(e.target.value.trim().length > 0);
              }}
              onFocus={() => owner.trim().length > 0 && setShowOwnerSuggestions(true)}
              placeholder="담당자명을 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
            />

            {showOwnerSuggestions && filteredMembers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setOwner(member.name);
                      setShowOwnerSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 text-sm text-gray-900 font-medium"
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">리뷰어 (선택)</label>
            <div className="space-y-2">
              {departmentMembers.map(member => (
                <label key={member.id} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharedWith.includes(member.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSharedWith([...sharedWith, member.name]);
                      } else {
                        setSharedWith(sharedWith.filter(m => m !== member.name));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">{member.name}</span>
                </label>
              ))}
            </div>
            {sharedWith.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {sharedWith.map(name => (
                  <span key={name} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {name}
                    <button
                      type="button"
                      onClick={() => setSharedWith(sharedWith.filter(m => m !== name))}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
