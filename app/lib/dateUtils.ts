/**
 * 날짜를 한글 포맷으로 변환
 * @param dateString - ISO 또는 YYYY-MM-DD 형식의 날짜 문자열
 * @returns "4월 1일" 형식
 */
export function formatDateKo(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const month = date.getMonth() + 1; // 0-11이므로 +1
  const day = date.getDate();

  return `${month}월 ${day}일`;
}

/**
 * 날짜 범위를 한글 포맷으로 변환
 * @param startDate - 시작일 (ISO 또는 YYYY-MM-DD)
 * @param endDate - 종료일 (ISO 또는 YYYY-MM-DD)
 * @returns "4월 1일 ~ 6월 30일" 형식
 */
export function formatDateRangeKo(startDate: string, endDate: string): string {
  return `${formatDateKo(startDate)} ~ ${formatDateKo(endDate)}`;
}

/**
 * 타임스탬프를 한글 포맷으로 변환 (시간 포함)
 * @param dateString - ISO 형식의 날짜-시간 문자열
 * @returns "4월 1일 14:30" 형식
 */
export function formatDateTimeKo(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${month}월 ${day}일 ${hours}:${minutes}`;
}
