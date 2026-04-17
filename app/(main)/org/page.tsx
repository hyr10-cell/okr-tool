'use client';

export default function OrgPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">조직도</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="space-y-6">
          <div className="border-l-2 border-indigo-200 pl-6">
            <h3 className="font-semibold text-gray-900">개발팀</h3>
            <p className="text-sm text-gray-600 mt-1">팀장: 팀장</p>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>• 팀원</p>
              <p>• 관리자</p>
            </div>
          </div>

          <div className="border-l-2 border-indigo-200 pl-6">
            <h3 className="font-semibold text-gray-900">마케팅팀</h3>
            <p className="text-sm text-gray-600 mt-1">팀장: (미배정)</p>
            <div className="mt-3 text-sm text-gray-500">
              <p>구성원 없음</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
