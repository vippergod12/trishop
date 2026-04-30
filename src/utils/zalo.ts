/**
 * Build URL Zalo chat từ env config.
 * Ưu tiên VITE_ZALO_URL (cho phép Zalo OA dạng https://zalo.me/oa/xxx),
 * fallback sang VITE_ZALO_PHONE → https://zalo.me/{phone}
 */
const RAW_PHONE = (import.meta.env.VITE_ZALO_PHONE ?? '').toString().trim();
const RAW_URL = (import.meta.env.VITE_ZALO_URL ?? '').toString().trim();

function normalizePhone(phone: string): string {
  // Bỏ khoảng trắng, dấu chấm, dấu cách, prefix +84
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  if (cleaned.startsWith('+84')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('84') && cleaned.length === 11) return '0' + cleaned.slice(2);
  return cleaned;
}

export const ZALO_PHONE = RAW_PHONE ? normalizePhone(RAW_PHONE) : '';

export const ZALO_URL: string = (() => {
  if (RAW_URL) return RAW_URL;
  if (ZALO_PHONE) return `https://zalo.me/${ZALO_PHONE}`;
  return '';
})();

export const ZALO_ENABLED = Boolean(ZALO_URL);
