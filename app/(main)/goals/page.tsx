'use client';

import { useEffect, useState } from 'react';
import { StatusBadge, Card, Button, Modal, FormInput } from '@/app/components/ui';

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
        <Button onClick={() => setShowModal(true)}>+ 새 목표</Button>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
          아직 목표가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <Card key={goal.id} hoverable>
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
    </div>
  );
}
