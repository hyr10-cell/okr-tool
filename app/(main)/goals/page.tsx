'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, Card, Button, Modal, FormInput } from '@/app/components/ui';
import { WeightModal } from '@/app/components/goals/WeightModal';

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
}

const DEMO_MEMBERS = [
  { id: '1', name: '나' },
  { id: '2', name: '김팀장' },
  { id: '3', name: '이백엔드' },
  { id: '4', name: '박프론트' },
  { id: '5', name: '정데이터' },
];

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [owner, setOwner] = useState('나');
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!title.trim() || !startDate || !endDate) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert('종료일이 시작일보다 나중이어야 합니다');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      description,
      startDate,
      endDate,
      status: 'PENDING',
      owner: { name: owner },
      level: 'INDIVIDUAL',
    };
    setGoals([newGoal, ...goals]);
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setOwner('나');
    setShowModal(false);
  }

  const filteredMembers = owner.trim()
    ? DEMO_MEMBERS.filter(m =>
        m.name.toLowerCase().includes(owner.toLowerCase())
      )
    : [];

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
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowWeightModal(true)}>
            ⚖️ 가중치 설정
          </Button>
          <Button onClick={() => setShowModal(true)}>+ 새 목표</Button>
        </div>
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
        </div>
      </Modal>

      {/* Weight Management Modal */}
      <WeightModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        goals={goals}
        onSubmit={(weights) => {
          setGoals(goals.map(g => ({
            ...g,
            weight: weights[g.id] || g.weight || 0,
          })));
        }}
      />
    </div>
  );
}
