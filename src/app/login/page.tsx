'use client'; // 標記為 Client Component，允許在瀏覽器端使用 useState 與路由導向

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // 🛠️ 1. 處理「純電子信箱/密碼登入」邏輯
    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // 呼叫 Supabase 內建的密碼驗證 API
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setMessage(`❌ 登入失敗：${error.message}`);
        } else {
            setMessage('✅ 登入成功！正在跳轉...');
            router.push('/trips'); // 登入成功後，將使用者引導至行程規劃頁面
            router.refresh();      // 刷新頁面狀態，促使 Middleware 重新偵測最新 Cookie 憑證
        }
        setLoading(false);
    };

    // 🛠️ 2. 處理「純電子信箱/密碼註冊」邏輯
    const handleSignUp = async () => {
        setLoading(true);
        setMessage('');

        // 呼叫 Supabase 內建的信箱註冊 API
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            setMessage(`❌ 註冊失敗：${error.message}`);
        } else {
            setMessage('🎉 註冊成功！請檢查你的 Email 信箱進行收信驗證（或直接嘗試登入）。');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
                <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
                    🌍 智旅規劃幫
                </h1>

                <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-600">
                            電子信箱 (Email)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none transition focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-600">
                            密碼 (Password)
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none transition focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30"
                        />
                    </div>

                    {message && (
                        <p
                            className={`text-center text-sm ${
                                message.startsWith('❌') ? 'text-red-500' : 'text-emerald-600'
                            }`}
                        >
                            {message}
                        </p>
                    )}

                    <div className="mt-2 flex gap-3">
                        {/* 主視覺：湛藍海洋色；Hover / Focus 以夕陽橘做細節點綴 */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-sky-600 px-4 py-3 font-bold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? '處理中...' : '登入'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="flex-1 rounded-lg border border-sky-600 px-4 py-3 font-bold text-sky-600 transition hover:border-[#FF8C42] hover:text-[#FF8C42] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            註冊
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
