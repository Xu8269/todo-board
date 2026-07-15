import mongoose, { Schema, Document } from "mongoose";

// ---- TypeScript 类型定义 ----
export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "normal" | "important" | "urgent";

export interface ITask extends Document {
  title: string;
  content: string;
  status: TaskStatus;
  priority: Priority;
  deadline?: Date;
  createdAt: Date;
}

// ---- Mongoose Schema ----
const TaskSchema = new Schema<ITask>({
  title:     { type: String, required: true },
  content:   { type: String, default: "" },
  status:    { type: String, enum: ["todo", "doing", "done"], default: "todo" },
  priority:  { type: String, enum: ["normal", "important", "urgent"], default: "normal" },
  deadline:  { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// 防止开发模式热重载重复创建 model
const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;