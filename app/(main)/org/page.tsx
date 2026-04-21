'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Modal, FormInput } from '@/app/components/ui';

interface Member {
  id: string;
  name: string;
  role: string;
  org?: string;
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
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [leadName, setLeadName] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      const res = await fetch('/api/org');
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.data || []);
      }
    } catch (err) {
      console.error('조직 로드 실패:', err);
      // Demo data fallback
      setOrgs([
        {
          id: '1',
          name: '개발팀',
          lead: '김개발',
          members: [
            { id: 'm1', name: '팀원1', role: 'Developer', org: '개발팀' },
            { id: 'm2', name: '팀원2', role: 'Developer', org: '개발팀' },
          ],
          children: [
            {
              id: '1-1',
              name: '백엔드팀',
              lead: '이백엔드',
              parentId: '1',
              members: [
                { id: 'm3', name: '개발자A', role: 'Backend Developer', org: '백엔드팀' },
              ],
            },
            {
              id: '1-2',
              name: '프론트엔드팀',
              lead: '박프론트',
              parentId: '1',
              members: [
                { id: 'm4', name: '개발자B', role: 'Frontend Developer', org: '프론트엔드팀' },
              ],
            },
          ],
        },
        {
          id: '2',
          name: '마케팅팀',
          lead: undefined,
          members: [],
          children: [],
        },
      ]);
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

    if (editingOrgId) {
      setOrgs(orgs.map(o =>
        o.id === editingOrgId
          ? { ...o, name: orgName, lead: leadName || undefined }
          : o
      ));
    } else {
      const newOrg: Organization = {
        id: Date.now().toString(),
        name: orgName,
        lead: leadName || undefined,
        members: [],
        children: [],
      };
      setOrgs([...orgs, newOrg]);
    }

    resetForm();
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
      setOrgs(orgs.filter(o => o.id !== orgId));
    }
  }

  const renderOrganization = (org: Organization, level: number = 0) => {
    const isExpanded = expandedOrgIds.has(org.id);
    const hasChildren = org.children && org.children.length > 0;

    return (
      <div key={org.id} style={{ marginLeft: `${level * 24}px` }} className="mb-4">
        <Card className={hasChildren ? 'cursor-pointer hover:bg-gray-50' : ''}>
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
                <p>구성원: {org.members.length}명</p>
              </div>

              {org.members.length > 0 && (
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  {org.members.map(member => (
                    <p key={member.id} className="ml-4">
                      • {member.name} ({member.role})
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
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
        <Button onClick={() => setShowModal(true)}>+ 새 조직</Button>
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

      {/* Create/Edit Modal */}
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
    </div>
  );
}
