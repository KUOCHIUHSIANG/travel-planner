-- ============================================================
-- Supabase RLS 政策備份（Row Level Security）
-- ------------------------------------------------------------
-- 用途：本檔為 trips / destinations 兩張表的安全政策「原始碼備份」，
--       納入 Git 版控以利追溯、稽核與環境重建。
-- 套用方式：貼到 Supabase Dashboard → SQL Editor → Run（管理權限執行）。
-- 注意：CREATE POLICY 若政策已存在會報錯；重建前可先 DROP 同名政策。
-- ============================================================

-- ==========================================
-- 1. 啟用資料表的 RLS 機制 (必須先開啟，規則才會生效)
-- ==========================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. 針對「旅遊行程總表 (trips)」設定安全規則
-- ==========================================

-- 規則 A：允許任何人讀取被標記為「公開 (is_public = true)」的行程，或者讀取「自己建立」的行程
CREATE POLICY "允許讀取公開行程或自己的行程"
ON trips FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- 規則 B：只允許登入的使用者新增行程，且 user_id 必須是自己的 UID
CREATE POLICY "允許使用者新增自己的行程"
ON trips FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 規則 C：只允許行程擁有者修改自己的行程
CREATE POLICY "允許擁有者修改自己的行程"
ON trips FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 規則 D：只允許行程擁有者刪除自己的行程
CREATE POLICY "允許擁有者刪除自己的行程"
ON trips FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- 3. 針對「旅遊景點細項表 (destinations)」設定安全規則
-- ==========================================
-- 說明：景點是依附在行程底下的。我們透過「檢查該景點所屬的 trip 是否屬於目前使用者，或者該 trip 是否為公開」來決定權限。

-- 景點層級私密/驚喜旗標（ADR-0009）：預設 false（公開可見）
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_secret boolean NOT NULL DEFAULT false;

-- 讀取政策：擁有者看得到自己所有景點（含私密）；訪客僅看得到「公開行程中 is_secret = false」的景點
CREATE POLICY "允許讀取公開景點或自己的景點"
ON destinations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = destinations.trip_id
        AND (
            trips.user_id = auth.uid()                                  -- 擁有者：全部可見
            OR (trips.is_public = true AND destinations.is_secret = false)  -- 訪客：僅公開行程之非私密景點
        )
    )
);

CREATE POLICY "允許新增景點到自己的行程"
ON destinations FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = destinations.trip_id
        AND trips.user_id = auth.uid()
    )
);

CREATE POLICY "允許擁有者修改自己的景點"
ON destinations FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = destinations.trip_id
        AND trips.user_id = auth.uid()
    )
);

CREATE POLICY "允許擁有者刪除自己的景點"
ON destinations FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = destinations.trip_id
        AND trips.user_id = auth.uid()
    )
);
