import { isRegionCode, type RegionCode } from '@/lib/regions';

// 行程欄位的長度上限：表單（maxLength）與驗證函式共用同一組數字
export const TRIP_TITLE_MAX = 100;
export const TRIP_DESCRIPTION_MAX = 500;

// 驗證通過後拿到的乾淨資料
export type TripFormInput = {
    title: string;
    description: string;
    region: RegionCode;
    isPublic: boolean;
};

// 每個欄位各自的錯誤訊息（沒有錯就沒有那個 key）
export type TripFieldErrors = {
    title?: string;
    description?: string;
    region?: string;
};

// 解析＋驗證「人工新增」表單。
// 前端送出前（即時提示）和 Server Action 寫入前（真正把關）都呼叫這一個函式，規則與訊息只寫一次。
export function parseTripForm(
    formData: FormData
): { success: true; data: TripFormInput } | { success: false; fieldErrors: TripFieldErrors } {
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const rawRegion = formData.get('region');
    const region = isRegionCode(rawRegion) ? rawRegion : null;
    const fieldErrors: TripFieldErrors = {};

    if (!title) fieldErrors.title = '請填寫行程標題';
    else if (title.length > TRIP_TITLE_MAX) fieldErrors.title = `行程標題最多 ${TRIP_TITLE_MAX} 個字`;
    if (description.length > TRIP_DESCRIPTION_MAX) {
        fieldErrors.description = `描述最多 ${TRIP_DESCRIPTION_MAX} 個字`;
    }
    if (!region) fieldErrors.region = '請選擇地區';

    if (!region || Object.keys(fieldErrors).length > 0) {
        return { success: false, fieldErrors };
    }
    return {
        success: true,
        data: { title, description, region, isPublic: formData.get('visibility') === 'public' },
    };
}
