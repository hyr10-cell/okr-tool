'use client';

export default function AdminMembersPage() {
  const members = [
    { id: '1', name: '관리자', email: 'admin@example.com', role: 'ADMIN', dept: '개발팀' },
    { id: '2', name: '팀장', email: 'manager@example.com', role: 'MANAGER', dept: '개발팀' },
    { id: '3', name: '팀원', email: 'member@example.com', role: 'MEMBER', dept: '개발팀' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">구성원 관리</h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 font-medium">
          + 구성원 추가
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">이름</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">이메일</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">역할</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">부서</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{member.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{member.role}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{member.dept}</td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-indigo-600 hover:text-indigo-900">수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
