-- ============================================================
-- Supabase 資料表結構變更紀錄（Schema Changes）
-- ------------------------------------------------------------
-- 用途：記錄 trips / destinations 每次「改欄位」的 SQL，納入 Git 版控，
--       方便追溯與環境重建。RLS 政策另見 supabase/policies.sql
--       （destinations.is_secret 欄位的 SQL 也放在那裡，因為它跟 RLS 一起改）。
-- 套用方式：貼到 Supabase Dashboard → SQL Editor → Run。
-- 規則：只往下新增、不改舊段落；每段標註日期與 DEVELOPMENT_PLAN 細項編號。
-- 改完結構後記得重新生成型別（見 docs/DECISIONS.md 附錄）。
-- ============================================================


-- ==========================================
-- 4-3b-1｜trips.cover_url：行程封面圖網址（2026-07，補記）
-- ==========================================
alter table public.trips
  add column if not exists cover_url text;


-- ==========================================
-- 4-3b-2｜多地區欄位（2026-11-23，ADR-0010）
-- ==========================================

-- 1. trips.region：行程地區，只允許 TW（台灣）／HK（香港）／KR（韓國）
--    先帶 default 'KR'，讓既有行程（原本都是濟州島）自動補上 KR
alter table public.trips
  add column if not exists region text not null default 'KR'
  constraint trips_region_check check (region in ('TW', 'HK', 'KR'));

-- 2. 拿掉 default：之後新增行程「必須」指定地區（對應 PRD：建立行程時必選）
alter table public.trips
  alter column region drop default;

-- 3. destinations.address：景點地址（韓國地區以韓文填寫）
alter table public.destinations
  add column if not exists address text;
