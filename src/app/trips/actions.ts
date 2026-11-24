'use server'; // 這個檔案裡的函式只在伺服器執行，前端呼叫時會自動變成一次 POST 請求

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { parseTripForm, type TripFieldErrors } from '@/lib/trips';

// 回傳給表單的狀態：成功時會直接 redirect，所以只需要表達「錯誤」
// - error：整體錯誤（登入過期、資料庫寫入失敗）
// - fieldErrors：各欄位的錯誤（驗證沒過）
export type CreateTripState = { error: string | null; fieldErrors: TripFieldErrors };

// 「✍️ 人工新增」表單送出時執行（4-3b-5）。
// 第一個參數是上一次的狀態，這是搭配 React useActionState 的固定寫法。
export async function createTrip(
    _prevState: CreateTripState,
    formData: FormData
): Promise<CreateTripState> {
    // 1. 伺服器端用同一套規則再驗證一次：前端的檢查可以被繞過，這裡不行
    const parsed = parseTripForm(formData);
    if (!parsed.success) return { error: null, fieldErrors: parsed.fieldErrors };
    const { title, description, region, isPublic } = parsed.data;

    // 2. 取得目前登入者（從 Cookie 判斷身分）
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: '登入已過期，請重新登入', fieldErrors: {} };

    // 3. 寫入 trips：user_id 一律用伺服器端的登入身分，不讀表單傳來的值；
    //    資料庫的 RLS（auth.uid() = user_id）還會再擋一次
    const { data, error } = await supabase
        .from('trips')
        .insert({
            title,
            description: description || null,
            region,
            is_public: isPublic,
            user_id: user.id,
        })
        .select('id')
        .single();

    if (error) return { error: `建立失敗：${error.message}`, fieldErrors: {} };

    // 4. 讓 /trips 列表下次顯示最新資料，再導向新行程頁（redirect 之後的程式不會執行）
    revalidatePath('/trips');
    redirect(`/trips/${data.id}`);
}
