export default function Forbidden403() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-red-600">403</h1>
        <p className="mb-6 text-xl text-gray-700">접근 권한이 없습니다.</p>
        <a href="/" className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700">
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}
