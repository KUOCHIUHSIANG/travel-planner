// 行程地區設定（PRD 第 2 節、ADR-0010）：表單、AI 生成、景點欄位都從這裡讀。
// 之後要加新地區（如日本）：在這裡加一筆，並同步修改資料庫 trips_region_check（見 supabase/schema-changes.sql）。
export const REGIONS = [
    { code: 'TW', flag: '🇹🇼', label: '台灣' },
    { code: 'HK', flag: '🇭🇰', label: '香港' },
    { code: 'KR', flag: '🇰🇷', label: '韓國' },
] as const;

// 'TW' | 'HK' | 'KR'，由上面的清單自動推導，不用手動維護
export type RegionCode = (typeof REGIONS)[number]['code'];

// 檢查任意值是不是合法的地區代碼（伺服器端驗證表單用）
export function isRegionCode(value: unknown): value is RegionCode {
    return REGIONS.some((region) => region.code === value);
}
