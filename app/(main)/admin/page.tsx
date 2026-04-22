'use client';

import { useRouter } from 'next/navigation';

const MENU = [
  { href: '/admin/members', label: '👥 멤버 관리', desc: '역할 설정, 리뷰어 지정' },
  { href: '/admin/org-upload', label: '📂 조직도 업로드', desc: 'Flex HR CSV 파일 업로드' },
];

export default function AdminPage() {
  const router = useRouter();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 설정</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MENU.map((m) => (
          <button
            key={m.href}
            onClick={() => router.push(m.href)}
            className="text-left bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition"
          >
            <div className="text-lg font-semibold text-gray-900 mb-1">{m.label}</div>
            <div className="text-sm text-gray-500">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
