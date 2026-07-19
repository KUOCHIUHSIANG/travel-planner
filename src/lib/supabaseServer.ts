import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// 🟢 Server 端專用的 Supabase Client 工廠
// 用於 Server Component / Route Handler，透過 Cookie 帶入登入者身分，
// 讓資料庫 RLS（auth.uid() = user_id）能在伺服器端正確生效。
// 對比 Vue 2：這相當於在 SSR 階段幫每個請求各自建立一個「帶身分」的資料連線。
export async function createSupabaseServerClient() {
    // Next.js 16 起 cookies() 為非同步，必須 await 取得本次請求的 Cookie 容器
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // 在 Server Component 中呼叫 setAll 會拋錯（唯讀），可安全忽略；
                        // Session 的更新交由根目錄 middleware.ts 負責寫回 Cookie。
                    }
                },
            },
        }
    );
}
