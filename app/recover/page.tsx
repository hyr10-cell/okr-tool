'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecoverPage() {
  const router = useRouter();
  const [importText, setImportText] = useState('');
  const [result, setResult] = useState<{ success: number; failed: number; message: string } | null>(null);
  const [error, setError] = useState('');

  function handleRestore() {
    if (!importText.trim()) {
      setError('데이터를 입력해주세요');
      return;
    }

    const lines = importText.trim().split('\n');
    let success = 0;
    let failed = 0;
    const newMembers: any[] = [];

    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
        const [name, email, ...deptParts] = parts;
        const depts = deptParts.filter(d => d.length > 0);
        const newMember = {
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
      localStorage.setItem('userMembers', JSON.stringify(newMembers));
      setResult({
        success,
        failed,
        message: `✅ ${success}명의 구성원이 복구되었습니다. 이제 로그인 페이지로 이동합니다.`,
      });
      setError('');
      setImportText('');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError('유효한 데이터가 없습니다.');
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">계정 복구</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          어제 import한 구성원 데이터를 붙여넣기하세요.
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium mb-2">형식: 이름 [탭] 이메일 [탭] 부서1 [탭] 부서2 (선택)</p>
            <p className="text-xs">예시:</p>
            <code className="text-xs bg-white px-2 py-1 rounded block mt-1">
              Beth Ahn	yja@wincubemkt.com	해외플랫폼사업실
            </code>
          </div>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="엑셀에서 복붙하세요..."
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
          />

          {error && <div className="text-sm text-red-600">{error}</div>}
          {result && (
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700">
              {result.message}
            </div>
          )}

          <button
            onClick={handleRestore}
            disabled={!importText.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            구성원 복구
          </button>

          <a
            href="/login"
            className="block text-center text-sm text-indigo-600 hover:text-indigo-700 underline"
          >
            이미 데이터가 있으면 로그인으로
          </a>
        </div>
      </div>
    </div>
  );
}
