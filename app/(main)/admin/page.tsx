'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MENU = [
  { href: '/admin/members', label: '👥 멤버 관리', desc: '역할 설정, 리뷰어 지정' },
  { href: '/admin/org-upload', label: '📂 조직도 업로드', desc: 'Flex HR CSV 파일 업로드' },
];

export default function AdminPage() {
  const router = useRouter();
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [clearing, setClearing] = useState(false);

  async function handleAutoGenerateOrgs() {
    setAutoGenerating(true);
    setMessage('생성 중...');

    try {
      // userMembers 로드
      const userMembersStr = localStorage.getItem('userMembers');
      const userMembers = userMembersStr ? JSON.parse(userMembersStr) : [];

      if (userMembers.length === 0) {
        setMessage('❌ 구성원이 없습니다');
        setAutoGenerating(false);
        return;
      }

      // 부서별로 그룹화 (다중 부서 지원)
      const deptMap: { [key: string]: any[] } = {};
      userMembers.forEach((member: any) => {
        const memberDepts = Array.isArray(member.dept) ? member.dept : (member.dept ? [member.dept] : ['기타']);
        memberDepts.forEach((dept: string) => {
          if (!deptMap[dept]) {
            deptMap[dept] = [];
          }
          deptMap[dept].push(member);
        });
      });

      // Organization 객체 생성
      const newOrgs = Object.entries(deptMap).map(([deptName, members], idx) => ({
        id: Date.now().toString() + idx,
        name: deptName,
        lead: members[0]?.name || undefined,
        members: members.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          org: deptName,
        })),
        children: [],
      }));

      // localStorage에 저장
      const existingOrgsStr = localStorage.getItem('userOrgs');
      const existingOrgs = existingOrgsStr ? JSON.parse(existingOrgsStr) : [];
      const mergedOrgs = [...existingOrgs, ...newOrgs];
      localStorage.setItem('userOrgs', JSON.stringify(mergedOrgs));

      const deptCount = newOrgs.length;
      setMessage(`✅ ${deptCount}개 부서, ${userMembers.length}명의 구성원이 조직도에 추가됨`);

      setTimeout(() => {
        router.push('/org');
      }, 1500);
    } catch (err) {
      console.error('자동 생성 실패:', err);
      setMessage('❌ 생성 실패');
    } finally {
      setAutoGenerating(false);
    }
  }

  function handleClearTestData() {
    if (confirm('테스트 데이터를 삭제하시겠습니까?\n(목표, 피드백, 활동이 삭제됩니다)')) {
      setClearing(true);
      setMessage('데이터 삭제 중...');

      try {
        localStorage.removeItem('userGoals');
        localStorage.removeItem('userFeedbacks');
        localStorage.removeItem('userActivities');

        setMessage('✅ 테스트 데이터가 삭제되었습니다');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (err) {
        console.error('데이터 삭제 실패:', err);
        setMessage('❌ 삭제 실패');
      } finally {
        setClearing(false);
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 설정</h1>

      {message && (
        <div className={`mb-6 rounded-lg p-4 text-sm ${
          message.includes('✅')
            ? 'bg-green-50 text-green-700'
            : message.includes('❌')
            ? 'bg-red-50 text-red-700'
            : 'bg-blue-50 text-blue-700'
        }`}>
          {message}
        </div>
      )}

      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">조직도 자동 생성</h2>
            <p className="text-sm text-gray-600 mt-1">import한 구성원을 부서별로 자동으로 조직도 생성</p>
          </div>
          <button
            onClick={handleAutoGenerateOrgs}
            disabled={autoGenerating}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {autoGenerating ? '생성 중...' : '🚀 생성'}
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-lg border border-red-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">테스트 데이터 삭제</h2>
            <p className="text-sm text-gray-600 mt-1">목표, 피드백, 활동 등 테스트 데이터를 삭제합니다 (조직도는 유지)</p>
          </div>
          <button
            onClick={handleClearTestData}
            disabled={clearing}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {clearing ? '삭제 중...' : '🗑️ 삭제'}
          </button>
        </div>
      </div>

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
