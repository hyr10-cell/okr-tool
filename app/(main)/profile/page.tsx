'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (!user) return <div>로드 중...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">내 프로필</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <p className="text-gray-900 font-medium">{user.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
            <p className="text-gray-900 capitalize">{user.role}</p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">알림 설정</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="ml-2 text-sm text-gray-700">이메일 알림</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="ml-2 text-sm text-gray-700">Slack 알림</span>
              </label>
            </div>
          </div>

          <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 font-medium">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
