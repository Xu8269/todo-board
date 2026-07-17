"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeContextType = {
  isDark: boolean;
  toggle: () => void;
  mounted: boolean;
  colors: {
    bg: string;
    card: string;
    text: string;
    textSec: string;
    textMuted: string;
    border: string;
    header: string;
    inputBg: string;
  };
};

const lightColors = {
  bg: "#f9fafb",
  card: "#ffffff",
  text: "#374151",
  textSec: "#6b7280",
  textMuted: "#9ca3af",
  border: "#d1d5db",
  header: "#ffffff",
  inputBg: "#ffffff",
};

const darkColors = {
  bg: "#111827",
  card: "#1f2937",
  text: "#f3f4f6",
  textSec: "#d1d5db",
  textMuted: "#9ca3af",
  border: "#374151",
  header: "#1f2937",
  inputBg: "#374151",
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [isDark]);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle, mounted, colors: isDark ? darkColors : lightColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}