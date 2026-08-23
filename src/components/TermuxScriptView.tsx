import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  ShieldAlert, 
  Sparkles, 
  FileCode, 
  HelpCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react';

export const TermuxScriptView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 w-full space-y-6 text-neutral-200 text-sm">
      
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Termux CLI Commands & Permission Setup
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Learn how <code className="text-emerald-400 font-mono">pkg install termux-server</code> and <code className="text-emerald-400 font-mono">termux:server start</code> work in real Termux.
          </p>
        </div>
      </div>

      {/* Step 1: One-Line Quick Install */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-white text-base">
              Termux me One-Line Command Run Karein (Installation)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
            Automated Setup
          </span>
        </div>

        <p className="text-xs text-neutral-300">
          Apne Termux terminal me yeh command paste karein. Yeh saari required dependencies (ttyd, tools) install karke <code className="text-emerald-300 font-mono">termux:server</code> command bana dega:
        </p>

        <div className="relative bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-emerald-400 flex items-center justify-between">
          <code>curl -fsSL https://raw.githubusercontent.com/termux/termux-server/main/scripts/install.sh | bash</code>
          <button
            id="copy-install-cmd"
            onClick={() => copySnippet('install', 'curl -fsSL https://raw.githubusercontent.com/termux/termux-server/main/scripts/install.sh | bash')}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium flex items-center gap-1.5 transition ml-2 shrink-0 border border-neutral-700"
          >
            {copiedId === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === 'install' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Step 2: Termux Permission (RUN_COMMAND) Configuration */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-950 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-white text-base">
              Termux Permanent Permissions Setup (allow-external-apps)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-500/30 font-mono">
            Mandatory for Bridge
          </span>
        </div>

        <p className="text-xs text-neutral-300">
          Termux security policy external apps ko directly command run karne se rokti hai jab tak <code className="text-blue-300 font-mono">allow-external-apps = true</code> enable na ho. Iske liye yeh single command chalayein:
        </p>

        <div className="relative bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-blue-400 flex items-center justify-between">
          <code>{'mkdir -p ~/.termux && echo "allow-external-apps = true" >> ~/.termux/termux.properties && termux-reload-settings'}</code>
          <button
            id="copy-perm-cmd"
            onClick={() => copySnippet('perm', 'mkdir -p ~/.termux && echo "allow-external-apps = true" >> ~/.termux/termux.properties && termux-reload-settings')}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium flex items-center gap-1.5 transition ml-2 shrink-0 border border-neutral-700"
          >
            {copiedId === 'perm' ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === 'perm' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Step 3: Run & Access Termux Live */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-white text-base">
              Termux:Server Start & Full Access at http://phone-ip:8080/
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
            Live Web Terminal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Start Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Start Server</span>
              <button
                onClick={() => copySnippet('start', 'termux:server start')}
                className="text-xs text-neutral-400 hover:text-white"
              >
                {copiedId === 'start' ? '✓' : 'Copy'}
              </button>
            </div>
            <code className="block bg-neutral-900 p-2 rounded text-xs font-mono text-emerald-300 font-bold">
              termux:server start
            </code>
            <p className="text-[11px] text-neutral-400">
              Port 8080 par background foreground daemon start karta hai aur live link deta hai.
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">Check Status</span>
              <button
                onClick={() => copySnippet('status', 'termux:server status')}
                className="text-xs text-neutral-400 hover:text-white"
              >
                {copiedId === 'status' ? '✓' : 'Copy'}
              </button>
            </div>
            <code className="block bg-neutral-900 p-2 rounded text-xs font-mono text-cyan-300 font-bold">
              termux:server status
            </code>
            <p className="text-[11px] text-neutral-400">
              Active sessions, PID, aur current URL display karta hai.
            </p>
          </div>

          {/* Stop Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400">Stop Server</span>
              <button
                onClick={() => copySnippet('stop', 'termux:server stop')}
                className="text-xs text-neutral-400 hover:text-white"
              >
                {copiedId === 'stop' ? '✓' : 'Copy'}
              </button>
            </div>
            <code className="block bg-neutral-900 p-2 rounded text-xs font-mono text-red-300 font-bold">
              termux:server stop
            </code>
            <p className="text-[11px] text-neutral-400">
              Background server ko safely close karta hai aur battery bachaata hai.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
