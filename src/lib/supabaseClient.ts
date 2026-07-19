import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// 1. 從環境變數中讀取我們在 .env.local 設定好的連線憑證
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. 安全防範：確保環境變數有被正確讀取，如果漏掉就跳出警報，防止程式碼崩潰
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ 錯誤：找不到 Supabase 環境變數，請檢查 .env.local 檔案設定！');
}

// 3. 使用 @supabase/ssr 的 createBrowserClient 初始化「瀏覽器端」實例。
//    關鍵：它會將登入 session 寫進 Cookie（而非 localStorage），
//    如此 middleware.ts 與 Server Component 才能在伺服器端讀到相同的登入身分，
//    登入狀態得以跨 Server / Client 同步，避免登入後仍被踢回 /login。
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
