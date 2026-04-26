"use client";
import { useState } from "react";
import { standupApi } from "@/lib/api";
import { X, Loader2, Copy, Check, Mail, Slack, RefreshCw, ClipboardList } from "lucide-react";

interface Props {
  projectId: number;
  projectName: string;
  onClose: () => void;
}

export function StandupModal({ projectId, projectName, onClose }: Props) {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await standupApi.generate(projectId);
      setReport(res.data.answer);
      setGenerated(true);
    } catch {
      setReport("Failed to generate standup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEmail = () => {
    const subject = encodeURIComponent(`Daily Standup — ${projectName} — ${new Date().toLocaleDateString()}`);
    const body = encodeURIComponent(report);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const openSlack = () => {
    // copies to clipboard with Slack formatting hint
    navigator.clipboard.writeText(report);
    alert("Report copied! Paste it into Slack.");
  };

  // Render report with emoji section headers highlighted
const renderReport = (text: string) => {
  return text.split("\n").map((line, i) => {
    // Remove ** bold markers
    const clean = line.replace(/\*\*/g, "");

    // Emoji section headers
    if (clean.startsWith("🟢") || clean.startsWith("🔵") ||
        clean.startsWith("🔴") || clean.startsWith("📊")) {
      return (
        <p key={i} className="font-semibold text-slate-900 mt-5 mb-2 text-sm tracking-wide">
          {clean}
        </p>
      );
    }

    // Bullet points (both * and -)
    if (clean.startsWith("* ") || clean.startsWith("- ")) {
      return (
        <div key={i} className="flex items-start gap-2 ml-2 mb-1">
          <span className="text-brand-500 mt-1 text-xs">●</span>
          <p className="text-sm text-slate-600 leading-relaxed">{clean.slice(2)}</p>
        </div>
      );
    }

    // Title line (contains project name)
    if (clean.includes("Daily Standup Report") || clean.includes("Project")) {
      return (
        <p key={i} className="text-sm font-semibold text-slate-800 mb-3">{clean}</p>
      );
    }

    if (clean.trim() === "") return <div key={i} className="h-1" />;

    return <p key={i} className="text-sm text-slate-600 leading-relaxed">{clean}</p>;
  });
};

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Daily Standup Report</h2>
              <p className="text-xs text-slate-400">{projectName} · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!generated && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-brand-500" />
              </div>
              <h3 className="text-slate-800 font-medium mb-2">Generate Today's Standup</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                AI will analyze your project's last 24h of activity, current progress, and blockers to write a standup report.
              </p>
              <button onClick={generate}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
                Generate Report
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Analyzing project activity...</p>
              <p className="text-xs text-slate-400 mt-1">Checking tasks updated in last 24h, blockers, and progress</p>
            </div>
          )}

          {generated && !loading && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              {renderReport(report)}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {generated && !loading && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <button onClick={generate}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>
            <div className="flex items-center gap-2">
              <button onClick={openEmail}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button onClick={openSlack}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600">
                <Slack className="w-3.5 h-3.5" /> Slack
              </button>
              <button onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
