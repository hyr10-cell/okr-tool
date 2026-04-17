'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">나의 성장 대시보드</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">총 목표</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">순항</p>
          <p className="text-3xl font-bold text-green-600 mt-2">3</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">난항</p>
          <p className="text-3xl font-bold text-red-600 mt-2">2</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">완료</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">• 목표 "API 보안 강화" 상태 변경 (순항 → 난항)</p>
          <p className="text-sm text-gray-600">• 체크인 제출 "서비스 성능 개선"</p>
          <p className="text-sm text-gray-600">• 피드백 수신 "좋은 진행 방향입니다"</p>
        </div>
      </div>
    </div>
  );
}
