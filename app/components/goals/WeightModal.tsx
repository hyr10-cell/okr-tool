'use client';

import { useState, useEffect } from 'react';
import { Modal, Button } from '@/app/components/ui';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Array<{
    id: string;
    title: string;
    weight?: number;
  }>;
  onSubmit: (weights: Record<string, number>) => void;
}

export function WeightModal({ isOpen, onClose, goals, onSubmit }: WeightModalProps) {
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goals) {
      const initialWeights: Record<string, number> = {};
      goals.forEach(goal => {
        initialWeights[goal.id] = goal.weight || 0;
      });
      setWeights(initialWeights);
    }
  }, [goals, isOpen]);

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w || 0), 0);
  const remaining = 100 - totalWeight;
  const isOverWeight = totalWeight > 100;
  const isUnderWeight = totalWeight < 100;

  const handleWeightChange = (goalId: string, value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value) || 0);
    setWeights(prev => ({
      ...prev,
      [goalId]: numValue,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      onSubmit(weights);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="목표 가중치 설정"
      showFooter={false}
      size="lg"
    >
      <div className="space-y-6">
        {/* 목표 가중치 목록 */}
        <div className="space-y-4">
          {goals.map(goal => (
            <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900">{goal.title}</h4>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights[goal.id] || 0}
                  onChange={(e) => handleWeightChange(goal.id, e.target.value)}
                  className="w-20 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
                  disabled={submitting}
                />
                <span className="text-sm text-gray-600">%</span>
                {/* Progress bar */}
                <div className="flex-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${Math.min((weights[goal.id] || 0) / 100 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 합계 표시 */}
        <div className="p-4 rounded-lg border-2" style={{
          borderColor: isOverWeight ? '#ef4444' : isUnderWeight ? '#f59e0b' : '#10b981',
          backgroundColor: isOverWeight ? '#fef2f2' : isUnderWeight ? '#fffbeb' : '#f0fdf4',
        }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900">총 가중치</span>
            <span className="text-lg font-bold" style={{
              color: isOverWeight ? '#dc2626' : isUnderWeight ? '#d97706' : '#059669',
            }}>
              {totalWeight}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">남은 가중치</span>
            <span className="text-sm font-medium" style={{
              color: isOverWeight ? '#dc2626' : isUnderWeight ? '#d97706' : '#059669',
            }}>
              {remaining}%
            </span>
          </div>
          {isOverWeight && (
            <p className="text-sm text-red-600 mt-2">⚠️ 총 가중치가 100%를 초과했습니다.</p>
          )}
          {isUnderWeight && (
            <p className="text-sm text-amber-600 mt-2">ℹ️ 아직 {remaining}%의 가중치를 할당하지 않았습니다.</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button onClick={onClose} variant="secondary" disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || isOverWeight}>
            {submitting ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
