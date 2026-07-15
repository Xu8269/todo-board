"use client";

import { useState } from "react";

type Task = {
  _id: string;
  title: string;
  content: string;
  status: "todo" | "doing" | "done";
  priority: "normal" | "important" | "urgent";
  deadline?: string;
  createdAt: string;
};

const priorityLabel: Record<string, string> = { normal: "普通", important: "重要", urgent: "紧急" };
const priorityColor: Record<string, string> = { normal: "#6b7280", important: "#f59e0b", urgent: "#ef4444" };
const nextStatus: Record<string, string> = { todo: "doing", doing: "done", done: "todo" };
const statusLabel: Record<string, string> = { todo: "开始进行", doing: "标记完成", done: "重置" };

export default function TaskCard({ task, onRefresh }: { task: Task; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "status" | "delete") => {
    setLoading(true);
    if (action === "status") {
      await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus[task.status] }),
      });
    } else {
      await fetch(`/api/tasks/${task._id}`, { method: "DELETE" });
    }
    setLoading(false);
    onRefresh();
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 8, padding: 16,
      borderLeft: `4px solid ${priorityColor[task.priority]}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
        <strong>{task.title}</strong>
        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: priorityColor[task.priority], color: "#fff" }}>
          {priorityLabel[task.priority]}
        </span>
      </div>

      {task.content && (
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 8px", lineHeight: 1.4, wordBreak: "break-word" }}>
          {task.content}
        </p>
      )}

      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
        {task.deadline && <span>截止: {task.deadline.slice(0, 10)}</span>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => handleAction("status")}
          disabled={loading}
          style={{
            flex: 1, padding: "6px 0", fontSize: 13,
            background: task.status === "done" ? "#f3f4f6" : "#2563eb",
            color: task.status === "done" ? "#374151" : "#fff",
            border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : statusLabel[task.status]}
        </button>
        <button
          onClick={() => handleAction("delete")}
          disabled={loading}
          style={{
            padding: "6px 12px", fontSize: 13,
            background: "#fee2e2", color: "#dc2626",
            border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          删除
        </button>
      </div>
    </div>
  );
}