'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DEMO_ACCOUNTS = [
  { email: 'admin@example.com', name: '관리자', role: 'ADMIN' },
  { email: 'manager@example.com', name: '팀장', role: 'MANAGER' },
  { email: 'member@example.com', name: '팀원', role: 'MEMBER' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const account = DEMO_ACCOUNTS.find(a => a.email === email);

    if (!account) {
      setError('존재하지 않는 계정입니다.');
      setLoading(false);
      return;
    }

    // 로컬스토리지에 사용자 정보 저장
    localStorage.setItem('user', JSON.stringify(account));
    router.push('/goals');
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">OKR 도구</h1>
        <p className="mb-6 text-center text-gray-600">목표 관리 및 성과 추적</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="mb-3 text-center text-xs text-gray-600">데모 계정</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => setEmail(account.email)}
                className="w-full text-left rounded border border-gray-200 p-2 text-sm hover:bg-gray-50"
              >
                {account.name} ({account.email})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
