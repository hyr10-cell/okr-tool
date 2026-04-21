'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">로드 중...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="p-4">
          <h1 className="text-xl font-bold text-indigo-600">OKR</h1>
          <p className="text-xs text-gray-600 mt-2">{user?.name}</p>
        </div>
        <nav className="space-y-1 p-4">
          <a href="/goals" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            목표
          </a>
          <a href="/feedback" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            피드백
          </a>
          <a href="/dashboard" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            대시보드
          </a>
          <a href="/org" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            조직도
          </a>
          <a href="/profile" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            프로필
          </a>
          {user?.role === 'ADMIN' && (
            <a href="/admin" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              ⚙️ 관리자
            </a>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="block w-full text-left rounded px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 mt-4"
          >
            로그아웃
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
