'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Account {
  email: string;
  name: string;
  role: string;
  org?: string | string[];
  dept?: string | string[];
}

const DEMO_ACCOUNTS: Account[] = [
  { email: 'admin@wincubemkt.com', name: '관리자', role: 'ADMIN' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. DEMO_ACCOUNTS에서 찾기
    let account: Account | undefined = DEMO_ACCOUNTS.find(a => a.email === email);

    // 2. 없으면 localStorage의 userMembers에서 찾기
    if (!account) {
      const userMembersStr = localStorage.getItem('userMembers');
      const userMembers = userMembersStr ? JSON.parse(userMembersStr) : [];
      const member = userMembers.find((m: any) => m.email === email);
      if (member) {
        account = {
          email: member.email,
          name: member.name,
          role: 'MEMBER',
          org: member.dept,
          dept: member.dept,
        };
      }
    }

    // 3. 아직 없으면 API에서 찾기
    if (!account) {
      try {
        const res = await fetch('/api/org/members');
        if (res.ok) {
          const data = await res.json();
          const apiMember = data.data.find((m: any) => m.email === email);
          if (apiMember) {
            account = {
              email: apiMember.email,
              name: apiMember.name,
              role: 'MEMBER',
              org: apiMember.dept || apiMember.org,
            };
          }
        }
      } catch (err) {
        console.error('API 조회 실패:', err);
      }
    }

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
    <div className="min-h-screen grid grid-cols-[1.1fr_1fr]" style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
      {/* 좌측: 브랜드 배경 */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-500 text-white px-12 py-12 flex flex-col justify-between overflow-hidden">
        {/* 배경 그라데이션 오버레이 */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)'
        }}/>

        {/* 좌측 상단: 로고 */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-white bg-opacity-15 backdrop-blur-md flex items-center justify-center font-bold text-lg">
              O
            </div>
            <div className="font-bold text-base tracking-tight">OKR 도구</div>
          </div>
        </div>

        {/* 좌측 중앙: 메인 메시지 */}
        <div className="relative">
          <div className="text-4xl font-bold leading-tight mb-6" style={{ letterSpacing: '-0.025em' }}>
            조직의 목표가<br/>한 눈에 정렬되는 곳
          </div>
          <div className="text-sm opacity-82 max-w-xs mb-10 leading-relaxed">
            윈큐브마케팅 OKR 시스템
          </div>

          {/* 통계 카드 */}
          <div className="flex gap-4">
            {[
              { value: '127', label: '활성 목표' },
              { value: '8', label: '이번 주 체크인' },
              { value: '94%', label: '참여율' },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 p-5 rounded-2xl bg-white bg-opacity-5 border border-white border-opacity-30 backdrop-blur-xl hover:bg-opacity-10 transition">
                <div className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div className="text-sm text-white opacity-95 mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 좌측 하단: 저작권 */}
        <div className="relative text-xs opacity-60">
          © 2026 WINCUBE Marketing
        </div>
      </div>

      {/* 우측: 로그인 폼 */}
      <div className="flex items-center justify-center px-8 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-2">
              Welcome back
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
              로그인
            </h1>
            <p className="text-sm text-gray-500">
              목표 관리 및 성과 추적
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-2"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center gap-3 mb-6 text-xs text-gray-500">
            <div className="flex-1 h-px bg-gray-200" />
            <span>데모 계정</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 데모 계정 */}
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => setEmail(account.email)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0">
                  {account.name.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-sm text-gray-900">
                    {account.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {account.email}
                  </div>
                </div>
                <div className="text-gray-400 text-xs flex-shrink-0">›</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
