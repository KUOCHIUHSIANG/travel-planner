// 核心動態行程頁面（Server Component / SSR 預設）
// 對應路由藍圖 4-4：/trips/[id] 為單一動態頁，之後會在此實作 SSR 密碼攔截
// 與行程展示／編輯主體。目前先建立基礎骨架，尚未串接 Supabase 資料表。

// Next.js 15+ 起，動態路由的 params 為非同步（Promise），需以 await 解構。
interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  // 以 await 非同步解構出行程 id，符合最新型別規範
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm font-medium text-slate-400">行程 ID</p>
          <h1 className="text-2xl font-bold text-slate-900">{id}</h1>
        </header>

        {/* TODO(階段四)：SSR 密碼攔截、行程展示與所見即所得編輯器 */}
        <section className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-500">
            行程主體尚未建置，稍後將在此實作 SSR 暗號解鎖與行程編輯器。
          </p>
        </section>
      </div>
    </main>
  );
}
