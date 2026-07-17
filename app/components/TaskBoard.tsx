"use client";

import { useTheme } from "@/app/lib/ThemeContext";
import TaskCard from "./TaskCard";

type Task = {
  _id: string;
  title: string;
  content: string;
  status: "todo" | "doing" | "done";
  priority: "normal" | "important" | "urgent";
  deadline?: string;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; bg: string; darkBg: string }> = {
  todo:  { label: "待办", bg: "#f3f4f6", darkBg: "#1f2937" },
  doing: { label: "进行中", bg: "#fef3c7", darkBg: "#422006" },
  done:  { label: "已完成", bg: "#d1fae5", darkBg: "#064e3b" },
};

export default function TaskBoard({ taskList, refresh }: { taskList: Task[]; refresh: () => void }) {
  const theme = useTheme();
const isDark = theme.mounted ? theme.isDark : false;
const colors = theme.mounted ? theme.colors : {
  bg: "#f9fafb",
  text: "#374151",
  textSec: "#6b7280",
  textMuted: "#9ca3af",
  border: "#d1d5db",
  card: "#ffffff",
  header: "#ffffff",
  inputBg: "#ffffff",
};
  const columns = ["todo", "doing", "done"] as const;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, padding: 24, background: colors.bg }}>
      {columns.map((status) => {
        const tasks = taskList.filter((t) => t.status === status);
        const cfg = statusConfig[status];

        return (
          <div key={status} style={{ background: isDark ? cfg.darkBg : cfg.bg, borderRadius: 10, padding: 16, minHeight: 300 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, display: "flex", justifyContent: "space-between", color: colors.text }}>
              {cfg.label}
              <span style={{ fontSize: 14, color: colors.textSec }}>{tasks.length}</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} onRefresh={refresh} />
              ))}
              {tasks.length === 0 && (
                <p style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>暂无任务</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}