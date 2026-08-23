import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Wifi, 
  Smartphone, 
  Share2, 
  Play, 
  Trash2, 
  ArrowLeft,
  Settings,
  Sparkles
} from 'lucide-react';
import { TerminalLine, ServerConfig } from '../types';
import { renderAnsiText, TERMINAL_THEMES } from '../utils/ansiParser';
import { executeCommand, getInitialTerminalHistory } from '../utils/terminalEngine';

interface StandaloneTerminalProps {
  config: ServerConfig;
  setConfig: React.Dispatch<React.SetStateAction<ServerConfig>>;
  onBackToDashboard: () => void;
}

export const StandaloneTerminal: React.FC<StandaloneTerminalProps> = ({
  config,
  setConfig,
  onBackToDashboard,
}) => {
  const [history, setHistory] = useState<TerminalLine[]>(() => [
    {
      id: 'st-1',
      type: 'system',
      content: `\x1b[1;32m● Termux:Server Web Terminal Live at http://${config.ipAddress}:${config.port}/\x1b[0m`,
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'st-2',
      type: 'info',
      content: 'Connected to Android Termux Bridge • Full Shell Access (aarch64)',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'st-3',
      type: 'system',
      content: `Type '\x1b[1;36mhelp\x1b[0m', '\x1b[1;33mneofetch\x1b[0m', or any Linux command below.`,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>(['neofetch', 'ls', 'ip a']);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeTheme = TERMINAL_THEMES[config.theme] || TERMINAL_THEMES.matrix;

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

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
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] w-full bg-neutral-950 text-white">
      
      {/* Browser Bar Simulation */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-3 py-2 flex items-center justify-between gap-3 text-xs">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </button>

        {/* Mock Browser URL input */}
        <div className="flex-1 max-w-xl bg-neutral-950 border border-neutral-700/80 rounded-full px-4 py-1 flex items-center justify-center gap-2 text-neutral-300 font-mono shadow-inner">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">http://{config.ipAddress}:{config.port}/</span>
          <span className="text-[10px] text-neutral-500 hidden sm:inline">(Live Termux View)</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline text-emerald-400 font-mono text-[11px] font-bold">
            ● 1 Client Connected
          </span>
        </div>
      </div>

      {/* Fullscreen Terminal View */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className={`flex-1 ${activeTheme.bg} flex flex-col overflow-hidden p-3 font-mono cursor-text select-text`}
        style={{ fontSize: `${config.fontSize}px` }}
      >
        <div className="flex-1 overflow-y-auto space-y-1.5 p-1">
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

          <form onSubmit={handleSubmit} className="flex items-center gap-1 font-semibold text-white pt-1">
            <span className="text-emerald-400 shrink-0 select-none">u0_a245@localhost:~$</span>
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                id="standalone-terminal-input"
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
              <span className={`inline-block w-2 h-4 ${activeTheme.cursor} ml-0.5 animate-pulse select-none`} />
            </div>
          </form>

          <div ref={terminalEndRef} />
        </div>

        {/* Floating Mobile Keypad for pure phone access */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-1.5 mt-2 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none text-xs">
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
              className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-bold border border-neutral-700"
            >
              ESC
            </button>
            <button
              onClick={() => {
                const known = ['pkg install termux-server', 'termux:server start', 'neofetch', 'ip a', 'help'];
                const match = known.find((k) => k.startsWith(inputVal.trim()));
                if (match) setInputVal(match);
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-bold border border-neutral-700"
            >
              TAB
            </button>
            <button
              onClick={() => setCtrlActive(!ctrlActive)}
              className={`px-2.5 py-1 rounded font-bold border ${
                ctrlActive ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              CTRL
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
              className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-bold border border-neutral-700"
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
              className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-bold border border-neutral-700"
            >
              ↓
            </button>
            <button
              onClick={() => handleRunCommand(inputVal)}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Enter
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
