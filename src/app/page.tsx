// 公開行程大廳（Server Component / SSR 預設）
// 於伺服器端撈取「所有公開行程 (is_public = true)」渲染成看板，適合 SEO。
// RLS 的 SELECT 政策允許任何人讀取公開行程，因此路人也看得到這頁。

import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Tables } from '@/types/supabase';

// 對應資料庫 trips 資料表的一列
type Trip = Tables<'trips'>;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  // 只撈公開行程；private 行程會被 .eq('is_public', true) 過濾掉，
  // 私密行程即使是自己的也不會出現在公開大廳（驗證分流用）。
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* 頁首：公開行程大廳標題 + 登入入口 */}
        <header className="mb-10 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">公開行程大廳</h1>
            <p className="text-slate-500">
              探索大家分享的濟州島與韓國旅遊路線，找靈感、抄作業。
            </p>
          </div>
          <Link
            href="/trips"
            className="shrink-0 rounded-lg border border-sky-600 px-4 py-2 text-sm font-medium text-sky-600 transition hover:border-[#FF8C42] hover:text-[#FF8C42]"
          >
            我的行程
          </Link>
        </header>

        {/* 撈取失敗提示 */}
        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            ❌ 公開行程載入失敗：{error.message}
          </p>
        )}

        {/* 空狀態 */}
        {!error && (!trips || trips.length === 0) && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-lg text-slate-500">目前還沒有任何公開行程</p>
            <p className="mt-1 text-sm text-slate-400">
              把你的行程設為「公開」，就會出現在這裡 ✈️
            </p>
          </div>
        )}

        {/* 行程網格看板 */}
        {!error && trips && trips.length > 0 && (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip: Trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}?mode=public`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-[#FF8C42]/40 hover:shadow-md"
              >
                {/* Unsplash 封面圖區塊（cover_url 欄位尚未加入，先以佔位漸層呈現） */}
                <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-sky-100 to-slate-100 text-sm text-slate-400">
                  Unsplash 封面圖預留區
                  <span className="absolute right-3 top-3 rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
                    公開中
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
