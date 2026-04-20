'use client';

import { useState } from 'react';
import { Modal, Button, FormInput } from '@/app/components/ui';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  hasMetric: boolean;
  metricName?: string;
  metricCurrent?: number;
  onSubmit: (data: {
    status: string;
    metricValue?: number;
    comment: string;
  }) => void;
}

export function CheckInModal({
  isOpen,
  onClose,
  goalTitle,
  hasMetric,
  metricName,
  metricCurrent,
  onSubmit,
}: CheckInModalProps) {
  const [status, setStatus] = useState('on_track');
  const [metricValue, setMetricValue] = useState<string>(metricCurrent?.toString() || '');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      onSubmit({
        status,
        metricValue: hasMetric && metricValue ? parseFloat(metricValue) : undefined,
        comment,
      });
      // Reset form
      setStatus('on_track');
      setMetricValue('');
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="체크인하기"
      showFooter={false}
      size="lg"
    >
      <div className="space-y-6">
        {/* 목표 요약 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>{goalTitle}</strong>
          </p>
        </div>

        {/* 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상태 <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="pending">대기</option>
            <option value="on_track">순항</option>
            <option value="off_track">난항</option>
            <option value="completed">완료</option>
            <option value="stopped">중단</option>
          </select>
        </div>

        {/* 정량지표 */}
        {hasMetric && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {metricName || '현재값'}
            </label>
            <input
              type="number"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              placeholder="숫자를 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* 코멘트 */}
        <FormInput
          label="코멘트"
          value={comment}
          onChange={setComment}
          type="textarea"
          placeholder="아무리 작은 일, 고민거리라도 기록해 주세요"
          rows={4}
        />

        {/* 버튼 */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button onClick={onClose} variant="secondary" disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '제출 중...' : '제출하기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
