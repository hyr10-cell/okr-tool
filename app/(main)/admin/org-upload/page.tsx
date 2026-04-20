'use client';

import { useState } from 'react';

export default function OrgUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ created: number; updated: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/org-upload', { method: 'POST', body: formData });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setResult(data.data);
    } else {
      setError('업로드 실패. CSV 형식을 확인하세요.');
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">조직도 업로드</h1>
      <p className="text-sm text-gray-500 mb-6">
        Flex HR에서 내보낸 CSV 파일을 업로드하세요.<br />
        필요 컬럼: <code className="bg-gray-100 px-1 rounded text-xs">이름, 이메일, 부서, 직책, 리뷰어이메일</code>
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '업로드 중...' : '업로드'}
        </button>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {result && (
          <div className="bg-green-50 rounded-lg p-4 text-sm text-green-700">
            완료: 전체 {result.total}명 (신규 {result.created}명, 업데이트 {result.updated}명)
          </div>
        )}
      </div>
    </div>
  );
}
