# 🗺️ 旅遊規劃專案開發進度表

這是我們穩紮穩打、一步一腳印的開發藍圖。每完成一個細項，我們就會在方框打勾 `[x]`。

---

## 📅 階段一：前置作業與環境對接 ✅ [100% 全數通關]
- [x] 1-1. 在 GitHub 建立 Remote Repository 並完成首次本機程式碼 Push 備份。
- [x] 1-2. 在本機專案根目錄設定 `.env.local`，正確填入 Supabase URL 與 Anon Key 程式碼環境變數。
- [x] 1-3. 建立前端 `src/lib/supabaseClient.ts` 初始化連線實例程式碼。（後續已改用 `@supabase/ssr` 的 `createBrowserClient`，讓 session 寫入 Cookie）

## 🗄️ 階段二：資料庫建置 (Supabase Backend) ✅ [100% 全數通關]
- [x] 2-1. 前往 Supabase SQL Editor 執行初始化資料表 Schema 腳本（建立景點與行程表）。
- [x] 2-2. 設定 Row Level Security (RLS) 安全防護原則，確保使用者程式碼只能讀寫自己的資料。
- [x] 2-3. 在本機執行 Supabase CLI 指令，自動生成對應資料庫的 TypeScript 型別定義檔案。

## 🔐 階段三：身分驗證系統 (Auth) ✅
- [x] 3-1. 在 `src/proxy.ts` 編寫伺服器端路由守衛程式碼（`createServerClient` + `getAll/setAll`；原 `middleware.ts`，見 ADR-0005）。
- [x] 3-2. 確保 Supabase 控制台 Email Auth 基礎功能啟用（並暫時停用 Google OAuth 以簡化流程）。
- [x] 3-3. 編寫前端 `/login` 頁面，實作「純帳號密碼註冊/登入」的 React Client UI 組件與核心邏輯，並處理好 `useEffect` 客戶端雙重安全攔截（消除 ESLint Promise 警告）。

## 🧠 階段 3.5：【核心功能與 UI 風格專題討論】 ✅ [100% 全數收斂定案]
- [x] 3.5-1. 確立 UI 組件庫、基礎色調配置與夕陽橘點綴比例。（詳細規格已移至 PRODUCT_REQUIREMENTS.md）
- [x] 3.5-2. 確立行程規劃器左右佈局、中韓雙語與複製按鈕規格。（詳細規格已移至 PRODUCT_REQUIREMENTS.md）
- [x] 3.5-3. 確立 SSR 密碼攔截機制、Cookie 寫入與路人模式分流。（詳細規格已移至 PRODUCT_REQUIREMENTS.md）
- [x] 3.5-4. 確立表情累加、🙅‍♂️ 合體技視覺效果與動態清除互斥邏輯。（詳細規格已移至 PRODUCT_REQUIREMENTS.md）
- [x] 3.5-5. 確立 Unsplash 自動配圖策略與 OGP 網頁預覽縮圖規格。（詳細規格已移至 PRODUCT_REQUIREMENTS.md）

## 🏗️ 階段四：核心功能開發 (行程與景點管理)
- [x] 4-1. **建立專案頁面路由藍圖**：在 `src/app` 下建立核心動態路由結構（首頁 `/`、`/login`、編輯兼解鎖頁 `/trips/[id]`），採取單一網頁動態切換編輯/唯讀身分機制。
- [x] 4-2. 編寫 `src/app/page.tsx` 使用 Server Component (SSR) 撈取並渲染公開旅遊行程（首頁形象看板）。
- [x] 4-3a. 實作 `/trips` 個人行程總覽大廳「讀取」：Server Component 透過 `createSupabaseServerClient` 撈取當前登入者行程（RLS 生效），呈現網格卡片、撈取失敗提示、空狀態與公開/私密標籤，並於頁首右上放置登出按鈕（登出後導回首頁 `/`）。
- [ ] 4-3b. 補完 `/trips` 的「AI 新增行程彈出視窗」與 Unsplash 封面圖寫入（需先於 `trips` 表新增 `cover_url` 欄位並重新生成型別）。
- [ ] 4-4. 建立高度互動的 `/trips/[id]` 動態頁面，實作 SSR 密碼驗證頁與行程展示/編輯主體。
- [ ] 4-5. **實作景點順序調整與時間計算**：實作景點排序（Sequence/Order）與跨國旅遊時區轉換。
- [ ] 4-6. 實作 API 呼叫程式碼與後端爬蟲邏輯，處理 OGP 網址預覽，以及表情符號 JSONB 欄位之非同步同步。
- [ ] 4-7. 實作「一鍵公開/私密」切換，更新資料庫 `is_public` 欄位與安全校驗。

## 🚀 階段五：生產環境部署與功能延伸 (Deployment & OAuth)
- [ ] 5-1. 於 Supabase 啟用並實作 Google 第三方快速登入按鈕。
- [ ] 5-2. 串接 Resend 免費 SMTP 服務，中文化驗證信。
- [ ] 5-3. **生產環境安全性審查 (Security Audit)**：全面檢查 Supabase RLS 防禦狀態，確保資料權限安全。
- [ ] 5-4. 在本機執行 `npm run build`，檢查 TypeScript 型別與編譯狀態。
- [ ] 5-5. 匯入 Vercel 平台進行自動化部署，取得免費網址正式上線。

---

> 📌 **技術決策與踩雷紀錄（ADR）** 已移至 [`docs/DECISIONS.md`](./docs/DECISIONS.md)；本進度表僅保留大方向勾選清單，不含實作細節。