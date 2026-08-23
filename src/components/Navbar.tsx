import React from 'react';
import { 
  Terminal, 
  Server, 
  QrCode, 
  Download, 
  Code, 
  FileText, 
  HelpCircle, 
  Play, 
  Square, 
  Share2,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { ServerConfig } from '../types';

interface NavbarProps {
  config: ServerConfig;
  activeTab: 'terminal' | 'scripts' | 'repo' | 'guide' | 'standalone';
  setActiveTab: (tab: 'terminal' | 'scripts' | 'repo' | 'guide' | 'standalone') => void;
  onToggleServer: () => void;
  onOpenQrModal: () => void;
  onDownloadZip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  activeTab,
  setActiveTab,
  onToggleServer,
  onOpenQrModal,
  onDownloadZip,
}) => {
  return (
    <header className="bg-neutral-900 border-b border-neutral-800 text-neutral-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Server Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold shadow-inner">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  Termux<span className="text-emerald-400">:Server</span>
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-mono">
                  v1.0.0 (F-Droid)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${config.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                  {config.isRunning ? (
                    <span className="text-emerald-400 font-medium">Live on Port {config.port}</span>
                  ) : (
                    <span className="text-neutral-500">Server Offline</span>
                  )}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="font-mono text-neutral-300">http://{config.ipAddress}:{config.port}/</span>
              </div>
            </div>
          </div>

          {/* Mobile Server Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-qr-btn"
              onClick={onOpenQrModal}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
              title="Share QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              id="mobile-toggle-btn"
              onClick={onToggleServer}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                config.isRunning
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
              }`}
            >
              {config.isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {config.isRunning ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center overflow-x-auto pb-1 md:pb-0 gap-1 scrollbar-none text-xs font-medium">
          <button
            id="tab-terminal"
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Live Web Terminal
          </button>

          <button
            id="tab-scripts"
            onClick={() => setActiveTab('scripts')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'scripts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Termux CLI & Scripts
          </button>

          <button
            id="tab-repo"
            onClick={() => setActiveTab('repo')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'repo'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Android & F-Droid Repo
          </button>

          <button
            id="tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Publish Guide (Hindi/Eng)
          </button>

          <button
            id="tab-standalone"
            onClick={() => setActiveTab('standalone')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'standalone'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
            title="Preview direct full-screen http://phoneip:8080/"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            Phone View (8080)
          </button>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            id="btn-qr-modal"
            onClick={onOpenQrModal}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition"
            title="Get Phone Connection QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            Connect Phone
          </button>

          <button
            id="btn-download-zip"
            onClick={onDownloadZip}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition"
            title="Download full ready-to-publish GitHub repository"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export Repo (ZIP)
          </button>

          <button
            id="btn-toggle-server"
            onClick={onToggleServer}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              config.isRunning
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {config.isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {config.isRunning ? 'Stop Server' : 'Start Server'}
          </button>
        </div>
      </div>
    </header>
  );
};
