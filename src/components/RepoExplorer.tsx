import React, { useState } from 'react';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Folder, 
  FileText, 
  ShieldCheck, 
  GitBranch, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { PROJECT_FILES } from '../data/projectFiles';
import { SourceFile } from '../types';

interface RepoExplorerProps {
  onDownloadZip: () => void;
}

export const RepoExplorer: React.FC<RepoExplorerProps> = ({ onDownloadZip }) => {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'android' | 'termux' | 'fdroid' | 'github'>('all');

  const filteredFiles = activeCategory === 'all'
    ? PROJECT_FILES
    : PROJECT_FILES.filter((f) => f.category === activeCategory);

  const copyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageBadge = (lang: string) => {
    switch (lang) {
      case 'kotlin': return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'xml': return 'bg-orange-950/80 text-orange-300 border-orange-800';
      case 'yaml': return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'bash': return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'gradle': return 'bg-blue-950/80 text-blue-300 border-blue-800';
      default: return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 w-full space-y-4">
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-400" />
              Termux:Server Android APK & F-Droid Source Code
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
              GPL-3.0 Ready
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Browse, copy, or download the full Android Studio project ready for GitHub and F-Droid compilation.
          </p>
        </div>

        <button
          id="repo-download-zip-btn"
          onClick={onDownloadZip}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center gap-2 transition shadow-md shrink-0 self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          Download Full GitHub Repo (ZIP)
        </button>
      </div>

      {/* Main Grid: File Tree + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: File Tree Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-md flex flex-col h-[600px]">
          {/* Category Filter Tabs */}
          <div className="p-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeCategory === 'all' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({PROJECT_FILES.length})
            </button>
            <button
              onClick={() => setActiveCategory('android')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeCategory === 'android' ? 'bg-purple-950 text-purple-300 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setActiveCategory('termux')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeCategory === 'termux' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Termux
            </button>
            <button
              onClick={() => setActiveCategory('fdroid')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeCategory === 'fdroid' ? 'bg-amber-950 text-amber-300 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              F-Droid
            </button>
            <button
              onClick={() => setActiveCategory('github')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeCategory === 'github' ? 'bg-blue-950 text-blue-300 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              GitHub
            </button>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition flex items-start gap-2.5 border ${
                    isSelected
                      ? 'bg-neutral-800 border-emerald-500/40 text-emerald-400 shadow-sm'
                      : 'bg-neutral-950/40 border-transparent text-neutral-300 hover:bg-neutral-800/60 hover:border-neutral-700'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-white">{file.name}</div>
                    <div className="text-[10px] text-neutral-500 truncate mt-0.5">{file.path}</div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase shrink-0 ${getLanguageBadge(file.language)}`}>
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Includes Android 14 foreground service & Termux intent permissions.</span>
          </div>
        </div>

        {/* Right: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-md flex flex-col h-[600px]">
          
          {/* File Header */}
          <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold text-white truncate block">
                  {selectedFile.path}
                </span>
                <p className="text-[11px] text-neutral-400 truncate">
                  {selectedFile.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="copy-selected-code-btn"
                onClick={copyCode}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-neutral-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Code Text Area */}
          <div className="flex-1 overflow-auto bg-neutral-950 p-4 font-mono text-xs text-neutral-200 leading-relaxed select-text">
            <pre className="whitespace-pre font-mono">
              <code>{selectedFile.content}</code>
            </pre>
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>Lines: {selectedFile.content.split('\n').length}</span>
            <span>Format: {selectedFile.language.toUpperCase()}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
