"use client";

import { useState } from "react";
import { useTheme } from "@/app/lib/ThemeContext";
import EditTaskModal from "./EditTaskModal";

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

function isOverdue(task: Task) {
  if (!task.deadline || task.status === "done") return false;
  const today = new Date();
  const deadline = new Date(task.deadline);
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return deadline < today;
}

export default function TaskCard({ task, onRefresh }: { task: Task; onRefresh: () => void }) {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overdue = isOverdue(task);

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
    setConfirmDelete(false);
    onRefresh();
  };

  return (
    <>
      <div style={{
        background: overdue ? (isDark ? "#450a0a" : "#fef2f2") : colors.card,
        borderRadius: 8, padding: 16,
        borderLeft: `4px solid ${overdue ? "#ef4444" : priorityColor[task.priority]}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        outline: overdue ? `1px solid ${isDark ? "#7f1d1d" : "#fecaca"}` : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
          <strong style={{ color: colors.text }}>{task.title}</strong>
          <div style={{ display: "flex", gap: 6 }}>
            {overdue && (
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: "#ef4444", color: "#fff" }}>
                已逾期
              </span>
            )}
            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: priorityColor[task.priority], color: "#fff" }}>
              {priorityLabel[task.priority]}
            </span>
          </div>
        </div>

        {task.content && (
          <p style={{ fontSize: 14, color: colors.textSec, margin: "0 0 8px", lineHeight: 1.4, wordBreak: "break-word" }}>
            {task.content}
          </p>
        )}

        <div style={{ fontSize: 12, color: overdue ? "#ef4444" : colors.textMuted, marginBottom: 12 }}>
          {task.deadline && <span>截止: {task.deadline.slice(0, 10)}</span>}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => handleAction("status")}
            disabled={loading}
            style={{
              flex: 1, padding: "6px 0", fontSize: 13,
              background: task.status === "done" ? colors.border : "#2563eb",
              color: task.status === "done" ? colors.text : "#fff",
              border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "..." : statusLabel[task.status]}
          </button>
          <button
            onClick={() => setShowEdit(true)}
            style={{
              padding: "6px 12px", fontSize: 13,
              background: colors.border, color: colors.text,
              border: "none", borderRadius: 4, cursor: "pointer",
            }}
          >
            编辑
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              padding: "6px 12px", fontSize: 13,
              background: "#fee2e2", color: "#dc2626",
              border: "none", borderRadius: 4, cursor: "pointer",
            }}
          >
            删除
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.card, borderRadius: 12, padding: 28, width: 360,
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)", textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 8px", color: colors.text }}>确认删除</h3>
            <p style={{ color: colors.textSec, margin: "0 0 20px" }}>确定要删除「{task.title}」吗？此操作不可撤销。</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  flex: 1, padding: "10px 0", background: colors.border,
                  border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer", color: colors.text,
                }}
              >
                取消
              </button>
              <button
                onClick={() => handleAction("delete")}
                disabled={loading}
                style={{
                  flex: 1, padding: "10px 0", background: loading ? "#fca5a5" : "#ef4444", color: "#fff",
                  border: "none", borderRadius: 6, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <EditTaskModal task={task} onClose={() => setShowEdit(false)} onRefresh={onRefresh} />
      )}
    </>
  );
}