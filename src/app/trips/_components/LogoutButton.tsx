'use client'; // 需要在瀏覽器端呼叫 signOut 與路由導向，故為 Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// 登出按鈕：清除 Supabase session（連同 Cookie），再導回登入頁。
// 依專案規劃採「編輯模式」而非獨立後台，故登出入口就放在 /trips 頁首。
export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh(); // 刷新讓 middleware 依最新（已清空）的 Cookie 重新判定身分
    };

    return (
        <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#FF8C42] hover:text-[#FF8C42] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? '登出中...' : '登出'}
        </button>
    );
}
