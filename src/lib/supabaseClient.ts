import { createClient } from '@supabase/supabase-js';

// 1. 從環境變數中讀取我們剛剛在 .env.local 設定好的連線憑證
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. 安全防範：確保環境變數有被正確讀取，如果漏掉就跳出警報，防止程式碼崩潰
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ 錯誤：找不到 Supabase 環境變數，請檢查 .env.local 檔案設定！');
}

// 3. 正式初始化 Supabase 客戶端實例並導出（Export）
// 未來專案中不論是 SSR 還是在 SPA 元件中要讀寫資料，全部都呼叫這個實例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);