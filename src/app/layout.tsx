import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

// 變數名要叫 --font-sans，才會接上 globals.css 裡 shadcn 的 font-sans 設定
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trip Planner",
  description: "規劃並分享你的旅遊行程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning：Chrome 外掛（如 GrabIt）會在 React 接手前，往 <html>／<body> 塞自己的屬性，
    // 造成 hydration 警告。這個設定只忽略「這兩個標籤自己」的屬性差異，不影響裡面頁面內容的檢查。
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        {/* 全站共用的 Toast 容器：任何頁面呼叫 toast.add() 都會顯示在這裡 */}
        <Toaster />
      </body>
    </html>
  );
}
