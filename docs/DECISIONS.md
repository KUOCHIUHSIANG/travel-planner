# 🧭 技術決策紀錄（Architecture Decision Records, ADR）

## 這份文件是什麼？為什麼要寫 ADR？

**ADR（Architecture Decision Record，架構決策紀錄）** 是一種輕量的文件慣例：**用一小段文字記錄「一個重要技術決策」的來龍去脈**。每一筆 ADR 通常包含三個重點：

- **情境（Context）**：當時遇到什麼問題、背景與限制。
- **決策（Decision）**：我們最後決定怎麼做。
- **影響（Consequences）**：這個決定帶來的好處與代價（含要注意的坑）。

**為什麼要寫？** 專案久了，程式碼只看得到「現在長怎樣」，看不到「當初為什麼這樣選」。ADR 就是把這些「看程式碼看不出來的判斷」保存下來，讓未來的自己、新協作者、或接手的 AI 一翻就懂，不必重新踩雷或考古。

> **編排原則**：ADR 本體一律**按編號、時間順序**排列（不可變的決策日誌），**不**依頁面或階段實體拆分——因為許多決策是跨頁面/跨階段的。若需要用「階段」或「頁面」角度查閱，請用下方索引表；每筆 ADR 標題下方也附有「關聯階段 / 影響範圍」標籤。每筆決策一旦採用（Accepted）原則上不修改；若日後推翻，另開新 ADR 並將舊的標記為「已取代（Superseded）」。

---

## 🔎 決策索引（可依階段或頁面查閱）

