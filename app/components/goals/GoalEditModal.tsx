'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, FormInput } from '@/app/components/ui';

interface GoalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    owner?: { name: string };
    level?: string;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export function GoalEditModal({ isOpen, onClose, goal, onSubmit }: GoalEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setStartDate(goal.startDate || '');
      setEndDate(goal.endDate || '');
    }
  }, [goal, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('목표명을 입력해주세요');
      return;
    }
    if (!startDate || !endDate) {
      alert('기간을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      onSubmit({
        title: title.trim(),
        description,
        startDate,
        endDate,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal ? '목표 수정' : '새 목표 만들기'}
      showFooter={false}
      size="lg"
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
          label="상세 설명"
          value={description}
          onChange={setDescription}
          type="textarea"
          placeholder="목표에 대한 상세 설명을 입력하세요"
          rows={4}
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

        {goal && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>레벨:</strong> {goal.level || '개인'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>담당자:</strong> {goal.owner?.name || '미지정'}
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button onClick={onClose} variant="secondary" disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
