import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Task from "@/app/lib/Task";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ code: 400, msg: "任务不存在" }, { status: 400 });
    }
    return NextResponse.json({ code: 200, data: task });
  } catch (err) {
    console.error("GET /api/tasks/[id] error:", err);
    return NextResponse.json({ code: 500, msg: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.priority) updateData.priority = body.priority;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.deadline !== undefined) updateData.deadline = body.deadline;

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
    if (!task) {
      return NextResponse.json({ code: 400, msg: "任务不存在" }, { status: 400 });
    }
    return NextResponse.json({ code: 200, data: task });
  } catch (err) {
    console.error("PATCH /api/tasks/[id] error:", err);
    return NextResponse.json({ code: 500, msg: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return NextResponse.json({ code: 400, msg: "任务不存在" }, { status: 400 });
    }
    return NextResponse.json({ code: 200, msg: "deleted" });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return NextResponse.json({ code: 500, msg: "服务器错误" }, { status: 500 });
  }
}