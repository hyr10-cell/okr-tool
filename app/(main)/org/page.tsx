'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Modal, FormInput } from '@/app/components/ui';

interface Member {
  id: string;
  name: string;
  email?: string;
  org?: string;
  dept?: string;
}

interface Organization {
  id: string;
  name: string;
  lead?: string;
  parentId?: string;
  members: Member[];
  children?: Organization[];
}

export default function OrgPage() {
  const [user, setUser] = useState<any>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [leadName, setLeadName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      const res = await fetch('/api/org');
      let apiOrgs: Organization[] = [];
      if (res.ok) {
        const data = await res.json();
        apiOrgs = data.data || [];
      }

      // localStorage에서 사용자가 만든 조직 로드
      const userOrgsStr = localStorage.getItem('userOrgs');
      const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];

      // API 조직과 사용자 조직 병합
      const allOrgs = [...userOrgs, ...apiOrgs];

      // 중복 제거 (같은 id는 userOrgs 버전 사용)
      const uniqueOrgs = Array.from(
        new Map(allOrgs.map(org => [org.id, org])).values()
      );

      // 현재 사용자의 부서에 해당하는 조직만 필터링
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      const filteredOrgs = currentUser?.org
        ? uniqueOrgs.filter(org => org.name === currentUser.org)
        : uniqueOrgs;

      setOrgs(filteredOrgs);
    } catch (err) {
      console.error('조직 로드 실패:', err);
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleOrgExpand(orgId: string) {
    const newExpanded = new Set(expandedOrgIds);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgIds(newExpanded);
  }

  function handleCreateOrUpdate() {
    if (!orgName.trim()) {
      alert('조직명을 입력해주세요');
      return;
    }

    const userOrgsStr = localStorage.getItem('userOrgs');
    const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];

    let updatedUserOrgs: Organization[];
    let updatedOrgs: Organization[];

    if (editingOrgId) {
      updatedUserOrgs = userOrgs.map((o: Organization) =>
        o.id === editingOrgId
          ? { ...o, name: orgName, lead: leadName || undefined }
          : o
      );
      updatedOrgs = orgs.map(o =>
        o.id === editingOrgId
          ? { ...o, name: orgName, lead: leadName || undefined }
          : o
      );
    } else {
      const newOrg: Organization = {
        id: Date.now().toString(),
        name: orgName,
        lead: leadName || undefined,
        members: [],
        children: [],
      };
      updatedUserOrgs = [...userOrgs, newOrg];
      updatedOrgs = [...orgs, newOrg];
    }

    setOrgs(updatedOrgs);
    localStorage.setItem('userOrgs', JSON.stringify(updatedUserOrgs));
    resetForm();
  }

  function handleAddMember() {
    if (!memberName.trim() || !memberEmail.trim() || !selectedOrgId) {
      alert('필수 항목을 입력해주세요');
      return;
    }

    const updatedOrgs = orgs.map(org => {
      if (org.id === selectedOrgId) {
        return {
          ...org,
          members: [
            ...org.members,
            {
              id: Date.now().toString(),
              name: memberName,
              email: memberEmail,
              org: org.name,
            }
          ]
        };
      }
      return org;
    });

    setOrgs(updatedOrgs);

    // localStorage도 업데이트
    const userOrgsStr = localStorage.getItem('userOrgs');
    const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];
    const updatedUserOrgs = userOrgs.map((org: Organization) => {
      if (org.id === selectedOrgId) {
        return {
          ...org,
          members: [
            ...org.members,
            {
              id: Date.now().toString(),
              name: memberName,
              email: memberEmail,
              org: org.name,
            }
          ]
        };
      }
      return org;
    });
    localStorage.setItem('userOrgs', JSON.stringify(updatedUserOrgs));

    setMemberName('');
    setMemberEmail('');
    setShowMemberModal(false);
  }

  function resetForm() {
    setOrgName('');
    setLeadName('');
    setEditingOrgId(null);
    setShowModal(false);
  }

  function handleEdit(org: Organization) {
    setEditingOrgId(org.id);
    setOrgName(org.name);
    setLeadName(org.lead || '');
    setShowModal(true);
  }

  function handleDelete(orgId: string) {
    if (confirm('이 조직을 삭제하시겠습니까?')) {
      const updatedOrgs = orgs.filter(o => o.id !== orgId);
      setOrgs(updatedOrgs);

      // localStorage도 업데이트
      const userOrgsStr = localStorage.getItem('userOrgs');
      const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];
      const updatedUserOrgs = userOrgs.filter((o: Organization) => o.id !== orgId);
      localStorage.setItem('userOrgs', JSON.stringify(updatedUserOrgs));
    }
  }

  function handleDeleteMember(orgId: string, memberId: string) {
    const updatedOrgs = orgs.map(org =>
      org.id === orgId
        ? { ...org, members: org.members.filter(m => m.id !== memberId) }
        : org
    );
    setOrgs(updatedOrgs);

    // localStorage도 업데이트
    const userOrgsStr = localStorage.getItem('userOrgs');
    const userOrgs = userOrgsStr ? JSON.parse(userOrgsStr) : [];
    const updatedUserOrgs = userOrgs.map((org: Organization) =>
      org.id === orgId
        ? { ...org, members: org.members.filter(m => m.id !== memberId) }
        : org
    );
    localStorage.setItem('userOrgs', JSON.stringify(updatedUserOrgs));
  }

  const renderOrganization = (org: Organization, level: number = 0) => {
    const isExpanded = expandedOrgIds.has(org.id);
    const hasChildren = org.children && org.children.length > 0;

    // 같은 부서의 구성원만 필터링
    const visibleMembers = org.members.filter(m => m.dept === user?.org || isAdmin);

    return (
      <div key={org.id} style={{ marginLeft: `${level * 24}px` }} className="mb-4">
        <Card className={hasChildren ? 'cursor-pointer hover:bg-gray-50' : ''}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {hasChildren && (
                    <button
                      onClick={() => toggleOrgExpand(org.id)}
                      className="w-5 h-5 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  )}
                  <h3 className="font-semibold text-gray-900 text-lg">{org.name}</h3>
                </div>

                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>팀장: {org.lead || '(미배정)'}</p>
                  <p>구성원: {visibleMembers.length}명</p>
                </div>

                {visibleMembers.length > 0 && (
                  <div className="mt-3 space-y-2 pt-3 border-t">
                    <p className="text-xs font-medium text-gray-500 uppercase">구성원 목록</p>
                    {visibleMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          • {member.name} <span className="text-gray-500">({member.email})</span>
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteMember(org.id, member.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedOrgId(org.id);
                      setShowMemberModal(true);
                    }}
                    className="text-sm px-3 py-1"
                  >
                    +구성원
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(org)}
                    className="text-sm px-3 py-1"
                  >
                    수정
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(org.id)}
                    className="text-sm px-3 py-1"
                  >
                    삭제
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-4">
            {org.children!.map(child => renderOrganization(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-12">로드 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">조직도</h1>
        {isAdmin && <Button onClick={() => setShowModal(true)}>+ 새 조직</Button>}
      </div>

      {orgs.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
          아직 조직이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {orgs.map(org => renderOrganization(org))}
        </div>
      )}

      {/* Create/Edit Organization Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingOrgId ? '조직 수정' : '새 조직 만들기'}
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4">
          <FormInput
            label="조직명"
            value={orgName}
            onChange={setOrgName}
            placeholder="예: 개발팀"
            required
          />

          <FormInput
            label="팀장 (선택사항)"
            value={leadName}
            onChange={setLeadName}
            placeholder="팀장의 이름을 입력하세요"
          />

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={() => setShowModal(false)} variant="secondary">
              취소
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editingOrgId ? '수정하기' : '만들기'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title="구성원 추가"
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4">
          <FormInput
            label="이름"
            value={memberName}
            onChange={setMemberName}
            placeholder="구성원 이름"
            required
          />

          <FormInput
            label="이메일"
            value={memberEmail}
            onChange={setMemberEmail}
            type="email"
            placeholder="구성원 이메일"
            required
          />

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={() => setShowMemberModal(false)} variant="secondary">
              취소
            </Button>
            <Button onClick={handleAddMember}>
              추가하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
