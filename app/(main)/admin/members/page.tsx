'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, FormInput } from '@/app/components/ui';

interface Member {
  id: string;
  name: string;
  email: string;
  org?: string;
  dept?: string | string[];
}


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
  const [depts, setDepts] = useState<string[]>([]);

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
    if (!name.trim() || !email.trim() || depts.length === 0) {
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
          ? { ...m, name, email, dept: depts }
          : m
      );
      updatedMembers = members.map(m =>
        m.id === editingMemberId
          ? { ...m, name, email, dept: depts }
          : m
      );

      // 조직도(userOrgs)도 함께 업데이트
      const userOrgsStr = localStorage.getItem('userOrgs');
      const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];

      // 1. 모든 조직에서 해당 구성원 제거
      let updatedUserOrgs = userOrgs.map((org: any) => ({
        ...org,
        members: org.members.filter((m: Member) => m.id !== editingMemberId),
      }));

      // 2. 선택된 각 부서에 구성원 추가
      updatedUserOrgs = updatedUserOrgs.map((org: any) => {
        if (depts.includes(org.name)) {
          // 이미 존재하는지 확인
          const existingMember = org.members.find((m: Member) => m.id === editingMemberId);
          if (!existingMember) {
            return {
              ...org,
              members: [...org.members, {
                id: editingMemberId,
                name,
                email,
                org: org.name,
              }],
            };
          }
        }
        return org;
      });

      localStorage.setItem('userOrgs', JSON.stringify(updatedUserOrgs));
    } else {
      const newMember: Member = {
        id: Date.now().toString(),
        name,
        email,
        dept: depts,
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
    setDepts([]);
    setEditingMemberId(null);
    setShowModal(false);
  }

  function handleEdit(member: Member) {
    setEditingMemberId(member.id);
    setName(member.name);
    setEmail(member.email);
    setDepts(Array.isArray(member.dept) ? member.dept : (member.dept ? [member.dept] : []));
    setShowModal(true);
  }

  function handleDelete(memberId: string) {
    if (confirm('이 구성원을 삭제하시겠습니까?')) {
      const updatedMembers = members.filter(m => m.id !== memberId);
      setMembers(updatedMembers);

      // userMembers 업데이트
      const userMembersStr = localStorage.getItem('userMembers');
      const userMembers = userMembersStr ? JSON.parse(userMembersStr) : [];
      const updatedUserMembers = userMembers.filter((m: Member) => m.id !== memberId);
      localStorage.setItem('userMembers', JSON.stringify(updatedUserMembers));

      // 조직도(userOrgs)에서도 구성원 제거
      const userOrgsStr = localStorage.getItem('userOrgs');
      const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];
      const updatedUserOrgs = userOrgs.map((org: any) => ({
        ...org,
        members: org.members.filter((m: Member) => m.id !== memberId),
      }));
      localStorage.setItem('userOrgs', JSON.stringify(updatedUserOrgs));
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
      if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
        const [name, email, ...deptParts] = parts;
        const depts = deptParts.filter(d => d.length > 0);
        const newMember: Member = {
          id: Date.now().toString() + Math.random(),
          name,
          email,
          dept: depts,
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

      // 조직도(userOrgs)에도 구성원 추가
      const userOrgsStr = localStorage.getItem('userOrgs');
      const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];
      const updatedUserOrgs = userOrgs.map((org: any) => {
        // 해당 부서의 구성원들 추가
        const membersToAdd = newMembers.filter(m => {
          const memberDepts = Array.isArray(m.dept) ? m.dept : [m.dept];
          return memberDepts.includes(org.name);
        });
        return {
          ...org,
          members: [...org.members, ...membersToAdd.map(m => ({
            id: m.id,
            name: m.name,
            email: m.email,
            org: org.name,
          }))],
        };
      });
      localStorage.setItem('userOrgs', JSON.stringify(updatedUserOrgs));

      setImportResult({ success, failed });
      setImportText('');
      setTimeout(() => {
        setShowImportModal(false);
        setImportResult(null);
      }, 2000);
    }
  }

  // 실제로 존재하는 부서 목록 (userMembers와 userOrgs 모두에서 추출)
  const userOrgsStr = localStorage.getItem('userOrgs');
  const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];

  const deptFromMembers = members.flatMap(m => {
    const memberDepts = Array.isArray(m.dept) ? m.dept : (m.dept ? [m.dept] : []);
    return memberDepts;
  });

  const deptFromOrgs = userOrgs.map((org: any) => org.name);

  const actualDepts = Array.from(new Set([...deptFromOrgs, ...deptFromMembers])).sort();

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
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {Array.isArray(member.dept) ? member.dept.join(', ') : member.dept || '-'}
                  </td>
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
            <p className="font-medium mb-1">형식: 이름 [탭] 이메일 [탭] 부서1 [탭] 부서2 (선택)</p>
            <p className="text-xs">예시 (단일 부서):</p>
            <code className="text-xs bg-white px-2 py-1 rounded block mt-1">Beth Ahn	yja@wincubemkt.com	해외플랫폼사업실</code>
            <p className="text-xs mt-2">예시 (다중 부서):</p>
            <code className="text-xs bg-white px-2 py-1 rounded block mt-1">John Doe	john@wincubemkt.com	개발팀	마케팅팀</code>
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

          {/* 부서 필드 (다중 선택) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부서 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 border border-gray-300 rounded-lg p-3 bg-gray-50">
              {actualDepts.length > 0 ? (
                actualDepts.map(dept => (
                  <label key={dept} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={depts.includes(dept)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDepts([...depts, dept]);
                        } else {
                          setDepts(depts.filter(d => d !== dept));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">{dept}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">import된 부서가 없습니다</p>
              )}
            </div>
            {depts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {depts.map(dept => (
                  <span key={dept} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {dept}
                    <button
                      type="button"
                      onClick={() => setDepts(depts.filter(d => d !== dept))}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
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
