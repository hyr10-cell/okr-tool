'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Modal, FormInput } from '@/app/components/ui';

interface Feedback {
  id: string;
  from: string;
  type: 'KEEP_GOING' | 'IMPROVE';
  content: string;
  createdAt?: string;
  direction?: 'received' | 'sent';
  recipient?: string;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterDirection, setFilterDirection] = useState<'all' | 'received' | 'sent'>('received');
  const [filterType, setFilterType] = useState<'all' | 'KEEP_GOING' | 'IMPROVE'>('all');
  const [recipientName, setRecipientName] = useState('');
  const [feedbackType, setFeedbackType] = useState<'KEEP_GOING' | 'IMPROVE'>('KEEP_GOING');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks() {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.data || []);
      }
    } catch (err) {
      console.error('피드백 로드 실패:', err);
      // Demo data fallback
      setFeedbacks([
        {
          id: '1',
          from: '팀장',
          type: 'KEEP_GOING',
          content: '좋은 아이디어 잘 반영했습니다!',
          createdAt: '2024-03-15',
          direction: 'received',
        },
        {
          id: '2',
          from: '관리자',
          type: 'IMPROVE',
          content: '다음엔 더 빠른 진행이 필요합니다.',
          createdAt: '2024-03-10',
          direction: 'received',
        },
        {
          id: '3',
          from: '동료',
          type: 'KEEP_GOING',
          content: '공동 프로젝트에서 훌륭한 협업 감사합니다.',
          createdAt: '2024-03-05',
          direction: 'sent',
          recipient: '김팀원',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (!recipientName.trim() || !content.trim()) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      from: '나',
      type: feedbackType,
      content,
      createdAt: new Date().toISOString().split('T')[0],
      direction: 'sent',
      recipient: recipientName,
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    resetForm();
  }

  function resetForm() {
    setRecipientName('');
    setFeedbackType('KEEP_GOING');
    setContent('');
    setShowModal(false);
  }

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filterDirection !== 'all' && fb.direction !== filterDirection) return false;
    if (filterType !== 'all' && fb.type !== filterType) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">로드 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">피드백</h1>
        <Button onClick={() => setShowModal(true)}>+ 피드백 작성</Button>
      </div>

      {/* 필터 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">방향</label>
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value as 'all' | 'received' | 'sent')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="all">전체</option>
            <option value="received">받은 피드백</option>
            <option value="sent">보낸 피드백</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'KEEP_GOING' | 'IMPROVE')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="all">전체</option>
            <option value="KEEP_GOING">좋은 점</option>
            <option value="IMPROVE">개선점</option>
          </select>
        </div>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
          {feedbacks.length === 0 ? '아직 피드백이 없습니다.' : '조건에 맞는 피드백이 없습니다.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map(fb => (
            <Card key={fb.id} hoverable>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      fb.type === 'KEEP_GOING'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {fb.type === 'KEEP_GOING' ? '좋은 점' : '개선점'}
                    </span>
                    <span className="text-sm text-gray-600">{fb.from}</span>
                    {fb.direction === 'sent' && (
                      <span className="text-xs text-gray-500">→ {fb.recipient}</span>
                    )}
                    {fb.createdAt && (
                      <span className="text-xs text-gray-500">{fb.createdAt}</span>
                    )}
                  </div>
                  <p className="mt-3 text-gray-900 leading-relaxed">{fb.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Write Feedback Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="피드백 작성"
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4">
          <FormInput
            label="받는 사람"
            value={recipientName}
            onChange={setRecipientName}
            placeholder="피드백을 받을 사람의 이름을 입력하세요"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              유형 <span className="text-red-500">*</span>
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as 'KEEP_GOING' | 'IMPROVE')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
            >
              <option value="KEEP_GOING">좋은 점 👍</option>
              <option value="IMPROVE">개선점 💡</option>
            </select>
          </div>

          <FormInput
            label="내용"
            value={content}
            onChange={setContent}
            type="textarea"
            placeholder="구체적이고 건설적인 피드백을 작성해주세요"
            rows={4}
            required
          />

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={() => setShowModal(false)} variant="secondary">
              취소
            </Button>
            <Button onClick={handleSubmit}>
              작성하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
