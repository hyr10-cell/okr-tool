'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, FormInput } from '@/app/components/ui';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  org?: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'MEMBER'>('MEMBER');
  const [org, setOrg] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch('/api/org/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data || []);
      }
    } catch (err) {
      console.error('구성원 로드 실패:', err);
      // Demo data
      setMembers([
        { id: '1', name: '관리자', email: 'admin@example.com', role: 'ADMIN', org: '개발팀' },
        { id: '2', name: '팀장', email: 'manager@example.com', role: 'MANAGER', org: '개발팀' },
        { id: '3', name: '팀원', email: 'member@example.com', role: 'MEMBER', org: '개발팀' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateOrUpdate() {
    if (!name.trim() || !email.trim()) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    if (editingMemberId) {
      setMembers(members.map(m =>
        m.id === editingMemberId
          ? { ...m, name, email, role, org }
          : m
      ));
    } else {
      const newMember: Member = {
        id: Date.now().toString(),
        name,
        email,
        role,
        org,
      };
      setMembers([...members, newMember]);
    }

    resetForm();
  }

  function resetForm() {
    setName('');
    setEmail('');
    setRole('MEMBER');
    setOrg('');
    setEditingMemberId(null);
    setShowModal(false);
  }

  function handleEdit(member: Member) {
    setEditingMemberId(member.id);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setOrg(member.org || '');
    setShowModal(true);
  }

  function handleDelete(memberId: string) {
    if (confirm('이 구성원을 삭제하시겠습니까?')) {
      setMembers(members.filter(m => m.id !== memberId));
    }
  }

  function handleOpenModal() {
    resetForm();
    setShowModal(true);
  }

  if (loading) {
    return <div className="text-center py-12">로드 중...</div>;
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '관리자';
      case 'MANAGER':
        return '팀장';
      case 'MEMBER':
        return '구성원';
      default:
        return role;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">구성원 관리</h1>
        <Button onClick={handleOpenModal}>+ 구성원 추가</Button>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">역할</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">부서</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.role === 'ADMIN'
                        ? 'bg-red-100 text-red-700'
                        : member.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {roleLabel(member.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.org || '-'}</td>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              역할 <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MANAGER' | 'MEMBER')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
            >
              <option value="MEMBER">구성원</option>
              <option value="MANAGER">팀장</option>
              <option value="ADMIN">관리자</option>
            </select>
          </div>

          <FormInput
            label="부서"
            value={org}
            onChange={setOrg}
            placeholder="부서명을 입력하세요 (선택사항)"
          />

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
