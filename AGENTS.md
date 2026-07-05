<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md - Next.js Coding Standards

## Project Environment
- Framework: Next.js 16+ (App Router)
- Language: TypeScript (Strict Mode)
- Styling: Tailwind CSS
- Database/Auth: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)

## Code Generation Rules
1. **Default to Server Components**: Every page/component under `src/app` must be a Server Component by default. Do NOT use `"use client"` unless interactive features (e.g., `useState`, `useEffect`, `onClick`) are explicitly required.
2. **Data Fetching**: Fetch data directly within Server Components using `async/await`. Do NOT use standard React `useEffect` data fetching in Server Components.
3. **Path Aliases**: Always use the `@/*` prefix to reference the `src/` directory (e.g., `import { supabase } from '@/lib/supabaseClient'`). Do NOT use relative paths like `../../`.
4. **Type Safety**: Avoid using `any`. Every database entity must map to the auto-generated TypeScript types from Supabase.
<!-- END:nextjs-agent-rules -->