| ADR | 標題 | 關聯階段 | 影響範圍 / 頁面 | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| [0001](#adr-0001身分驗證採-supabasessr-的-cookie-機制) | 身分驗證採 `@supabase/ssr` Cookie | 階段三（Auth） | 全站：`proxy`、所有 Server Component、`/login`、`/trips` | Accepted |
| [0002](#adr-0002middlewarets-置於-src-目錄) | `middleware.ts` 置於 `src/` 目錄 | 階段 3-1 | `src/middleware.ts`（守 `/trips`、`/login`） | Accepted |
| [0003](#adr-0003採編輯模式切換單一動態頁不建獨立後台) | 編輯模式切換、不建獨立後台 | 階段 4-1 / 4-4 | 頁面：`/trips/[id]` | Accepted |
| [0004](#adr-0004登出後導向公開首頁-登入頁不主動出現) | 登出導向首頁、登入頁不主動出現 | 階段 4-3 | 頁面：`/trips`（登出鈕）、`/` | Accepted |
| [0005](#adr-0005將-middleware-遷移為-proxyts) | 將 middleware 遷移為 `proxy.ts` | 階段 3-1 | `src/proxy.ts`（守 `/trips`、`/login`） | Accepted |
| [0006](#adr-0006訪客存取-trips-導回首頁首頁登入入口依-session-變臉) | 訪客 `/trips` 導回首頁、登入入口依 session 變臉 | 階段 4 | `src/proxy.ts`、`/`、`/trips` | Accepted |
| [0007](#adr-0007ai-行程生成採-gemini--route-handler--unsplash) | AI 行程生成採 Gemini + Route Handler + Unsplash | 階段 4-3b | `/api/trips/generate`、`AiCreateTripModal`、`trips`/`destinations` | Accepted |
| [0008](#adr-0008行程詳細頁地圖與距離採-google-maps-platform) | 行程詳細頁地圖與距離採 Google Maps Platform | 階段 4-8 | `/trips/[id]`、`destinations`(lat/lng) | Accepted |

> 環境設定（非決策）的踩雷備忘見文末[附錄](#-附錄環境設定備忘非決策但換環境會重踩)。

---

## ADR-0001：身分驗證採 `@supabase/ssr` 的 Cookie 機制

- **關聯階段**：階段三（身分驗證系統 Auth）
- **影響範圍**：全站 —— `src/proxy.ts`、所有 Server Component、`/login`、`/trips`
- **狀態**：Accepted
- **情境**：最初 `src/lib/supabaseClient.ts` 用 `@supabase/supabase-js` 的 `createClient`，它預設把登入 session 存在瀏覽器 `localStorage`。但本專案有 Next.js middleware 與 Server Component，需要在**伺服器端**判定身分，而伺服器讀不到 `localStorage` → 導致「登入成功卻仍被踢回 `/login`」。
- **決策**：
  - 瀏覽器端改用 `@supabase/ssr` 的 **`createBrowserClient`**（`src/lib/supabaseClient.ts`），session 改寫入 **Cookie**。
  - 伺服器端一律透過 **`src/lib/supabaseServer.ts` 的 `createSupabaseServerClient()`**（`await cookies()` + `getAll/setAll`）建立帶身分的連線，讓 RLS 生效。
- **影響**：
  - ✅ 三端（瀏覽器 / middleware / Server Component）共用同一份 Cookie 身分，登入狀態同步。
  - ✅ session 不落在 `localStorage`，降低 XSS 直接竊取憑證的風險。
  - ⚠️ 新增任何需要登入身分的 Server Component / Route Handler，都要用 `createSupabaseServerClient()`，**不要**再 `new` 一個 `createClient`。

---

## ADR-0002：`middleware.ts` 置於 `src/` 目錄

- **關聯階段**：階段 3-1（伺服器端路由守衛）
- **影響範圍**：`src/middleware.ts`（守衛 `/trips`、`/login`）
- **狀態**：Accepted
- **情境**：Next.js 允許 `middleware.ts` 放在專案根目錄或 `src/`，但只能擇一。本專案採 `src/` 結構（`src/app`、`src/lib`…）。初期置於根目錄，雖可運作，但與「原始碼集中於 `src/`」的慣例不一致。
- **決策**：`git mv` 搬至 **`src/middleware.ts`**，與其餘原始碼集中，保持根目錄清爽；維持 `createServerClient` + `getAll/setAll` 成對 API。已用 `next build` 驗證仍正確掛載（輸出顯示 `ƒ Proxy (Middleware)`），`tsc` 亦 exit 0。
- **影響**：
  - ✅ 統一守衛 `/trips` 與 `/login`，搬遷後功能無損、已驗證。
  - ✅ 所有原始碼收斂於 `src/`，根目錄只留設定檔與文件。
  - ⚠️ 文件若提及路徑，應寫 `src/middleware.ts`（非根目錄）。
  - 📌 曾修正一個 bug（commit `f860fe7`）：`request.cookies.set(name, value, ...options)` 誤把物件 `options` 用展開語法當第三參數；`request.cookies.set` 只接受 `(name, value)`，options 應僅用於 `response.cookies.set`。此錯由 `npm run build`／`tsc` 靜態揪出（該 `setAll` callback 僅在 token 刷新時才觸發，故先前潛伏未爆）。
  - ✅ 後續已於 **ADR-0005** 將檔案遷移為 `src/proxy.ts`（本 ADR 的路徑描述為當時歷史狀態）。

---

## ADR-0003：採「編輯模式切換」單一動態頁，不建獨立後台

- **關聯階段**：階段 4-1（路由藍圖）／ 4-4（詳細頁）
- **影響範圍**：頁面 `/trips/[id]`
- **狀態**：Accepted
- **情境**：行程既要能被擁有者編輯（CRUD），也要能被路人唯讀分享。可以做「前台 + 獨立後台」兩套，或「同一頁依身分切換模式」。
- **決策**：採**同一個 `/trips/[id]` 動態頁**，依身分即時切換「編輯 / 唯讀」，**不另建管理後台**。
- **影響**：
  - ✅ 頁面與程式碼更精簡，符合 PRD 精神（避免自我放飛做多餘後台）。
  - ✅ 分享連結與編輯連結是同一個網址，動線單純。
  - ⚠️ 該頁需仔細處理權限分流（擁有者 / 路人 `?mode=public` / SSR 密碼攔截）。

---

## ADR-0004：登出後導向公開首頁 `/`，登入頁不主動出現

- **關聯階段**：階段 4-3（個人大廳與登出）
- **影響範圍**：頁面 `/trips`（登出按鈕）、`/`（首頁）
- **狀態**：Accepted
- **情境**：登出後可導回 `/login` 或導回公開首頁 `/`。
- **決策**：登出後 `router.push('/')` 回到**公開行程大廳**；`/login` **不主動出現**，僅在使用者點「我的行程」進入 `/trips` 而未登入時，由 middleware 自動導向。
- **影響**：
  - ✅ 一般訪客動線以公開大廳為主，登入是「需要時才觸發」的隱性入口。
  - ✅ 登出後仍停在有內容的頁面，不會落在冷清的登入框。

---

## ADR-0005：將 middleware 遷移為 `proxy.ts`

- **關聯階段**：階段 3-1（伺服器端路由守衛）
- **影響範圍**：`src/proxy.ts`（守衛 `/trips`、`/login`）
- **狀態**：Accepted（取代 ADR-0002 的檔名/函式名部分）
- **情境**：Next.js 16.2 起，`middleware` 檔案慣例被**標記為棄用**（`next build` 會警告 `The "middleware" file convention is deprecated. Please use "proxy" instead.`）。官方將其更名為 `proxy`，以更精準表達「應用程式前方的網路代理層」語意，並鼓勵開發者盡量避免依賴此功能。專案方針為**避免任何棄用寫法**。
- **決策**：依官方遷移指引，將 **`src/middleware.ts` → `src/proxy.ts`**、匯出函式 **`middleware` → `proxy`**；`config`（`matcher`）維持不變。內部 Supabase `createServerClient` + `getAll/setAll` 邏輯不變。
- **影響**：
  - ✅ 消除 `next build` 的棄用警告，採用當前官方慣例。
  - ✅ 經 `next build` 驗證仍顯示 `ƒ Proxy (Middleware)`、`tsc` exit 0，門禁功能無損。
  - ⚠️ 日後文件與程式碼一律以 `src/proxy.ts` / `proxy` 稱之，勿再用 `middleware`。
  - 📌 官方另提供 codemod：`npx @next/codemod@canary middleware-to-proxy .`（本次因檔案單純，直接手動改名 + 改函式名）。

---

## ADR-0006：訪客存取 `/trips` 導回首頁、首頁登入入口依 session 變臉

- **關聯階段**：階段 4（動線與身分分流）
- **影響範圍**：`src/proxy.ts`、頁面 `/`、`/trips`
- **狀態**：Accepted（延伸 ADR-0004 的動線設計）
- **情境**：`/trips` 是需登入的個人行程列表。原本訪客撲空時 proxy 導向 `/login`，且「登入」的唯一入口正是首頁「我的行程」按鈕 → `/trips` → 被導去 `/login`。若單純把訪客 `/trips` 改導向首頁 `/`，會使「我的行程 → /trips → 回首頁」形成**死循環，登入頁永遠到不了**。
- **決策**：
  - `proxy.ts`：訪客（未登入）存取 `/trips` → 導回**首頁 `/`**（對訪客而言首頁也是行程列表，體驗較友善）。
  - 首頁 `/` 右上按鈕**依 session 變臉**：未登入顯示「登入」（→ `/login`）、已登入顯示「我的行程」（→ `/trips`）——讓登入入口明確且不消失。
  - `/trips` 頁面級安全網 `redirect()` 同步改為 `/`，與 proxy 一致。
  - 保留 ADR 既有行為：已登入者存取 `/login` 仍導向 `/trips`。
  - `/trips` 頁首於「登出」左側加一顆「公開大廳」按鈕（→ `/`），讓登入者能回到公開首頁。
- **影響**：
  - ✅ 訪客不再撞登入牆，落在有內容的公開大廳。
  - ✅ 登入入口改為首頁明確按鈕，不再依賴 `/trips` 撲空，杜絕死循環。
  - ⚠️ 首頁因需讀取 session（`supabase.auth.getUser()`）而為動態渲染（原本亦是動態）。

---

## ADR-0007：AI 行程生成採 Gemini + Route Handler + Unsplash

- **關聯階段**：階段 4-3b（AI 新增行程）
- **影響範圍**：`src/app/api/trips/generate/route.ts`、`src/components/AiCreateTripModal.tsx`、資料表 `trips`／`destinations`
- **狀態**：Accepted
- **情境**：需在 `/trips` 提供「用一句自然語言生成行程初稿」的功能。此規劃源自使用者既有的 Gemini 版本設計，並以**成本**為主要考量（採 Google AI Studio 免費額度）。功能規格詳見 `PRODUCT_REQUIREMENTS.md` 第 5 節。
- **決策**：
  - **入口**：`/trips` 一顆「新增行程」按鈕 → 模式選擇 Modal（✍️ 人工新增 / 🤖 AI 生成）。人工路徑核心為純 CRUD；AI 路徑走以下生成流程。兩者建立後共用同一套 `/trips/[id]` 編輯器。
  - **封面圖統一走後端**：人工與 AI 兩路徑取 Unsplash 圖片皆透過**共用的伺服器端 Route Handler**（如 `/api/cover`），Unsplash Key 只在後端。人工路徑額外提供「輸入關鍵字 → 生成／重新生成」互動；AI 路徑則以生成的英文關鍵字自動取圖。
  - **跨語言關鍵字（翻譯層重用 Gemini）**：Unsplash 搜尋以英文 metadata 為主，中/韓文查詢效果差。故人工封面關鍵字若非英文，後端**重用 Gemini** 正規化為英文羅馬拼音（可一併回傳 zh/ko/en），再查 Unsplash——**不額外申請翻譯 API**（避開 Google Cloud Translation 需計費的負擔）。因此 Gemini key 申請順序**提前**至封面功能之前（採方案 B）。
  - **額度**：Unsplash 免費 Demo 約 50 次/小時（以官方後台為準），每次生成/重生成算一次；若觸發翻譯亦各算一次 Gemini 呼叫。UI 須防呆並在達限時提示。
  - **AI 模型**：使用 **Google Gemini API**（免費額度），要求以結構化 JSON 回傳（標題、天數、每日景點、代表英文關鍵字）。
  - **架構**：前端 Modal → 後端 **Route Handler `POST /api/trips/generate`** 統一處理生成、取圖、寫入；**API 金鑰只在伺服器端**（環境變數不加 `NEXT_PUBLIC_`），杜絕外洩。
  - **封面圖**：以 AI 回傳的英文關鍵字呼叫 **Unsplash API**，將圖片 URL 定值存入 `trips.cover_url`。
  - **寫入**：以 Supabase 伺服器端實例寫入 `trips` + `destinations`，`user_id` 綁當前登入者、受 RLS 保護；完成後導向 `/trips/[id]`。
  - **可覆寫原則**：AI 生成的景點僅為初稿，使用者於 `/trips/[id]` 編輯器可人工新增／中間插入／修改／刪除／排序（實作歸屬 4-4／4-5）。
- **影響**：
  - ✅ 金鑰不落前端；生成、取圖、寫入集中於單一後端端點，易於維護與防呆。
  - ✅ 免費額度，個人專案成本為零。
  - ⚠️ 引入本專案**首個外部 AI 依賴（Gemini）**；未來若要改用其他模型（如 Claude），只需替換 Route Handler 內的生成段落，前端與資料流不受影響。
  - ⚠️ 需申請並保管兩把外部 API Key（Gemini、Unsplash），屬換環境要重做的設定。

---

## ADR-0008：行程詳細頁地圖與距離採 Google Maps Platform

- **關聯階段**：階段 4-8（`/trips/[id]` 地圖與景點距離）
- **影響範圍**：頁面 `/trips/[id]`、資料表 `destinations`（新增 `lat`／`lng`）、地圖與距離之後端 Route Handler
- **狀態**：Accepted
- **情境**：`/trips/[id]` 需顯示各景點位置與**景點間距離**，協助評估當天動線。使用者在「Google Maps（最準，需綁卡計費）」與「免費 OpenStreetMap + 直線距離」之間，選擇 **Google Maps** 以取得準確的距離／行車時間。功能規格見 `PRODUCT_REQUIREMENTS.md` 第 6 節。
- **決策**：
  - 採 **Google Maps Platform**：地圖顯示用 **Maps JavaScript API**，距離計算用 **Distance Matrix／Directions API**。
  - `destinations` 新增 **`lat`／`lng`** 欄位；座標來源後續決定（Geocoding／AI／手動）。
  - **金鑰處理**：前端 Maps JS 金鑰無法完全隱藏，須以 **HTTP referrer 限制網域**；距離計算改走**後端 Route Handler** 保護金鑰並集中計費控管。
  - 多天展示採「全部總覽／單日聚焦」混合切換；景點跨天移動改 `day_number`、同日排序改 `sort_order`（既有欄位，無需改表）。
- **影響**：
  - ✅ 取得最準確的距離／路線資訊。
  - ⚠️ **本專案首個需綁定信用卡、開啟計費的服務**（Google Cloud）；雖有每月免費額度，仍須留意超額計費與用量監控。
  - ⚠️ 需管理景點座標來源；前端金鑰僅能靠 referrer／白名單防濫用，無法完全隱藏。
  - 💡 若日後想避免綁卡，替代方案為 OpenStreetMap + Leaflet + Haversine 直線距離（另開 ADR 評估）。

---

## 📌 附錄：環境設定備忘（非決策，但換環境會重踩）

這些屬於 **Supabase 後台設定**，不存在於 Git 程式碼內，換專案 / 新環境需手動重做：

- **Data API 需「兩層」開啟**（關聯階段二／影響 `/`、`/trips` 所有撈取）：Dashboard → Settings → API → Data API：
  1. **Exposed schemas** 需含 `public`；
  2. **Exposed tables** 需**逐一 toggle** 開啟 `trips`、`destinations`。
  - 症狀：Policies 頁表頭出現 `API DISABLED`、前端 `.from()` 撈不到資料。
  - 「Automatically expose new tables」建議維持關閉，日後新建表須手動補開。
- **RLS 政策原始碼備份於 [`supabase/policies.sql`](../supabase/policies.sql)**（已版控）：`trips` 用 `auth.uid() = user_id`；`destinations` 用 `EXISTS` 反查母行程的擁有權 / 公開狀態。
