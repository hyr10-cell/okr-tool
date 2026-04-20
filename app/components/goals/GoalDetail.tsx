'use client';

import { Card, Button, StatusBadge } from '@/app/components/ui';

interface GoalDetailProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    status: string;
    level: string;
    owner: { name: string };
    startDate?: string;
    endDate?: string;
  };
  onClose: () => void;
  onCheckIn?: () => void;
  onWriteFeedback?: () => void;
}

export function GoalDetail({ goal, onClose, onCheckIn, onWriteFeedback }: GoalDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-40">
      <div className="w-full md:w-96 bg-white h-screen md:h-auto md:rounded-lg md:shadow-lg md:max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">목표 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-6">
          {/* 목표 정보 */}
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">상태</span>
                  <StatusBadge status={goal.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">레벨</span>
                  <span className="text-sm font-medium text-gray-900">
                    {goal.level === 'COMPANY'
                      ? '회사'
                      : goal.level === 'TEAM'
                      ? '팀'
                      : '개인'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">담당자</span>
                  <span className="text-sm font-medium text-gray-900">{goal.owner.name}</span>
                </div>
                {goal.startDate && goal.endDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">기간</span>
                    <span className="text-sm font-medium text-gray-900">
                      {goal.startDate} ~ {goal.endDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 액션 버튼 */}
          <div className="space-y-2">
            <Button onClick={onCheckIn} className="w-full">
              체크인하기
            </Button>
            <Button onClick={onWriteFeedback} variant="secondary" className="w-full">
              피드백 작성하기
            </Button>
          </div>

          {/* 체크인 이력 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">체크인 이력</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">아직 체크인이 없습니다.</p>
            </div>
          </div>

          {/* 피드백 이력 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">피드백</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">아직 피드백이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
