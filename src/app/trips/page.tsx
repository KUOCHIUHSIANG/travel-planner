'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function TripsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true); // 正在檢查身分的狀態

    // 🟢 客戶端安全性攔截（相當於 Vue 2 的 mounted 階段進行 router 檢查）
    useEffect(() => {
        const checkUser = async () => {
            // 獲取目前本地真正的 Session 狀態
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // 如果根本沒有 Session，代表偷跑進來或已經登出了，立刻踢回登入頁
                router.push('/login');
            } else {
                // 確實有登入，結束載入狀態，顯示內容
                setCheckingAuth(false);
            }
        };

        checkUser().catch((err) => console.error(err));
    }, [router]);

    // 🛠️ 處理登出邏輯
    const handleSignOut = async () => {
        setLoading(true);

        // 1. 呼叫 Supabase 登出 API（清空雲端與本地 Token）
        await supabase.auth.signOut();

        alert('✅ 登出成功！將返回登入頁面。');

        // 2. 轉址並強制重新整理，清除 Next.js 瀏覽器端的路由快取
        router.push('/login');
        router.refresh();
        setLoading(false);
    };

    // 🟢 如果還在檢查身分中，先顯示空白或 Loading，避免畫面閃爍出暫存的內容
    if (checkingAuth) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#6b7280' }}>
                🔒 安全驗證中，請稍候...
            </div>
        );
    }

    // 🟢 驗證通過，才渲染出真正的保護內容
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                    ✈️ 我的行程規劃總覽
                </h1>

                <button
                    onClick={handleSignOut}
                    disabled={loading}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    {loading ? '登出中...' : '安全登出'}
                </button>
            </header>

            <main style={{ background: '#fff', padding: '3rem', borderRadius: '8px', border: '1px dashed #d1d5db', textAlign: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                    🎉 恭喜你成功登入！這裡是受保護的 `/trips` 路由頁面。
                </p>
            </main>
        </div>
    );
}