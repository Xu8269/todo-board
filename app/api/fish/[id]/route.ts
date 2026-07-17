import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Fish from "@/app/lib/Fish";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const fish = await Fish.findByIdAndUpdate(id, body, { new: true });
    if (!fish) {
      return NextResponse.json({ code: 400, msg: "鱼不存在" }, { status: 400 });
    }
    return NextResponse.json({ code: 200, data: fish });
  } catch (err) {
    console.error("PATCH /api/fish/[id] error:", err);
    return NextResponse.json({ code: 500, msg: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await Fish.findByIdAndDelete(id);
    return NextResponse.json({ code: 200, msg: "deleted" });
  } catch (err) {
    console.error("DELETE /api/fish/[id] error:", err);
    return NextResponse.json({ code: 500, msg: "服务器错误" }, { status: 500 });
  }
}