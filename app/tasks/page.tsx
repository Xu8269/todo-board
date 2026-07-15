import connectDB from "@/app/lib/mongodb";
import Task from "@/app/lib/Task";
import TaskBoard from "@/app/components/TaskBoard";

async function refreshTasks() {
  "use server";
}

export default async function TasksPage() {
  await connectDB();
  const taskList = await Task.find().sort({ createdAt: -1 }).lean();
  const tasks = JSON.parse(JSON.stringify(taskList));

  return <TaskBoard taskList={tasks} refresh={refreshTasks} />;
}