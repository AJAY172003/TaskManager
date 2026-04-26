"use client";
import { tasksApi } from "@/lib/api";
import { priorityColors } from "@/lib/utils";
import { Calendar, User, Trash2 } from "lucide-react";
import type { Task } from "@/types";

interface Props { task: Task; projectId: number; onRefresh: () => void; }

export function TaskCard({ task, projectId, onRefresh }: Props) {
  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    await tasksApi.delete(projectId, task.id);
    onRefresh();
  };

  const handleStatusChange = async (status: string) => {
    await tasksApi.update(projectId, task.id, { ...task, status, dueDate: task.dueDate });
    onRefresh();
  };

  return (
    <div className="bg-white rounded-lg p-3.5 shadow-sm border border-slate-100 group hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <button onClick={handleDelete} className="text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-sm font-medium text-slate-800 mb-2 leading-snug">{task.title}</p>
      {task.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {task.dueDate && (
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
        )}
        {task.assigneeName && (
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assigneeName}</span>
        )}
      </div>
      {/* Quick status changer */}
      <select value={task.status} onChange={e => handleStatusChange(e.target.value)}
        className="mt-3 w-full text-xs border border-slate-100 rounded-md px-2 py-1 text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50">
        {["TODO","IN_PROGRESS","IN_REVIEW","DONE"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
      </select>
    </div>
  );
}
