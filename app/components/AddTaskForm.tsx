"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddTaskForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        content: form.get("content"),
        priority: form.get("priority"),
        deadline: form.get("deadline") || undefined,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/tasks");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560, margin: "40px auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ margin: 0 }}>新建任务</h2>

      <div>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>标题 *</label>
        <input name="title" required style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }} />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>详情</label>
        <textarea name="content" rows={4} style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }} />
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>优先级</label>
          <select name="priority" style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}>
            <option value="normal">普通</option>
            <option value="important">重要</option>
            <option value="urgent">紧急</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>截止日期</label>
          <input name="deadline" type="date" style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 0", background: loading ? "#93c5fd" : "#2563eb", color: "#fff",
          border: "none", borderRadius: 6, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "提交中..." : "创建任务"}
      </button>
    </form>
  );
}