// 公開行程大廳（Server Component / SSR 預設）
// 此頁在伺服器端渲染，適合 SEO 與撈取公開行程初始資料。
// 目前先以 Mock 資料呈現網格看板，Unsplash 封面圖區塊預留，待階段四串接 API。

// 公開行程卡片型別：對應未來 Supabase trips 資料表的公開欄位
interface PublicTrip {
  id: string;
  title: string;
  destination: string;
  coverUrl: string | null; // Unsplash 動態配圖網址，尚未串接時為 null
  dayCount: number;
  ownerName: string;
}

// TODO(階段四)：改由 Supabase 撈取 is_public = true 的公開行程
const MOCK_PUBLIC_TRIPS: PublicTrip[] = [
  {
    id: 'jeju-lovers',
    title: '濟州島雙人蜜月路線',
    destination: '濟州島 · 韓國',
    coverUrl: null,
    dayCount: 5,
    ownerName: '小傑',
  },
  {
    id: 'seoul-foodie',
    title: '首爾美食暴走三日',
    destination: '首爾 · 韓國',
    coverUrl: null,
    dayCount: 3,
    ownerName: '路人甲',
  },
  {
    id: 'busan-coast',
    title: '釜山海岸線散策',
    destination: '釜山 · 韓國',
    coverUrl: null,
    dayCount: 4,
    ownerName: '海風',
  },
];

export default async function HomePage() {
  const trips = MOCK_PUBLIC_TRIPS;

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* 頁首：公開行程大廳標題 */}
        <header className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">公開行程大廳</h1>
          <p className="text-slate-500">
            探索大家分享的濟州島與韓國旅遊路線，找靈感、抄作業。
          </p>
        </header>

        {/* 行程網格看板 */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-[#FF8C42]/40 hover:shadow-md"
            >
              {/* Unsplash 封面圖區塊（預留）：串接前顯示佔位漸層 */}
              <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-sky-100 to-slate-100">
                {trip.coverUrl ? (
                  // 之後改用 next/image 載入 Unsplash 定值網址
                  <img
                    src={trip.coverUrl}
                    alt={trip.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                    Unsplash 封面圖預留區
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                  {trip.dayCount} 天
                </span>
              </div>

              {/* 卡片內容 */}
              <div className="space-y-1 p-5">
                <h2 className="text-lg font-semibold text-slate-900 transition group-hover:text-[#FF8C42]">
                  {trip.title}
                </h2>
                <p className="text-sm text-slate-500">{trip.destination}</p>
                <p className="pt-2 text-xs text-slate-400">by {trip.ownerName}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
