'use client';

export default function FeedbackPage() {
  const feedbacks = [
    { id: '1', from: '팀장', type: 'KEEP_GOING', value: '', content: '좋은 아이디어 잘 반영했습니다!' },
    { id: '2', from: '관리자', type: 'IMPROVE', value: '', content: '다음엔 더 빠른 진행이 필요합니다.' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">나의 피드백</h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 font-medium">
          + 피드백 작성
        </button>
      </div>

      <div className="space-y-4">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    fb.type === 'KEEP_GOING'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {fb.type === 'KEEP_GOING' ? '좋은 점' : '개선점'}
                  </span>
                  <span className="text-sm text-gray-600">{fb.from}</span>
                </div>
                <p className="mt-3 text-gray-900">{fb.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
