export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'success' | 'warning' | 'info';
  content: string;
  timestamp: string;
}

export interface TerminalTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  prompt: string;
  cursor: string;
  accent: string;
  selection: string;
}

export interface SourceFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'yaml' | 'bash' | 'markdown' | 'json';
  category: 'android' | 'termux' | 'fdroid' | 'github';
  content: string;
  description: string;
}

export interface ServerConfig {
  port: number;
  ipAddress: string;
  isRunning: boolean;
  pinAuthEnabled: boolean;
  pinCode: string;
  allowWriteAccess: boolean;
  theme: string;
  fontSize: number;
  cursorBlink: boolean;
  activeSessions: number;
}
