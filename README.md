# 🍊 Trip Planner（travel-planner）

跟朋友出遊用的旅遊行程規劃網站，目前支援台灣、香港、韓國三個地區（見 [ADR-0010](./docs/DECISIONS.md)），同時也是負責人從 Vue 2 轉 React／Next.js 的練功專案。

- **技術**：Next.js 16（App Router）、TypeScript、Tailwind CSS、Supabase（`@supabase/ssr`）
- **GitHub**：`KUOCHIUHSIANG/travel-planner`

---

## 📁 文件地圖

| 文件 | 用途 |
| :--- | :--- |
| [CLAUDE.md](./CLAUDE.md) | AI 協作的最高行為準則（每次開工必讀） |
| [AGENTS.md](./AGENTS.md) | Next.js 程式碼撰寫規範 |
| [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) | 產品規格書（功能細節以此為準） |
| [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) | 開發進度勾選表 |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | 技術決策紀錄（ADR）與環境設定備忘 |
| [supabase/policies.sql](./supabase/policies.sql) | RLS 政策備份 |

---

## 🚀 本機啟動

1. 在專案根目錄建立 `.env.local`，填入自己 Supabase 專案的值（**不要 commit**）：

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

2. 安裝並啟動：

   ```bash
   npm install
   npm run dev
   ```

3. 打開 <http://localhost:3000>。

---

## 🤝 協作模式：AI 主寫、負責人主審（2026-11-16 起）

### 為什麼要改

- **兩個目標並重**：
  1. 練出能幫助跳槽的 React／Next.js 技能（負責人是 Vue 2 背景）。
  2. 把網站真的做出來，跟朋友出遊時用得上。
- **原本的節奏太慢**：原本是「AI 一步一步教、負責人每步回報」。上一個 commit 停在 2026-07-19，隔了約 4 個月才在 2026-11-16 繼續，專案很容易停擺。
- **但也不全部交給 AI**：這個專案已經有 AI 寫錯、要靠人發現的例子：
  - `8edb762`：瀏覽器端沒用 `createBrowserClient`，登入狀態寫不進 Cookie。
  - `76fed3f`：`middleware.ts` 在 Next 16.2 被棄用，要遷移成 `proxy.ts`。
  - `is_secret` 的 RLS：新舊政策同名，要查 `pg_policies` 才能確認真的生效。
- **原則**：負責人不需要自己寫得出每一行，但要**看得出哪裡怪**。

### 分工

| 類型 | 做法 | 本專案的例子 |
| :--- | :--- | :--- |
| 🤖 **直接交給 AI** | AI 寫完，負責人看結果、跑跑看 | 安裝 shadcn/ui、排版、CRUD 表單、型別、串 API 的瑣碎程式 |
| 🧠 **要真的弄懂** | AI 寫完後，用 Vue 2 對比講解 1～3 個關鍵觀念 | Server／Client Component 的分界、`useState`／`useEffect`、資料流 |
| 🔐 **一定要懂，且負責人親自驗收** | AI 解釋為什麼這樣寫，並提供「能不能被繞過」的測試步驟，由負責人親手測 | SSR 暗號攔截、`trip_unlock_[id]` Cookie 隔離、RLS、API 金鑰不外洩 |
| ✍️ **負責人自己寫** | AI 給骨架和提示，負責人寫完後 AI 再 review | 😍／🫩／🛒／🙅‍♂️ 表情互斥邏輯（PRD 第 4 節，練 `useReducer`） |

### 每一步的流程

1. AI 一次完成 `DEVELOPMENT_PLAN.md` 裡的**一個細項**（例如 4-3b-3），直接寫進本機，不跨細項。
2. AI 說明這段程式裡**最值得懂的 1～3 個觀念**（可用 Vue 2 對比）。
3. AI 列出驗收步驟，負責人跑起來確認，看不懂的地方再問。
4. 新學到的觀念記進 Notion 學習筆記。
5. commit 訊息先給負責人過目，同意後才 commit／push，push 時一併同步 Notion 進度表。

---

## 🔑 帳號與授權規範

### 原則

- 本專案只用負責人自己的兩個個人 Gmail（repo 是公開的，所以這裡不寫完整 email）：
  - **主帳號 Gmail**：GitHub 主要 email，之後新申請的服務都用這個。
  - **Notion 用 Gmail**：Notion 使用的帳號，也是 GitHub 的備用 email。
- 本專案的 git commit 作者改用 **GitHub 匿名 email**（`…@users.noreply.github.com`，設在 repo 的 `git config --local`），避免在公開 repo 露出 email。
- **claude.ai 是公司帳號**。掛在 claude.ai 上的 connector（Vercel、Gmail、Google Drive、Figma、monday 等）可能連到公司或同事的帳號，**本專案一律不用**。
- 需要串接服務時，改用負責人自己在 Claude Code 本機加的 MCP（例如 Notion），或直接到服務官網操作。
- 任何 connector／MCP／CLI **第一次使用前，先確認登入的是下表指定的帳號**。確認不了就先問負責人，不要先用再說。

### 服務清單

| 服務 | 帳號 | 連線方式 | 狀態 |
| :--- | :--- | :--- | :--- |
| GitHub | `KUOCHIUHSIANG`（主帳號 Gmail） | `git push`（HTTPS remote） | ✅ 使用中 |
| Supabase | 主帳號 Gmail（以 GitHub 登入） | Dashboard、`npx --yes supabase` CLI | ✅ 2026-11-16 已確認帳號 |
| Notion | Notion 用 Gmail | Claude Code 使用者層級的 MCP（`https://mcp.notion.com/mcp`） | ✅ 2026-11-16 已確認帳號 |
| Vercel | 主帳號 Gmail | Vercel 網頁 Import GitHub repo | ⏳ 尚未部署（5-5） |
| Google AI Studio（Gemini） | 主帳號 Gmail | 金鑰放 `.env.local`，僅伺服器端使用 | ⏳ 尚未申請（4-3b-5） |
| Unsplash | 主帳號 Gmail | 金鑰放 `.env.local`，僅伺服器端使用 | ⏳ 尚未申請（4-3b-5） |
| Google Cloud（Maps，需綁卡） | 主帳號 Gmail | 前端金鑰限制 referrer，距離計算走後端 | ⏳ 尚未申請（4-8-2） |
| claude.ai connectors | ⚠️ 公司帳號 | — | ❌ 本專案不用 |

### Notion 授權方式

1. 在終端機進到專案目錄，執行 `claude`。
2. 輸入 `/mcp` → 選 `notion` → **Authenticate**，瀏覽器會開 Notion 授權頁。
3. 授權時確認登入的是 **Notion 用 Gmail**。

### Vercel 部署方式（5-5）

- **不要用 claude.ai 的 Vercel connector**：它綁的是同事的帳號，用了專案會建到別人的 Vercel 底下。
- 改用 Vercel 網頁登入**主帳號 Gmail** → **Import GitHub repo `KUOCHIUHSIANG/travel-planner`** → 之後每次 push 自動部署。
- **不裝 Vercel CLI**：連相依套件約 395 MB，這台 Mac 可用空間只剩約 20 GB。
