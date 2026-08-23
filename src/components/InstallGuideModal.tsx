import React, { useState } from 'react';
import { 
  Github, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  FileCheck, 
  Workflow, 
  Package, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface PublishGuideViewProps {
  onDownloadZip: () => void;
}

export const PublishGuideView: React.FC<PublishGuideViewProps> = ({ onDownloadZip }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 w-full space-y-6 text-neutral-200 text-sm">
      
      {/* Top Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            GitHub Repo Banane, APK Build Karne aur F-Droid par Publish Karne ka Complete Process
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Step-by-step Hindi & English guide to compile your Termux:Server APK and submit to F-Droid.
          </p>
        </div>

        <button
          id="guide-download-zip"
          onClick={onDownloadZip}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center gap-2 transition shadow-md shrink-0"
        >
          <Download className="w-4 h-4" />
          Download All Code (ZIP)
        </button>
      </div>

      {/* 3 Step Big Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Step 1 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-white text-base">GitHub Repo Banayein</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              GitHub par <code className="text-blue-300 font-mono">termux-server</code> name se new public repository create karein aur hamara export kiya gaya ZIP upload karein.
            </p>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-lg text-[11px] text-neutral-400 font-mono">
            git push origin main
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-white text-base">Automatic APK Build Karein</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              GitHub Actions automatically Android SDK se compile karega aur <strong>app-debug.apk</strong> release section me generate kar dega bina kisi laptop/PC ke!
            </p>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-lg text-[11px] text-emerald-400 font-mono">
            .github/workflows/build-apk.yml
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-white text-base">F-Droid par Submit Karein</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              F-Droid ke official repo (<code className="text-amber-300 font-mono">fdroiddata</code>) par Merge Request (MR) submit karein hamara <code className="text-amber-300 font-mono">metadata/com.termux.server.yml</code> use karke.
            </p>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-lg text-[11px] text-amber-400 font-mono">
            fdroid/metadata/com.termux.server.yml
          </div>
        </div>

      </div>

      {/* Detailed Commands Breakdown */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Github className="w-5 h-5 text-neutral-300" />
          Full Terminal Commands to Push to GitHub:
        </h3>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 space-y-2 overflow-x-auto">
          <div className="text-neutral-500"># 1. Extract the downloaded ZIP file</div>
          <div className="text-emerald-400">unzip termux-server-github-repo.zip -d termux-server</div>
          <div className="text-emerald-400">cd termux-server</div>
          <div className="text-neutral-500 mt-2"># 2. Initialize Git and add files</div>
          <div className="text-emerald-400">git init</div>
          <div className="text-emerald-400">git add .</div>
          <div className="text-emerald-400">git commit -m "Initial commit for Termux:Server v1.0.0"</div>
          <div className="text-neutral-500 mt-2"># 3. Connect to your GitHub repository and push</div>
          <div className="text-emerald-400">git remote add origin https://github.com/YOUR_USERNAME/termux-server.git</div>
          <div className="text-emerald-400">git branch -M main</div>
          <div className="text-emerald-400">git push -u origin main</div>
          <div className="text-neutral-500 mt-2"># 4. Tag for release (triggers F-Droid and APK Release workflow)</div>
          <div className="text-emerald-400">git tag v1.0.0</div>
          <div className="text-emerald-400">git push origin v1.0.0</div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => copyText('git-cmds', `unzip termux-server-github-repo.zip -d termux-server\ncd termux-server\ngit init\ngit add .\ngit commit -m "Initial commit for Termux:Server v1.0.0"\ngit branch -M main\ngit tag v1.0.0`)}
            className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-neutral-700 transition"
          >
            {copiedId === 'git-cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === 'git-cmds' ? 'Commands Copied!' : 'Copy Commands'}
          </button>
        </div>
      </div>

      {/* F-Droid Publication Standards Checklist */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-md space-y-3">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          F-Droid Publication Requirements Verification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">100% Free & Open Source (GPL-3.0)</span>
              <span className="text-neutral-400 text-[11px]">No proprietary SDKs, no trackers, no Google Play Services dependency.</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Reproducible Gradle Build</span>
              <span className="text-neutral-400 text-[11px]">Clean standard gradle wrapper configuration compatible with F-Droid build server.</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Official Termux Permission Specs</span>
              <span className="text-emerald-300 text-[11px]">Uses declared com.termux.permission.RUN_COMMAND to safely interface with Termux.</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">F-Droid Metadata File Included</span>
              <span className="text-neutral-400 text-[11px]">metadata/com.termux.server.yml is ready to directly copy to fdroiddata.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
