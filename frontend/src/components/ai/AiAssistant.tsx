"use client";
import { useState, useRef, useEffect } from "react";
import { aiApi } from "@/lib/api";
import { Bot, Send, X, ChevronDown, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "Summarize this project's progress",
  "Which tasks are high priority?",
  "What tasks are not yet started?",
  "How many tasks are done?",
];

export function AiAssistant({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI project assistant. Ask me anything about this project's tasks, progress, or priorities." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: "user", content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await aiApi.ask(projectId, question);
      setMessages(prev => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-50">
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-600 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">AI Assistant</p>
                <p className="text-white/70 text-xs">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                )}
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white rounded-tr-sm"
                    : "bg-slate-100 text-slate-800 rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-2 mt-1">
                  <Bot className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <div className="bg-slate-100 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-slate-400 mb-2">Suggested questions</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1.5 bg-brand-50 text-brand-700 rounded-full hover:bg-brand-100 transition-colors border border-brand-100">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask about this project..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                className="w-8 h-8 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
