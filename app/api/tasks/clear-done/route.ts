import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Task from "@/app/lib/Task";

export async function DELETE() {
  try {
    await connectDB();
    const result = await Task.deleteMany({ status: "done" });
    return NextResponse.json({ code: 200, msg: `已清除 ${result.deletedCount} 个已完成任务` });
  } catch (err) {
    console.error("DELETE /api/tasks/clear-done error:", err);
    return NextResponse.json({ code: 500, msg: "服务器错误" }, { status: 500 });
  }
}