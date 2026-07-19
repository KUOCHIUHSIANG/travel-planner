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
| [0001](#adr-0001身分驗證採-supabasessr-的-cookie-機制) | 身分驗證採 `@supabase/ssr` Cookie | 階段三（Auth） | 全站：`middleware`、所有 Server Component、`/login`、`/trips` | Accepted |
| [0002](#adr-0002middlewarets-置於-src-目錄) | `middleware.ts` 置於 `src/` 目錄 | 階段 3-1 | `src/middleware.ts`（守 `/trips`、`/login`） | Accepted |
| [0003](#adr-0003採編輯模式切換單一動態頁不建獨立後台) | 編輯模式切換、不建獨立後台 | 階段 4-1 / 4-4 | 頁面：`/trips/[id]` | Accepted |
| [0004](#adr-0004登出後導向公開首頁-登入頁不主動出現) | 登出導向首頁、登入頁不主動出現 | 階段 4-3 | 頁面：`/trips`（登出鈕）、`/` | Accepted |

> 環境設定（非決策）的踩雷備忘見文末[附錄](#-附錄環境設定備忘非決策但換環境會重踩)。

---

## ADR-0001：身分驗證採 `@supabase/ssr` 的 Cookie 機制

- **關聯階段**：階段三（身分驗證系統 Auth）
- **影響範圍**：全站 —— `middleware.ts`、所有 Server Component、`/login`、`/trips`
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
  - 💡 待議：Next.js 16.2 起 `middleware` 命名慣例已棄用，官方建議改為 `proxy.ts`；目前仍可運作，未來另開 ADR 評估遷移。

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

## 📌 附錄：環境設定備忘（非決策，但換環境會重踩）

這些屬於 **Supabase 後台設定**，不存在於 Git 程式碼內，換專案 / 新環境需手動重做：

- **Data API 需「兩層」開啟**（關聯階段二／影響 `/`、`/trips` 所有撈取）：Dashboard → Settings → API → Data API：
  1. **Exposed schemas** 需含 `public`；
  2. **Exposed tables** 需**逐一 toggle** 開啟 `trips`、`destinations`。
  - 症狀：Policies 頁表頭出現 `API DISABLED`、前端 `.from()` 撈不到資料。
  - 「Automatically expose new tables」建議維持關閉，日後新建表須手動補開。
- **RLS 政策原始碼備份於 [`supabase/policies.sql`](../supabase/policies.sql)**（已版控）：`trips` 用 `auth.uid() = user_id`；`destinations` 用 `EXISTS` 反查母行程的擁有權 / 公開狀態。
