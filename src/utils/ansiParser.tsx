import React from 'react';
import { TerminalTheme } from '../types';

export const TERMINAL_THEMES: Record<string, TerminalTheme> = {
  matrix: {
    id: 'matrix',
    name: 'Termux Green (Matrix)',
    bg: 'bg-neutral-950',
    text: 'text-emerald-400',
    prompt: 'text-emerald-500',
    cursor: 'bg-emerald-400',
    accent: 'emerald',
    selection: 'bg-emerald-900/50',
  },
  classic: {
    id: 'classic',
    name: 'Termux Classic Dark',
    bg: 'bg-zinc-950',
    text: 'text-zinc-200',
    prompt: 'text-cyan-400',
    cursor: 'bg-zinc-100',
    accent: 'cyan',
    selection: 'bg-cyan-900/50',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Purple',
    bg: 'bg-[#282a36]',
    text: 'text-[#f8f8f2]',
    prompt: 'text-[#50fa7b]',
    cursor: 'bg-[#ff79c6]',
    accent: 'purple',
    selection: 'bg-[#44475a]',
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai Amber',
    bg: 'bg-[#272822]',
    text: 'text-[#f8f8f2]',
    prompt: 'text-[#a6e22e]',
    cursor: 'bg-[#fd971f]',
    accent: 'amber',
    selection: 'bg-[#49483e]',
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo Night',
    bg: 'bg-[#1a1b26]',
    text: 'text-[#a9b1d6]',
    prompt: 'text-[#7aa2f7]',
    cursor: 'bg-[#f7768e]',
    accent: 'blue',
    selection: 'bg-[#283457]',
  },
};

/**
 * Parses ANSI escape sequences into styled React spans
 */
export function renderAnsiText(text: string): React.ReactNode {
  // Regex to match ANSI escape sequences \x1b[...] or \u001b[...]
  const ansiRegex = /\x1b\[([0-9;]*)m/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let currentClasses: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = ansiRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index);
      parts.push(
        <span key={`${lastIndex}-${plainText}`} className={currentClasses.join(' ')}>
          {plainText}
        </span>
      );
    }

    const codeStr = match[1];
    const codes = codeStr ? codeStr.split(';').map(Number) : [0];

    for (const code of codes) {
      if (code === 0) {
        currentClasses = [];
      } else if (code === 1) {
        currentClasses.push('font-bold');
      } else if (code === 30) {
        currentClasses.push('text-zinc-600');
      } else if (code === 31) {
        currentClasses.push('text-red-400');
      } else if (code === 32) {
        currentClasses.push('text-emerald-400');
      } else if (code === 33) {
        currentClasses.push('text-amber-400');
      } else if (code === 34) {
        currentClasses.push('text-blue-400');
      } else if (code === 35) {
        currentClasses.push('text-purple-400');
      } else if (code === 36) {
        currentClasses.push('text-cyan-400');
      } else if (code === 37) {
        currentClasses.push('text-zinc-200');
      }
    }

    lastIndex = ansiRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const plainText = text.substring(lastIndex);
    parts.push(
      <span key={`${lastIndex}-${plainText}`} className={currentClasses.join(' ')}>
        {plainText}
      </span>
    );
  }

  return parts.length > 0 ? parts : text;
}
