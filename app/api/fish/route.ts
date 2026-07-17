import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Fish from "@/app/lib/Fish";

export async function GET() {
  try {
    await connectDB();
    const list = await Fish.find().sort({ createdAt: -1 });
    return NextResponse.json({ code: 200, data: list });
  } catch (err) {
    console.error("GET /api/fish error:", err);
    return NextResponse.json({ code: 500, msg: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.drawing) {
      return NextResponse.json({ code: 400, msg: "缺少名字或绘制数据" }, { status: 400 });
    }

    const fish = await Fish.create({
      name: body.name,
      drawing: body.drawing,
      weight: body.weight || 10,
      size: body.size || 40,
      baseSize: 40,
      ate: 0,
    });

    return NextResponse.json({ code: 200, data: fish });
  } catch (err) {
    console.error("POST /api/fish error:", err);
    return NextResponse.json({ code: 500, msg: "服务器错误" }, { status: 500 });
  }
}