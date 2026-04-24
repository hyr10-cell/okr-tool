'use client';

import { useEffect, useState } from 'react';
import { Card, Button, FormInput } from '@/app/components/ui';

interface User {
  name: string;
  email: string;
  role: string;
  org?: string | string[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<User>({ name: '', email: '', role: '', org: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setFormData(parsedUser);
    }
  }, []);

  const handleEditChange = (field: keyof User, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const orgValue = Array.isArray(formData.org) ? formData.org[0] : formData.org;
    if (!orgValue?.trim()) {
      alert('부서는 필수 입력 항목입니다');
      return;
    }

    setSaving(true);
    try {
      // Save to localStorage
      const dataToSave = { ...formData, org: orgValue };
      localStorage.setItem('user', JSON.stringify(dataToSave));
      setUser(dataToSave);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user || { name: '', email: '', role: '', org: '' });
    setIsEditing(false);
  };

  if (!user) return <div className="text-center py-12">로드 중...</div>;

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">내 프로필</h1>

      {/* Profile Info Card */}
      <Card className="max-w-2xl mb-6">
        <div className="space-y-6">
          {!isEditing ? (
            <>
              {/* Display Mode */}
              <div>
                <p className="text-sm text-gray-600 mb-1">이름</p>
                <p className="text-lg font-medium text-gray-900">{user.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">이메일</p>
                <p className="text-gray-900">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">역할</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-red-100 text-red-700'
                        : user.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {roleLabel(user.role)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">부서</p>
                  <p className="text-gray-900">
                    {typeof user.org === 'string' ? user.org : (Array.isArray(user.org) ? user.org.join(', ') : '-')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={() => setIsEditing(true)}>
                  프로필 수정
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <FormInput
                label="이름"
                value={formData.name}
                onChange={(value) => handleEditChange('name', value)}
                required
              />

              <FormInput
                label="이메일"
                value={formData.email}
                onChange={(value) => handleEditChange('email', value)}
                type="email"
                required
              />

              <FormInput
                label="부서"
                value={typeof formData.org === 'string' ? formData.org : (Array.isArray(formData.org) ? formData.org.join(', ') : '')}
                onChange={(value) => handleEditChange('org', value)}
                placeholder="부서명을 입력하세요"
                required
              />

              <div className="pt-4 border-t flex gap-2 justify-end">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  disabled={saving}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
