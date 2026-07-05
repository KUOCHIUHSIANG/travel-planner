// 關鍵字宣告：告訴 Next.js 這是一個 Client Component (SPA 模式)
"use client";

import { useState } from 'react';

export default function TravelButton() {
    // SPA 模式下才能使用的 React State，用來控制收藏狀態
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const handleSave = () => {
        setIsSaved(!isSaved);
        // 未來這裡會編寫呼叫 Supabase API 儲存行程的程式碼
        console.log(isSaved ? "取消收藏" : "成功加入我的行程！");
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500 mb-2">點擊按鈕測試前端 SPA 互動狀態：</p>
            <button
                onClick={handleSave}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                    isSaved
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {isSaved ? '★ 已加入行程' : '☆ 收藏此行程'}
            </button>
        </div>
    );
}