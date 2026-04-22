'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, FormInput } from '@/app/components/ui';

interface Member {
  id: string;
  name: string;
  email: string;
  org?: string;
  dept?: string;
}

interface Organization {
  id: string;
  name: string;
}

const DEMO_ORGS: Organization[] = [
  { id: '1', name: '개발팀' },
  { id: '2', name: '마케팅팀' },
  { id: '3', name: '디자인팀' },
  { id: '4', name: '데이터팀' },
];

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('');
  const [showDeptSuggestions, setShowDeptSuggestions] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch('/api/org/members');
      let apiMembers: Member[] = [];
      if (res.ok) {
        const data = await res.json();
        apiMembers = data.data || [];
      }

      // localStorage에서 사용자가 import한 구성원 로드
      const userMembersStr = localStorage.getItem('userMembers');
      const userMembers = userMembersStr ? JSON.parse(userMembersStr) : [];

      // API 구성원과 사용자 구성원 병합
      const allMembers = [...userMembers, ...apiMembers];

      // 중복 제거 (같은 id는 userMembers 버전 사용)
      const uniqueMembers = Array.from(
        new Map(allMembers.map(m => [m.id, m])).values()
      );

      setMembers(uniqueMembers);
    } catch (err) {
      console.error('구성원 로드 실패:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateOrUpdate() {
    if (!name.trim() || !email.trim() || !dept.trim()) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    const userMembersStr = localStorage.getItem('userMembers');
    const userMembers = userMembersStr ? JSON.parse(userMembersStr) : [];

    let updatedUserMembers: Member[];
    let updatedMembers: Member[];

    if (editingMemberId) {
      updatedUserMembers = userMembers.map((m: Member) =>
        m.id === editingMemberId
          ? { ...m, name, email, dept }
          : m
      );
      updatedMembers = members.map(m =>
        m.id === editingMemberId
          ? { ...m, name, email, dept }
          : m
      );
    } else {
      const newMember: Member = {
        id: Date.now().toString(),
        name,
        email,
        dept,
      };
      updatedUserMembers = [...userMembers, newMember];
      updatedMembers = [...members, newMember];
    }

    setMembers(updatedMembers);
    localStorage.setItem('userMembers', JSON.stringify(updatedUserMembers));
    resetForm();
  }

  function resetForm() {
    setName('');
    setEmail('');
    setDept('');
    setEditingMemberId(null);
    setShowModal(false);
    setShowDeptSuggestions(false);
  }

  function handleEdit(member: Member) {
    setEditingMemberId(member.id);
    setName(member.name);
    setEmail(member.email);
    setDept(member.dept || '');
    setShowModal(true);
  }

  function handleDelete(memberId: string) {
    if (confirm('이 구성원을 삭제하시겠습니까?')) {
      const updatedMembers = members.filter(m => m.id !== memberId);
      setMembers(updatedMembers);

      // localStorage도 업데이트
      const userMembersStr = localStorage.getItem('userMembers');
      const userMembers = userMembersStr ? JSON.parse(userMembersStr) : [];
      const updatedUserMembers = userMembers.filter((m: Member) => m.id !== memberId);
      localStorage.setItem('userMembers', JSON.stringify(updatedUserMembers));
    }
  }

  function handleOpenModal() {
    resetForm();
    setShowModal(true);
  }

  function handleImport() {
    if (!importText.trim()) {
      alert('데이터를 입력해주세요');
      return;
    }

    const lines = importText.trim().split('\n');
    let success = 0;
    let failed = 0;
    const newMembers: Member[] = [];

    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const [name, email, dept] = parts;
        const newMember: Member = {
          id: Date.now().toString() + Math.random(),
          name,
          email,
          dept,
        };
        newMembers.push(newMember);
        success++;
      } else if (line.trim()) {
        failed++;
      }
    }

    if (newMembers.length > 0) {
      const userMembersStr = localStorage.getItem('userMembers');
      const userMembers = userMembersStr ? JSON.parse(userMembersStr) : [];
      const updatedUserMembers = [...userMembers, ...newMembers];
      localStorage.setItem('userMembers', JSON.stringify(updatedUserMembers));

      const updatedMembers = [...members, ...newMembers];
      setMembers(updatedMembers);
      setImportResult({ success, failed });
      setImportText('');
      setTimeout(() => {
        setShowImportModal(false);
        setImportResult(null);
      }, 2000);
    }
  }

  // 부서 자동완성 필터링
  const filteredDepts = dept.trim()
    ? DEMO_ORGS.filter(o =>
        o.name.toLowerCase().includes(dept.toLowerCase())
      )
    : [];

  if (loading) {
    return <div className="text-center py-12">로드 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">구성원 관리</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            📋 일괄 import
          </Button>
          <Button onClick={handleOpenModal}>+ 구성원 추가</Button>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
          아직 구성원이 없습니다.
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">이름</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">이메일</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">부서</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.dept || '-'}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportText('');
          setImportResult(null);
        }}
        title="구성원 일괄 import"
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">형식: 이름 [탭] 이메일 [탭] 부서</p>
            <p className="text-xs">예시:</p>
            <code className="text-xs bg-white px-2 py-1 rounded block mt-1">Beth Ahn	yja@wincubemkt.com	해외플랫폼사업실</code>
          </div>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="엑셀에서 복붙하세요..."
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
          />

          {importResult && (
            <div className={`rounded-lg p-3 text-sm ${
              importResult.failed === 0
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              ✅ {importResult.success}명 추가됨{importResult.failed > 0 && ` (${importResult.failed}행 오류)`}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              onClick={() => {
                setShowImportModal(false);
                setImportText('');
                setImportResult(null);
              }}
              variant="secondary"
            >
              취소
            </Button>
            <Button onClick={handleImport}>
              import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMemberId ? '구성원 수정' : '새 구성원 추가'}
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4">
          <FormInput
            label="이름"
            value={name}
            onChange={setName}
            placeholder="구성원의 이름을 입력하세요"
            required
          />

          <FormInput
            label="이메일"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="구성원의 이메일을 입력하세요"
            required
          />

          {/* 부서 필드 (Autocomplete) */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부서 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dept}
              onChange={(e) => {
                setDept(e.target.value);
                setShowDeptSuggestions(e.target.value.trim().length > 0);
              }}
              onFocus={() => dept.trim().length > 0 && setShowDeptSuggestions(true)}
              placeholder="부서명을 입력하세요 (예: 개발팀)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
            />

            {/* 부서 자동완성 드롭다운 */}
            {showDeptSuggestions && filteredDepts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {filteredDepts.map(organization => (
                  <button
                    key={organization.id}
                    onClick={() => {
                      setDept(organization.name);
                      setShowDeptSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 text-sm text-gray-900 font-medium"
                  >
                    {organization.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={() => setShowModal(false)} variant="secondary">
              취소
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editingMemberId ? '수정하기' : '추가하기'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
