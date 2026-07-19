// 個人行程總覽大廳（Server Component / SSR 預設）— 對應路由藍圖 4-3
// 透過 Server 端 Supabase Client 撈取「當前登入者」的行程，RLS 確保只回傳自己的資料。
// 本版先聚焦「讀取 + 網格呈現 + 空狀態」；AI 新增行程彈窗與 Unsplash 封面圖寫入留待下一步。

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Tables } from '@/types/supabase';
import LogoutButton from './_components/LogoutButton';

// 對應資料庫 trips 資料表的一列
type Trip = Tables<'trips'>;

export default async function TripsPage() {
    const supabase = await createSupabaseServerClient();

    // 1. 確認登入身分（middleware 已擋一層，這裡再取一次以便撈資料與雙保險）
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. 撈取行程；RLS（auth.uid() = user_id）會自動只回傳當前使用者的資料
    const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            <div className="mx-auto max-w-6xl px-6 py-12">
                {/* 頁首 */}
                <header className="mb-10 flex items-end justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900">我的行程</h1>
                        <p className="text-slate-500">規劃、收藏並管理屬於你們的濟州島旅程。</p>
                    </div>
                    <LogoutButton />
                </header>

                {/* 撈取失敗提示 */}
                {error && (
                    <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        ❌ 行程載入失敗：{error.message}
                    </p>
                )}

                {/* 空狀態 */}
                {!error && (!trips || trips.length === 0) && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <p className="text-lg text-slate-500">還沒有任何行程</p>
                        <p className="mt-1 text-sm text-slate-400">
                            之後可以在這裡用 AI 一鍵生成你的第一趟旅程 ✈️
                        </p>
                    </div>
                )}

                {/* 行程網格 */}
                {!error && trips && trips.length > 0 && (
                    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {trips.map((trip: Trip) => (
                            <Link
                                key={trip.id}
                                href={`/trips/${trip.id}`}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-[#FF8C42]/40 hover:shadow-md"
                            >
                                {/* Unsplash 封面圖預留區（cover_url 欄位尚未加入，先以佔位漸層呈現） */}
                                <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-sky-100 to-slate-100 text-sm text-slate-400">
                                    Unsplash 封面圖預留區
                                    <span
                                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                                            trip.is_public
                                                ? 'bg-sky-600 text-white'
                                                : 'bg-white/90 text-slate-500'
                                        }`}
                                    >
                                        {trip.is_public ? '公開中' : '私密'}
                                    </span>
                                </div>

                                {/* 卡片內容 */}
                                <div className="flex flex-1 flex-col gap-1 p-5">
                                    <h2 className="text-lg font-semibold text-slate-900 transition group-hover:text-[#FF8C42]">
                                        {trip.title}
                                    </h2>
                                    {trip.description && (
                                        <p className="line-clamp-2 text-sm text-slate-500">
                                            {trip.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}
