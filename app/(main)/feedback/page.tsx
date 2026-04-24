'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Modal, FormInput } from '@/app/components/ui';
import { formatDateKo } from '@/app/lib/dateUtils';

interface Feedback {
  id: string;
  from: string;
  fromEmail?: string;
  type: 'KEEP_GOING' | 'IMPROVE';
  content: string;
  createdAt?: string;
  direction?: 'received' | 'sent';
  recipient?: string;
  recipientEmail?: string;
}

interface Member {
  id: string;
  name: string;
  role?: string;
}

export default function FeedbackPage() {
  const [user, setUser] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterDirection, setFilterDirection] = useState<'all' | 'received' | 'sent'>('all');
  const [filterType, setFilterType] = useState<'all' | 'KEEP_GOING' | 'IMPROVE'>('all');
  const [recipientName, setRecipientName] = useState('');
  const [feedbackType, setFeedbackType] = useState<'KEEP_GOING' | 'IMPROVE'>('KEEP_GOING');
  const [content, setContent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks() {
    try {
      const res = await fetch('/api/feedback');
      let apiFeedbacks: Feedback[] = [];
      if (res.ok) {
        const data = await res.json();
        apiFeedbacks = data.data || [];
      }

      // localStorage에서 사용자가 만든 피드백 로드
      const userFeedbacksStr = localStorage.getItem('userFeedbacks');
      const userFeedbacks = userFeedbacksStr ? JSON.parse(userFeedbacksStr) : [];

      // API 피드백과 사용자 피드백 병합 (사용자 피드백이 우선)
      const allFeedbacks = [...userFeedbacks, ...apiFeedbacks];

      // 중복 제거 (같은 id는 userFeedbacks 버전 사용)
      const uniqueFeedbacks = Array.from(
        new Map(allFeedbacks.map(fb => [fb.id, fb])).values()
      );

      setFeedbacks(uniqueFeedbacks);
    } catch (err) {
      console.error('피드백 로드 실패:', err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (!recipientName.trim() || !content.trim()) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    // 수신자의 이메일 찾기
    const recipientMember = allMembers.find((m: any) => m.name === recipientName);
    const recipientEmail = recipientMember?.email || '';

    const feedbackData: Feedback = {
      id: editingFeedbackId || Date.now().toString(),
      from: user?.name || '나',
      fromEmail: user?.email || '',
      type: feedbackType,
      content,
      createdAt: editingFeedbackId ? feedbacks.find(f => f.id === editingFeedbackId)?.createdAt || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      direction: 'sent',
      recipient: recipientName,
      recipientEmail,
    };

    try {
      // localStorage에 피드백 저장
      const userFeedbacksStr = localStorage.getItem('userFeedbacks');
      const userFeedbacks = userFeedbacksStr ? JSON.parse(userFeedbacksStr) : [];

      if (editingFeedbackId) {
        // 수정 모드
        const feedbackIndex = userFeedbacks.findIndex((f: Feedback) => f.id === editingFeedbackId);
        if (feedbackIndex !== -1) {
          userFeedbacks[feedbackIndex] = feedbackData;
        }
      } else {
        // 생성 모드
        userFeedbacks.unshift(feedbackData);
      }

      localStorage.setItem('userFeedbacks', JSON.stringify(userFeedbacks));

      // 활동 기록 저장
      const activitiesStr = localStorage.getItem('userActivities');
      const activities = activitiesStr ? JSON.parse(activitiesStr) : [];
      activities.unshift({
        id: Date.now().toString(),
        type: 'feedback',
        title: recipientName,
        description: editingFeedbackId
          ? `피드백 수정: ${feedbackType === 'KEEP_GOING' ? '좋은 점' : '개선점'} - ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
          : `피드백: ${feedbackType === 'KEEP_GOING' ? '좋은 점' : '개선점'} - ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        timestamp: new Date().toISOString(),
        feedbackId: feedbackData.id,
      });
      localStorage.setItem('userActivities', JSON.stringify(activities.slice(0, 20)));

      // API에도 요청
      fetch('/api/feedback', {
        method: editingFeedbackId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      }).catch(err => console.error('피드백 저장 실패:', err));
    } catch (err) {
      console.error('localStorage 저장 실패:', err);
    }

    if (editingFeedbackId) {
      setFeedbacks(feedbacks.map(f => f.id === editingFeedbackId ? feedbackData : f));
    } else {
      setFeedbacks([feedbackData, ...feedbacks]);
    }

    resetForm();
  }

  function resetForm() {
    setRecipientName('');
    setFeedbackType('KEEP_GOING');
    setContent('');
    setShowModal(false);
    setShowSuggestions(false);
    setEditingFeedbackId(null);
  }

  // 모든 구성원 가져오기
  const userMembersStr = localStorage.getItem('userMembers');
  const allMembers = userMembersStr ? JSON.parse(userMembersStr) : [];

  // 자동완성 필터링
  const filteredMembers = recipientName.trim()
    ? allMembers.filter((m: any) =>
        m.name.toLowerCase().includes(recipientName.toLowerCase())
      )
    : [];

  const handleEditFeedback = (feedback: Feedback, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFeedbackId(feedback.id);
    setRecipientName(feedback.recipient || '');
    setFeedbackType(feedback.type);
    setContent(feedback.content);
    setShowModal(true);
  };

  const handleDeleteFeedback = (feedbackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 피드백을 삭제하시겠습니까?')) {
      const deletedFeedback = feedbacks.find(f => f.id === feedbackId);
      const updatedFeedbacks = feedbacks.filter(f => f.id !== feedbackId);
      setFeedbacks(updatedFeedbacks);
      localStorage.setItem('userFeedbacks', JSON.stringify(updatedFeedbacks));

      // 활동 기록 저장
      const activitiesStr = localStorage.getItem('userActivities');
      const activities = activitiesStr ? JSON.parse(activitiesStr) : [];
      activities.unshift({
        id: Date.now().toString(),
        type: 'feedback',
        title: deletedFeedback?.recipient || '피드백',
        description: `피드백 삭제: ${deletedFeedback?.type === 'KEEP_GOING' ? '좋은 점' : '개선점'}`,
        timestamp: new Date().toISOString(),
        feedbackId: feedbackId,
      });
      localStorage.setItem('userActivities', JSON.stringify(activities.slice(0, 20)));
    }
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    // 관리자는 모든 피드백 조회 가능, 일반 사용자는 보낸/받은 피드백만 표시
    if (user?.role !== 'ADMIN') {
      const isSent = fb.from === user?.name;
      const isReceived = fb.recipient === user?.name;
      if (!isSent && !isReceived) return false;
    }

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
                      <span className="text-xs text-gray-500">{formatDateKo(fb.createdAt)}</span>
                    )}
                  </div>
                  <p className="mt-3 text-gray-900 leading-relaxed">{fb.content}</p>
                </div>
                {fb.from === user?.name && (
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => handleEditFeedback(fb, e)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={(e) => handleDeleteFeedback(fb.id, e)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Write Feedback Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFeedbackId(null);
        }}
        title={editingFeedbackId ? "피드백 수정" : "피드백 작성"}
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4">
          {/* 받는 사람 필드 (Autocomplete) */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                setShowSuggestions(e.target.value.trim().length > 0);
              }}
              onFocus={() => recipientName.trim().length > 0 && setShowSuggestions(true)}
              placeholder="이름을 입력하세요 (예: 김개발)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
            />

            {/* 자동완성 드롭다운 */}
            {showSuggestions && filteredMembers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setRecipientName(member.name);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    <span className="font-medium text-gray-900">{member.name}</span>
                    {member.role && <span className="text-gray-500 ml-2">({member.role})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

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
            <Button onClick={() => {
              setShowModal(false);
              setEditingFeedbackId(null);
            }} variant="secondary">
              취소
            </Button>
            <Button onClick={handleSubmit}>
              {editingFeedbackId ? '수정하기' : '작성하기'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
