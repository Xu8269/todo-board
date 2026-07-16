"use client";

import { useState, FormEvent } from "react";

type Task = {
  _id: string;
  title: string;
  content: string;
  status: "todo" | "doing" | "done";
  priority: "normal" | "important" | "urgent";
  deadline?: string;
  createdAt: string;
};

export default function EditTaskModal({
  task,
  onClose,
  onRefresh,
}: {
  task: Task;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    await fetch(`/api/tasks/${task._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        content: form.get("content"),
        priority: form.get("priority"),
        deadline: form.get("deadline") || undefined,
      }),
    });

    setLoading(false);
    onClose();
    onRefresh();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12, padding: 28, width: 480,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        <h3 style={{ margin: 0 }}>编辑任务</h3>

        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>标题</label>
          <input
            name="title" defaultValue={task.title} required
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>详情</label>
          <textarea
            name="content" defaultValue={task.content} rows={3}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>优先级</label>
            <select
              name="priority" defaultValue={task.priority}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
            >
              <option value="normal">普通</option>
              <option value="important">重要</option>
              <option value="urgent">紧急</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>截止日期</label>
            <input
              name="deadline" type="date" defaultValue={task.deadline?.slice(0, 10) || ""}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            type="button" onClick={onClose}
            style={{
              flex: 1, padding: "10px 0", background: "#f3f4f6", border: "none",
              borderRadius: 6, fontSize: 15, cursor: "pointer",
            }}
          >
            取消
          </button>
          <button
            type="submit" disabled={loading}
            style={{
              flex: 1, padding: "10px 0", background: loading ? "#93c5fd" : "#2563eb", color: "#fff",
              border: "none", borderRadius: 6, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}