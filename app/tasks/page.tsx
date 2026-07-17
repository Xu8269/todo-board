import { revalidatePath } from "next/cache";
import connectDB from "@/app/lib/mongodb";
import Task from "@/app/lib/Task";
import TaskBoard from "@/app/components/TaskBoard";
export const dynamic = "force-dynamic";
async function refreshTasks() {
  "use server";
  revalidatePath("/tasks");
}

export default async function TasksPage() {
  await connectDB();
  const taskList = await Task.aggregate([
    {
      $addFields: {
        sortPriority: {
          $switch: {
            branches: [
              { case: { $eq: ["$priority", "urgent"] }, then: 1 },
              { case: { $eq: ["$priority", "important"] }, then: 2 },
              { case: { $eq: ["$priority", "normal"] }, then: 3 },
            ],
            default: 4,
          },
        },
      },
    },
    { $sort: { sortPriority: 1, deadline: 1 } },
  ]);
  const tasks = JSON.parse(JSON.stringify(taskList));

  return <TaskBoard taskList={tasks} refresh={refreshTasks} />;
}