'use client'; // 需要點擊開關 Modal、記住「目前選了哪種模式」，故為 Client Component

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import CreateTripForm from './CreateTripForm';

// 新增行程的兩種模式（PRD 第 5 節）；null 代表還停在「選擇模式」畫面
type CreateMode = 'manual' | 'ai' | null;

const MODE_OPTIONS = [
    {
        mode: 'manual',
        emoji: '✍️',
        title: '人工新增',
        description: '自己填標題、地區與描述，之後再慢慢加景點。',
    },
    {
        mode: 'ai',
        emoji: '🤖',
        title: 'AI 生成',
        description: '用一句話說出想怎麼玩，AI 幫你排好行程初稿。',
        comingSoon: 'AI 生成會在 4-3b-10 完成（需要先申請 Gemini 與 Unsplash 金鑰）。',
    },
] as const;

// 「新增行程」按鈕＋模式選擇 Modal：先選人工或 AI，再進入對應的表單
export default function CreateTripButton() {
    const [mode, setMode] = useState<CreateMode>(null);
    const selected = MODE_OPTIONS.find((option) => option.mode === mode);

    return (
        <Dialog
            // 等關閉動畫播完才重設回選擇畫面，避免關到一半畫面閃回去
            onOpenChangeComplete={(open) => {
                if (!open) setMode(null);
            }}
        >
            <DialogTrigger render={<Button size="lg" className="px-4" />}>＋ 新增行程</DialogTrigger>

            <DialogContent className="sm:max-w-md">
                {selected ? (
                    // 已選模式：人工新增顯示表單（4-3b-5）；AI 生成還在施工中（4-3b-10）
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                {selected.emoji} {selected.title}
                            </DialogTitle>
                            <DialogDescription>{selected.description}</DialogDescription>
                        </DialogHeader>
                        {selected.mode === 'manual' ? (
                            <CreateTripForm onBack={() => setMode(null)} />
                        ) : (
                            <>
                                <p className="rounded-lg border border-dashed bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
                                    🚧 {selected.comingSoon}
                                </p>
                                <Button variant="outline" onClick={() => setMode(null)}>
                                    ← 換一種方式
                                </Button>
                            </>
                        )}
                    </>
                ) : (
                    // 選擇模式畫面
                    <>
                        <DialogHeader>
                            <DialogTitle>新增行程</DialogTitle>
                            <DialogDescription>要用哪種方式建立這趟行程？</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3">
                            {MODE_OPTIONS.map((option) => (
                                <button
                                    key={option.mode}
                                    type="button"
                                    onClick={() => setMode(option.mode)}
                                    className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition outline-none hover:border-sunset focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    <span className="text-2xl leading-none">{option.emoji}</span>
                                    <span className="space-y-1">
                                        <span className="block font-medium">{option.title}</span>
                                        <span className="block text-sm text-muted-foreground">
                                            {option.description}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
