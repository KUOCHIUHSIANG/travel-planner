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
    const handleSignIn = async (e: React.SubmitEvent) => {
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
    const handleSignUp = async (e: React.SubmitEvent) => {
        e.preventDefault();
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: '#1f2937' }}>
                    🌍 智旅規劃幫
                </h1>

                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#4b5563' }}>電子信箱 (Email)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#4b5563' }}>密碼 (Password)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        />
                    </div>

                    {message && (
                        <p style={{ fontSize: '0.875rem', textAlign: 'center', color: message.startsWith('❌') ? '#ef4444' : '#10b981' }}>
                            {message}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ flex: 1, padding: '0.75rem', background: '#2563eb', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {loading ? '處理中...' : '登入'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={loading}
                            style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            註冊
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}