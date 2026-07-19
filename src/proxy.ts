import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 1. 在後端建立一個專屬伺服器端的 Supabase 客戶端
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 2. 獲取目前點擊網頁的使用者登入狀態
    const { data: { user } } = await supabase.auth.getUser();

    // 🔴 門禁邏輯：訪客（未登入）想進個人行程頁 /trips → 導回公開大廳首頁 /
    //    （對訪客而言首頁也是行程列表；登入入口改由首頁的「登入」按鈕明確提供）
    if (request.nextUrl.pathname.startsWith('/trips') && !user) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 🟢 門禁邏輯：如果使用者已經登入，卻還想去 `/login` 頁面
    if (request.nextUrl.pathname.startsWith('/login') && user) {
        // 直接幫他送進去後台行程頁面
        return NextResponse.redirect(new URL('/trips', request.url));
    }

    return response;
}

// 3. 設定此警衛需要看守的範圍（這裡指定看守 /trips 開頭與 /login 開頭的路由）
export const config = {
    matcher: ['/trips/:path*', '/login'],
};