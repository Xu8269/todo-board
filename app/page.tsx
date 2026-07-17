import Link from "next/link";
import connectDB from "@/app/lib/mongodb";
import Task from "@/app/lib/Task";
import FishTank from "@/app/components/FishTank";
import Calendar from "@/app/components/Calendar";
import ClearDoneButton from "@/app/components/ClearDoneButton";

export default async function HomePage() {
  await connectDB();
  const [total, todo, doing, done, tasksWithDeadlines] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: "todo" }),
    Task.countDocuments({ status: "doing" }),
    Task.countDocuments({ status: "done" }),
    Task.find({ deadline: { $ne: null }, status: { $ne: "done" } }).select("deadline").lean(),
  ]);

  const stats = { total, todo, doing, done };

  const deadlineDates = [...new Set(
    tasksWithDeadlines.map((t: { deadline: Date }) => {
      const d = new Date(t.deadline);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  )];

  return (
    <div style={{ padding: 40, maxWidth: 1024, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0, color: "var(--text-primary)" }}>仪表盘</h1>
        <ClearDoneButton />
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <Calendar deadlineDates={deadlineDates} />

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "全部任务", value: stats.total, color: "#3b82f6" },
            { label: "待办", value: stats.todo, color: "#6b7280" },
            { label: "进行中", value: stats.doing, color: "#f59e0b" },
            { label: "已完成", value: stats.done, color: "#10b981" },
          ].map((item) => (
            <div key={item.label} style={{ background: "var(--bg-card)", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{item.label}</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {stats.total === 0 && (
        <p style={{ color: "var(--text-secondary)", fontSize: 16, textAlign: "center", marginTop: 60 }}>
          暂无任务，去
          <Link href="/tasks/new" style={{ color: "#2563eb", marginLeft: 4 }}>创建一个 →</Link>
        </p>
      )}

      <FishTank />
    </div>
  );
}