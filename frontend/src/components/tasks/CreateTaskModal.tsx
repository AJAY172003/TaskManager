"use client";
import { useState } from "react";
import { tasksApi } from "@/lib/api";
import { X, Loader2 } from "lucide-react";

interface Props { projectId: number; onClose: () => void; onSuccess: () => void; }

export function CreateTaskModal({ projectId, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", status: "TODO", dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      setLoading(true);
      await tasksApi.create(projectId, { ...form, dueDate: form.dueDate || undefined });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create task");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Task title" className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={inputCls + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} className={inputCls}>
                {["LOW","MEDIUM","HIGH","URGENT"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls}>
                {["TODO","IN_PROGRESS","IN_REVIEW","DONE"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} className={inputCls} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
