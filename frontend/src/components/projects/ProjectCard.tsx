"use client";
import { useRouter } from "next/navigation";
import { projectsApi } from "@/lib/api";
import { statusColors } from "@/lib/utils";
import { CheckSquare, Trash2, ArrowRight } from "lucide-react";
import type { Project } from "@/types";

interface Props { project: Project; onDelete: () => void; }

export function ProjectCard({ project, onDelete }: Props) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this project?")) return;
    await projectsApi.delete(project.id);
    onDelete();
  };

  return (
    <div onClick={() => router.push(`/dashboard/projects/${project.id}`)}
      className="bg-white rounded-xl border border-slate-100 p-5 cursor-pointer hover:shadow-md hover:border-brand-200 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[project.status]}`}>
          {project.status}
        </span>
        <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{project.name}</h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[2.5rem]">{project.description || "No description"}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>{project.taskCount} tasks</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}
