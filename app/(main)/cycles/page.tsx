'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Modal, FormInput } from '@/app/components/ui';

interface Cycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goalsCount?: number;
  status?: 'active' | 'inactive' | 'archived';
  description?: string;
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCycles();
  }, []);

  async function fetchCycles() {
    try {
      const res = await fetch('/api/cycles');
      if (res.ok) {
        const data = await res.json();
        setCycles(data.data || []);
      }
    } catch (err) {
      console.error('사이클 로드 실패:', err);
      // Demo data fallback
      setCycles([
        {
          id: '1',
          name: '2024년 Q2',
          startDate: '2024-04-01',
          endDate: '2024-06-30',
          goalsCount: 3,
          status: 'active',
        },
        {
          id: '2',
          name: '2024년 Q1',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          goalsCount: 5,
          status: 'inactive',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateOrUpdate() {
    if (!name.trim() || !startDate || !endDate) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert('종료일이 시작일보다 나중이어야 합니다');
      return;
    }

    if (editingCycleId) {
      // Update existing cycle
      setCycles(cycles.map(c =>
        c.id === editingCycleId
          ? { ...c, name, startDate, endDate, description }
          : c
      ));
    } else {
      // Create new cycle
      const newCycle: Cycle = {
        id: Date.now().toString(),
        name,
        startDate,
        endDate,
        description,
        goalsCount: 0,
        status: 'active',
      };
      setCycles([newCycle, ...cycles]);
    }

    resetForm();
  }

  function resetForm() {
    setName('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setEditingCycleId(null);
    setShowModal(false);
  }

  function handleEdit(cycle: Cycle) {
    setEditingCycleId(cycle.id);
    setName(cycle.name);
    setStartDate(cycle.startDate);
    setEndDate(cycle.endDate);
    setDescription(cycle.description || '');
    setShowModal(true);
  }

  function handleDelete(cycleId: string) {
    if (confirm('이 사이클을 삭제하시겠습니까?')) {
      setCycles(cycles.filter(c => c.id !== cycleId));
    }
  }

  function handleOpenModal() {
    resetForm();
    setShowModal(true);
  }

  if (loading) {
    return <div className="text-center py-12">로드 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">사이클</h1>
        <Button onClick={handleOpenModal}>+ 새 사이클</Button>
      </div>

      {cycles.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
          아직 사이클이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cycles.map(cycle => (
            <Card key={cycle.id}>
              <div className="space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg">{cycle.name}</h3>
                    {cycle.status && (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        cycle.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : cycle.status === 'inactive'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {cycle.status === 'active' ? '진행중' : cycle.status === 'inactive' ? '대기' : '종료'}
                      </span>
                    )}
                  </div>
                  {cycle.description && (
                    <p className="text-sm text-gray-600 mt-2">{cycle.description}</p>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t text-sm text-gray-600">
                  <p>📅 {cycle.startDate} ~ {cycle.endDate}</p>
                  {cycle.goalsCount !== undefined && (
                    <p>🎯 목표 {cycle.goalsCount}개</p>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(cycle)}
                    className="flex-1 text-sm"
                  >
                    수정
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(cycle.id)}
                    className="flex-1 text-sm"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCycleId ? '사이클 수정' : '새 사이클 만들기'}
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4">
          <FormInput
            label="사이클명"
            value={name}
            onChange={setName}
            placeholder="예: 2024년 Q1"
            required
          />

          <FormInput
            label="설명"
            value={description}
            onChange={setDescription}
            type="textarea"
            placeholder="사이클에 대한 설명을 입력하세요"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="시작일"
              value={startDate}
              onChange={setStartDate}
              type="date"
              required
            />
            <FormInput
              label="종료일"
              value={endDate}
              onChange={setEndDate}
              type="date"
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={() => setShowModal(false)} variant="secondary">
              취소
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editingCycleId ? '수정하기' : '만들기'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
