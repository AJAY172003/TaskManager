"use client";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { LogOut, CheckSquare } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const handleLogout = () => { logout(); router.push("/auth"); };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CheckSquare className="text-brand-600 w-5 h-5" />
        <span className="font-semibold text-slate-800 tracking-tight">TaskFlow</span>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user.name}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
