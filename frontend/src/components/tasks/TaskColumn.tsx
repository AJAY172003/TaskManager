"use client";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/types";

interface Props {
  label: string; status: string;
  tasks: Task[]; projectId: number; onRefresh: () => void;
}

const colColors: Record<string, string> = {
  TODO: "bg-slate-400",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-purple-500",
  DONE: "bg-green-500",
};

export function TaskColumn({ label, status, tasks, projectId, onRefresh }: Props) {
  return (
    <div className="flex flex-col bg-slate-100 rounded-xl p-3 min-h-[500px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${colColors[status]}`} />
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
        <span className="ml-auto text-xs text-slate-400 font-medium">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} projectId={projectId} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  );
}
