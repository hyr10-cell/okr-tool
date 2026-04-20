'use client';

import { useEffect, useState } from 'react';

interface Member {
  id: string; name: string; email: string; role: string;
  reviewer?: { name: string };
}

const ROLES = ['ADMIN', 'REVIEWER', 'MEMBER'];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/members')
      .then(r => r.json())
      .then(d => {
        setMembers(d.data || []);
        setLoading(false);
      });
  }, []);

  async function updateRole(userId: string, role: string) {
    await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, role } : m));
  }

  if (loading) return <div className="text-center py-12 text-gray-500">로드 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">멤버 관리</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">이름</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">이메일</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">리뷰어</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">역할</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.email}</td>
                <td className="px-4 py-3 text-gray-500">{m.reviewer?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={m.role}
                    onChange={(e) => updateRole(m.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">멤버가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
