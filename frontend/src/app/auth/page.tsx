"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { CheckSquare, Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginForm) => {
    try {
      setError("");
      const res = await authApi.login(data.email, data.password);
      setAuth(res.data.token, { name: res.data.name, email: res.data.email, role: res.data.role });
      router.push("/dashboard");
    } catch (e: any) { setError(e.response?.data?.error || "Login failed"); }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      setError("");
      const res = await authApi.register(data.name, data.email, data.password);
      setAuth(res.data.token, { name: res.data.name, email: res.data.email, role: res.data.role });
      router.push("/dashboard");
    } catch (e: any) { setError(e.response?.data?.error || "Registration failed"); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-600 rounded-2xl mb-3">
            <CheckSquare className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TaskFlow</h1>
          <p className="text-sm text-slate-500 mt-1">Project & task management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all capitalize ${
                  mode === m ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}>{m}</button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">{error}</div>
          )}

          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className={labelCls}>Email</label>
                <input {...loginForm.register("email")} type="email" placeholder="you@example.com" className={inputCls} />
                {loginForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input {...loginForm.register("password")} type={showPass ? "text" : "password"} placeholder="••••••••" className={inputCls + " pr-10"} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loginForm.formState.isSubmitting}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {loginForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input {...registerForm.register("name")} placeholder="Ajay Kumar" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input {...registerForm.register("email")} type="email" placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input {...registerForm.register("password")} type="password" placeholder="Min 6 characters" className={inputCls} />
              </div>
              <button type="submit" disabled={registerForm.formState.isSubmitting}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {registerForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
