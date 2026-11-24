'use client'; // 表單需要即時記住輸入內容、顯示「建立中」與錯誤訊息，故為 Client Component

import { useActionState, useState } from 'react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { REGIONS, type RegionCode } from '@/lib/regions';
import {
    parseTripForm,
    TRIP_DESCRIPTION_MAX,
    TRIP_TITLE_MAX,
    type TripFieldErrors,
} from '@/lib/trips';
import { createTrip, type CreateTripState } from '../actions';

const initialState: CreateTripState = { error: null, fieldErrors: {} };

const VISIBILITY_OPTIONS = [
    { value: 'private', emoji: '🔒', label: '私密', hint: '只有自己看得到' },
    { value: 'public', emoji: '🌏', label: '公開', hint: '會出現在公開大廳' },
] as const;

// 地區、公開私密共用的「卡片式單選」樣式：hover 夕陽橘細框，選中時海洋藍
const choiceCardClass =
    'flex cursor-pointer flex-col items-center gap-1 rounded-xl border bg-card p-3 text-sm transition hover:border-sunset has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50';

// 欄位下方的錯誤提示（取代瀏覽器預設的提示框）
function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return (
        <p id={id} className="text-sm text-destructive">
            {message}
        </p>
    );
}

// 「✍️ 人工新增」表單（4-3b-5）：填標題／描述／地區／公開私密 → 寫入 trips → 導向 /trips/[id]
export default function CreateTripForm({ onBack }: { onBack: () => void }) {
    // 把 Server Action（createTrip）交給 useActionState 包一層：
    // formAction 是包好的版本，送出時會呼叫 createTrip；state 是它回傳的結果；pending 是否送出中
    const [state, formAction, pending] = useActionState(createTrip, initialState);

    // 受控欄位（≈ v-model）：送出失敗時，已經填的內容不會被清空
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [region, setRegion] = useState<RegionCode | ''>('');
    const [visibility, setVisibility] = useState<'private' | 'public'>('private');

    // 前端檢查出來的錯誤；伺服器回傳的錯誤在 state.fieldErrors。兩者合併顯示，前端的優先
    const [clientErrors, setClientErrors] = useState<TripFieldErrors>({});
    const errors: TripFieldErrors = { ...state.fieldErrors, ...clientErrors };

    // 改了某個欄位，就把那個欄位的前端錯誤清掉
    const clearError = (field: keyof TripFieldErrors) =>
        setClientErrors((prev) => ({ ...prev, [field]: undefined }));

    // 送出前先在瀏覽器用同一套規則檢查（≈ Vue 的 @submit.prevent + 自己寫 validate()）
    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        const result = parseTripForm(new FormData(e.currentTarget));
        if (result.success) {
            setClientErrors({});
            return; // 通過：不攔截，React 接著呼叫 formAction → Server Action
        }
        e.preventDefault(); // 沒通過：攔下來，Server Action 不會被呼叫
        setClientErrors(result.fieldErrors);
        // 游標移到第一個有錯的欄位
        const firstInvalid = (['title', 'description', 'region'] as const).find(
            (field) => result.fieldErrors[field]
        );
        e.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
    };

    return (
        // noValidate：關掉瀏覽器預設的必填提示框，改用上面的 handleSubmit 和下方的 FieldError
        <form action={formAction} onSubmit={handleSubmit} noValidate className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="trip-title">行程標題</Label>
                <Input
                    id="trip-title"
                    name="title"
                    required
                    maxLength={TRIP_TITLE_MAX}
                    placeholder="例：香港三天兩夜吃爆行"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        clearError('title');
                    }}
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? 'trip-title-error' : undefined}
                />
                <FieldError id="trip-title-error" message={errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="trip-description">描述（選填）</Label>
                <Textarea
                    id="trip-description"
                    name="description"
                    maxLength={TRIP_DESCRIPTION_MAX}
                    placeholder="想去哪些地方、跟誰去、想怎麼玩…"
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value);
                        clearError('description');
                    }}
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? 'trip-description-error' : undefined}
                />
                <FieldError id="trip-description-error" message={errors.description} />
            </div>

            <fieldset
                className="grid gap-2"
                aria-describedby={errors.region ? 'trip-region-error' : undefined}
            >
                <legend className="mb-2 text-sm font-medium">地區</legend>
                <div className="grid grid-cols-3 gap-2">
                    {REGIONS.map((option) => (
                        <label
                            key={option.code}
                            className={cn(choiceCardClass, errors.region && 'border-destructive')}
                        >
                            <input
                                type="radio"
                                name="region"
                                value={option.code}
                                required
                                checked={region === option.code}
                                onChange={() => {
                                    setRegion(option.code);
                                    clearError('region');
                                }}
                                className="sr-only"
                            />
                            <span className="text-2xl leading-none">{option.flag}</span>
                            {option.label}
                        </label>
                    ))}
                </div>
                <FieldError id="trip-region-error" message={errors.region} />
            </fieldset>

            <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">誰看得到</legend>
                <div className="grid grid-cols-2 gap-2">
                    {VISIBILITY_OPTIONS.map((option) => (
                        <label key={option.value} className={choiceCardClass}>
                            <input
                                type="radio"
                                name="visibility"
                                value={option.value}
                                checked={visibility === option.value}
                                onChange={() => setVisibility(option.value)}
                                className="sr-only"
                            />
                            <span>
                                {option.emoji} {option.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{option.hint}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            {state.error && (
                <p role="alert" className="text-sm text-destructive">
                    ❌ {state.error}
                </p>
            )}

            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onBack} disabled={pending}>
                    ← 換一種方式
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                    {pending ? '建立中…' : '建立行程'}
                </Button>
            </div>
        </form>
    );
}
