// 這是 Server Component (預設為 SSR)
// 此處的程式碼會在伺服器端執行，適合用來做 SEO 或從 Supabase 撈取初始旅遊資料

import TravelButton from './_components/TravelButton'; // 引入 Client 元件

export default async function HomePage() {
  // 假設這是在伺服器端撈取的公開旅遊景點資料
  const data = {
    title: "我的台北三日遊行程",
    description: "最私房的台北在地景點與美食規劃！"
  };

  return (
      <main className="p-8 max-w-2xl mx-auto space-y-6">
        {/* 這些標籤會直接被 SSR 渲染成 HTML 丟給瀏覽器，對 SEO 極佳 */}
        <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
        <p className="text-slate-600">{data.description}</p>

        <hr className="border-slate-200" />

        {/* 這裡導入了需要 SPA 互動的用戶端組件 */}
        <TravelButton />
      </main>
  );
}