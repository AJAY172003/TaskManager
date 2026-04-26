"use client";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectsApi, tasksApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { AiAssistant } from "@/components/ai/AiAssistant";
import { StandupModal } from "@/components/ai/StandupModal";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Loader2, ClipboardList } from "lucide-react";
import type { Task } from "@/types";

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "DONE", label: "Done" },
];

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = parseInt(id);
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showStandup, setShowStandup] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => { const res = await projectsApi.getById(projectId); return res.data; },
  });

  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ["tasks", projectId],
    queryFn: async () => { const res = await tasksApi.getByProject(projectId); return res.data; },
  });

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-full px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="text-slate-400 hover:text-slate-700 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{project?.name}</h1>
              {project?.description && (
                <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowStandup(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
              <ClipboardList className="w-4 h-4 text-brand-500" />
              Daily Standup
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {COLUMNS.map(col => (
              <TaskColumn key={col.key} label={col.label} status={col.key}
                tasks={tasksByStatus[col.key] || []}
                projectId={projectId} onRefresh={refetch} />
            ))}
          </div>
        )}
      </main>

      {/* AI Chat Assistant — floating bottom right */}
      <AiAssistant projectId={projectId} />

      {/* Modals */}
      {showCreate && (
        <CreateTaskModal projectId={projectId}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); refetch(); }} />
      )}
      {showStandup && project && (
        <StandupModal projectId={projectId}
          projectName={project.name}
          onClose={() => setShowStandup(false)} />
      )}
    </div>
  );
}
