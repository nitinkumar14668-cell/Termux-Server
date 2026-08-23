import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  Sparkles,
  Shield,
  HelpCircle
} from 'lucide-react';
import { TerminalLine, ServerConfig } from '../types';
import { renderAnsiText, TERMINAL_THEMES } from '../utils/ansiParser';
import { executeCommand, getInitialTerminalHistory } from '../utils/terminalEngine';

interface WebTerminalViewProps {
  config: ServerConfig;
  setConfig: React.Dispatch<React.SetStateAction<ServerConfig>>;
  onOpenQrModal: () => void;
}

export const WebTerminalView: React.FC<WebTerminalViewProps> = ({
  config,
  setConfig,
  onOpenQrModal,
}) => {
  const [history, setHistory] = useState<TerminalLine[]>(() =>
    getInitialTerminalHistory(config.ipAddress, config.port)
  );
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([
    'pkg install termux-server',
    'termux:server start',
    'neofetch',
  ]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTheme = TERMINAL_THEMES[config.theme] || TERMINAL_THEMES.matrix;

  // Auto-scroll on new lines
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus terminal input on click
  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleRunCommand = (cmdText: string) => {
    if (!cmdText.trim()) return;

    const userLine: TerminalLine = {
      id: `${Date.now()}-user`,
      type: 'input',
      content: `u0_a245@localhost:~$ ${cmdText}`,
      timestamp: new Date().toLocaleTimeString(),
    };

    const res = executeCommand(cmdText, config);

    if (res.clearScreen) {
      setHistory([]);
    } else {
      setHistory((prev) => [...prev, userLine, ...res.lines]);
    }

    if (res.updatedConfig) {
      setConfig((prev) => ({ ...prev, ...res.updatedConfig }));
    }

    setCmdHistory((prev) => [cmdText, ...prev.filter((c) => c !== cmdText)]);
    setHistoryIdx(-1);
    setInputVal('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunCommand(inputVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx] || '');
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setHistory((prev) => [
        ...prev,
        {
          id: `${Date.now()}-sigint`,
          type: 'error',
          content: `u0_a245@localhost:~$ ${inputVal}^C`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setInputVal('');
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
    }
  };

  const handleTabCompletion = () => {
    const known = [
      'pkg install termux-server',
      'termux:server start',
      'termux:server stop',
      'termux:server status',
      'termux:server restart',
      'termux-setup-storage',
      'neofetch',
      'ifconfig',
      'ip a',
      'clear',
      'whoami',
      'htop',
      'help',
    ];
    const match = known.find((k) => k.startsWith(inputVal.trim()));
    if (match) {
      setInputVal(match);
    }
  };

  const copyLiveUrl = () => {
    const url = `http://${config.ipAddress}:${config.port}/`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-neutral-950 p-2 sm:p-4' : 'p-4 max-w-7xl mx-auto w-full'}`}>
      
      {/* Live Server LAN Banner */}
      <div className="mb-3 bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.isRunning ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'}`}>
            <Wifi className={`w-5 h-5 ${config.isRunning ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Termux Web Bridge:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.isRunning ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'}`}>
                {config.isRunning ? 'ACTIVE (Port 8080)' : 'STOPPED'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-mono text-white font-medium">http://{config.ipAddress}:{config.port}/</span>
              <button
                id="copy-lan-url-btn"
                onClick={copyLiveUrl}
                className="text-xs px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center gap-1 transition"
                title="Copy URL"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedUrl ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-qr-connect-btn"
            onClick={onOpenQrModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open on Other Phone (QR)
          </button>

          <button
            id="settings-toggle-btn"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
            title="Terminal Settings & Themes"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            id="fullscreen-toggle-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Drawer / Dropdown */}
      {showSettings && (
        <div className="mb-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 font-medium mb-1">Color Theme</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(TERMINAL_THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConfig((prev) => ({ ...prev, theme: t.id }))}
                  className={`px-2.5 py-1 rounded-md border font-mono transition ${
                    config.theme === t.id
                      ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Font Size</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 1) }))}
                  className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono text-white font-medium">{config.fontSize}px</span>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, fontSize: Math.min(22, prev.fontSize + 1) }))}
                  className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">Server Port</label>
              <input
                type="number"
                value={config.port}
                onChange={(e) => setConfig((prev) => ({ ...prev, port: parseInt(e.target.value) || 8080 }))}
                className="w-20 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">Cursor Blink</label>
              <button
                onClick={() => setConfig((prev) => ({ ...prev, cursorBlink: !prev.cursorBlink }))}
                className={`px-3 py-1 rounded border text-xs font-mono ${
                  config.cursorBlink
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                {config.cursorBlink ? 'Enabled' : 'Solid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Command Action Chips */}
      <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-neutral-500 text-[11px] font-medium uppercase tracking-wider pl-1 shrink-0">Quick Run:</span>
        <button
          id="cmd-pkg-install"
          onClick={() => handleRunCommand('pkg install termux-server')}
          className="px-2.5 py-1 rounded-md bg-neutral-800/80 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-500/40 text-neutral-300 border border-neutral-700 font-mono transition shrink-0"
        >
          ⚡ pkg install termux-server
        </button>
        <button
          id="cmd-start"
          onClick={() => handleRunCommand('termux:server start')}
          className="px-2.5 py-1 rounded-md bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-mono transition shrink-0 font-semibold"
        >
          ▶ termux:server start
        </button>
        <button
          id="cmd-status"
          onClick={() => handleRunCommand('termux:server status')}
          className="px-2.5 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono transition shrink-0"
        >
          ● termux:server status
        </button>
        <button
          id="cmd-neofetch"
          onClick={() => handleRunCommand('neofetch')}
          className="px-2.5 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono transition shrink-0"
        >
          neofetch
        </button>
        <button
          id="cmd-ip"
          onClick={() => handleRunCommand('ip a')}
          className="px-2.5 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono transition shrink-0"
        >
          ip a
        </button>
        <button
          id="cmd-storage"
          onClick={() => handleRunCommand('termux-setup-storage')}
          className="px-2.5 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono transition shrink-0"
        >
          termux-setup-storage
        </button>
        <button
          id="cmd-clear"
          onClick={() => setHistory([])}
          className="px-2.5 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 border border-neutral-700 font-mono transition shrink-0 flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Main Terminal Window Frame */}
      <div 
        onClick={focusInput}
        className={`flex-1 rounded-xl border border-neutral-800 shadow-2xl flex flex-col overflow-hidden ${activeTheme.bg} cursor-text transition-all`}
      >
        {/* Terminal Header Bar */}
        <div className="bg-neutral-900/90 border-b border-neutral-800/80 px-4 py-2 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono text-neutral-400 ml-2">
              bash • u0_a245@localhost (termux:server tty)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span>80x24</span>
            <span>UTF-8</span>
          </div>
        </div>

        {/* Terminal Screen Output */}
        <div 
          className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed space-y-1.5 select-text"
          style={{ fontSize: `${config.fontSize}px` }}
        >
          {history.map((line) => {
            if (line.type === 'input') {
              return (
                <div key={line.id} className="flex items-start gap-1 font-semibold text-white">
                  <span className="text-emerald-400 shrink-0">u0_a245@localhost:~$</span>
                  <span className="break-all">{line.content.replace('u0_a245@localhost:~$ ', '')}</span>
                </div>
              );
            }

            return (
              <div
                key={line.id}
                className={`break-words whitespace-pre-wrap ${
                  line.type === 'error'
                    ? 'text-red-400'
                    : line.type === 'success'
                    ? 'text-emerald-400'
                    : line.type === 'system'
                    ? 'text-cyan-400'
                    : line.type === 'warning'
                    ? 'text-amber-400'
                    : activeTheme.text
                }`}
              >
                {renderAnsiText(line.content)}
              </div>
            );
          })}

          {/* Active Prompt & Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center gap-1 font-semibold text-white pt-1">
            <span className="text-emerald-400 shrink-0 select-none">u0_a245@localhost:~$</span>
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                id="terminal-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                className="w-full bg-transparent outline-none text-white font-mono p-0 m-0 border-none shadow-none focus:ring-0"
                style={{ fontSize: `${config.fontSize}px` }}
              />
              {config.cursorBlink && (
                <span className={`inline-block w-2 h-4 ${activeTheme.cursor} ml-0.5 animate-pulse select-none`} />
              )}
            </div>
          </form>

          <div ref={terminalEndRef} />
        </div>

        {/* Mobile Virtual Helper Keypad (Termux Style) */}
        <div className="bg-neutral-900/95 border-t border-neutral-800 p-1.5 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none select-none text-xs font-mono">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setHistory((prev) => [
                  ...prev,
                  {
                    id: `${Date.now()}-esc`,
                    type: 'system',
                    content: '[ESC key pressed]',
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold border border-neutral-700 active:scale-95"
            >
              ESC
            </button>
            <button
              onClick={handleTabCompletion}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold border border-neutral-700 active:scale-95"
            >
              TAB
            </button>
            <button
              onClick={() => setCtrlActive(!ctrlActive)}
              className={`px-2.5 py-1 rounded font-bold border transition active:scale-95 ${
                ctrlActive
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              CTRL
            </button>
            <button
              onClick={() => setAltActive(!altActive)}
              className={`px-2.5 py-1 rounded font-bold border transition active:scale-95 ${
                altActive
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
              }`}
            >
              ALT
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (cmdHistory.length > 0) {
                  const nextIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
                  setHistoryIdx(nextIdx);
                  setInputVal(cmdHistory[nextIdx] || '');
                }
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold border border-neutral-700 active:scale-95"
              title="Previous Command"
            >
              ↑
            </button>
            <button
              onClick={() => {
                if (historyIdx > 0) {
                  const nextIdx = historyIdx - 1;
                  setHistoryIdx(nextIdx);
                  setInputVal(cmdHistory[nextIdx] || '');
                } else if (historyIdx === 0) {
                  setHistoryIdx(-1);
                  setInputVal('');
                }
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold border border-neutral-700 active:scale-95"
              title="Next Command"
            >
              ↓
            </button>
            <button
              onClick={() => {
                setHistory((prev) => [
                  ...prev,
                  {
                    id: `${Date.now()}-ctrlc`,
                    type: 'error',
                    content: `u0_a245@localhost:~$ ${inputVal}^C`,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
                setInputVal('');
              }}
              className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold border border-red-500/30 active:scale-95"
              title="Cancel (SIGINT)"
            >
              ^C
            </button>
            <button
              onClick={() => handleRunCommand(inputVal)}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition active:scale-95 flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
