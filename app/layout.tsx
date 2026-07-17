import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import { ThemeProvider } from "@/app/lib/ThemeContext";

export const metadata: Metadata = {
  title: "TaskPlanner",
  description: "任务看板系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body style={{ margin: 0, minHeight: "100vh", background: "var(--bg-page)" }}>
        <ThemeProvider>
          <Header />
          <main style={{ background: "var(--bg-page)" }}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}