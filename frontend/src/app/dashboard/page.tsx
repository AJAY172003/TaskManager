"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { useState } from "react";
import { Plus, FolderOpen, Loader2 } from "lucide-react";
import type { Project } from "@/types";

export default function DashboardPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { if (!token) router.push("/auth"); }, [token, router]);

  const { data, isLoading, refetch } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => { const res = await projectsApi.getAll(); return res.data; },
    enabled: !!token,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
            <p className="text-sm text-slate-500 mt-0.5">{data?.length ?? 0} projects</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : data?.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={refetch} />
            ))}
          </div>
        )}
      </main>
      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); refetch(); }} />}
    </div>
  );
}
