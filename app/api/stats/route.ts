import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Task from "@/app/lib/Task";

export async function GET() {
  await connectDB();
  const [total, todo, doing, done] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: "todo" }),
    Task.countDocuments({ status: "doing" }),
    Task.countDocuments({ status: "done" }),
  ]);

  return NextResponse.json({
    code: 200,
    data: { total, todo, doing, done },
  });
}