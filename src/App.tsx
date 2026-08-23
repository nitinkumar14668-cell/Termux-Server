import React, { useState } from 'react';
import { ServerConfig } from './types';
import { Navbar } from './components/Navbar';
import { WebTerminalView } from './components/WebTerminalView';
import { RepoExplorer } from './components/RepoExplorer';
import { TermuxScriptView } from './components/TermuxScriptView';
import { PublishGuideView } from './components/InstallGuideModal';
import { PhoneConnectionModal } from './components/PhoneConnectionModal';
import { StandaloneTerminal } from './components/StandaloneTerminal';
import { downloadProjectZip } from './utils/zipGenerator';

export default function App() {
  const [config, setConfig] = useState<ServerConfig>({
    port: 8080,
    ipAddress: '192.168.1.105',
    isRunning: true,
    pinAuthEnabled: false,
    pinCode: '1234',
    allowWriteAccess: true,
    theme: 'matrix',
    fontSize: 14,
    cursorBlink: true,
    activeSessions: 1,
  });

  const [activeTab, setActiveTab] = useState<'terminal' | 'scripts' | 'repo' | 'guide' | 'standalone'>('terminal');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleToggleServer = () => {
    setConfig((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadProjectZip();
    } catch (err) {
      console.error('Failed to generate project ZIP', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (activeTab === 'standalone') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
        <StandaloneTerminal
          config={config}
          setConfig={setConfig}
          onBackToDashboard={() => setActiveTab('terminal')}
        />
        <PhoneConnectionModal
          config={config}
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-900/60 selection:text-emerald-200">
      
      {/* Top Navbar */}
      <Navbar
        config={config}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleServer={handleToggleServer}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onDownloadZip={handleDownloadZip}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'terminal' && (
          <WebTerminalView
            config={config}
            setConfig={setConfig}
            onOpenQrModal={() => setIsQrModalOpen(true)}
          />
        )}

        {activeTab === 'scripts' && (
          <TermuxScriptView />
        )}

        {activeTab === 'repo' && (
          <RepoExplorer onDownloadZip={handleDownloadZip} />
        )}

        {activeTab === 'guide' && (
          <PublishGuideView onDownloadZip={handleDownloadZip} />
        )}
      </main>

      {/* QR Code & Wi-Fi Connection Modal */}
      <PhoneConnectionModal
        config={config}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Global Toast for ZIP Downloading */}
      {isDownloading && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold">Generating Termux:Server GitHub Repository ZIP...</span>
        </div>
      )}

    </div>
  );
}
