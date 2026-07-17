"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/lib/ThemeContext";

const fallbackColors = {
  border: "#d1d5db",
  text: "#374151",
  textSec: "#6b7280",
  header: "#ffffff",
};

export default function Header() {
  const pathname = usePathname();
  const theme = useTheme();
  const colors = theme.mounted ? theme.colors : fallbackColors;

  const links = [
    { href: "/", label: "仪表盘" },
    { href: "/tasks", label: "任务看板" },
    { href: "/tasks/new", label: "新建任务" },
  ];

  return (
    <header style={{ borderBottom: `1px solid ${colors.border}`, padding: "12px 24px", background: colors.header }}>
      <nav style={{ display: "flex", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: colors.text }}>TaskPlanner</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                color: pathname === link.href ? "#2563eb" : colors.textSec,
                fontWeight: pathname === link.href ? 600 : 400,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          onClick={theme.toggle}
          style={{
            background: "none", border: `1px solid ${colors.border}`,
            borderRadius: 6, padding: "6px 14px", fontSize: 14,
            color: colors.text, cursor: "pointer",
          }}
        >
          {theme.mounted ? (theme.isDark ? "☀️ 亮色" : "🌙 深色") : " "}
        </button>
      </nav>
    </header>
  );
}