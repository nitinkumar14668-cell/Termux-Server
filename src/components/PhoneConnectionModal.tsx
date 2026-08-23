import React, { useState } from 'react';
import { X, QrCode, Copy, Check, ExternalLink, Smartphone, Wifi, ShieldCheck } from 'lucide-react';
import { ServerConfig } from '../types';

interface PhoneConnectionModalProps {
  config: ServerConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneConnectionModal: React.FC<PhoneConnectionModalProps> = ({
  config,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [customIp, setCustomIp] = useState(config.ipAddress);
  const [customPort, setCustomPort] = useState(config.port.toString());

  if (!isOpen) return null;

  const currentUrl = `http://${customIp}:${customPort}/`;
  
  // Generating a clean QR code URL using public QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}&bgcolor=171717&color=10b981&margin=10`;

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Connect Any Phone / Device</h3>
              <p className="text-xs text-neutral-400">Kisi bhi phone ya PC par Termux chalayein</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-neutral-200 text-sm">
          
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-neutral-950 rounded-xl border border-neutral-800">
            <div className="p-3 bg-neutral-900 rounded-xl border border-emerald-500/20 shadow-inner">
              <img
                src={qrCodeUrl}
                alt="Termux Server QR Code"
                className="w-48 h-48 rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-neutral-400 mt-2 text-center">
              Scan with any phone camera or barcode scanner
            </p>
          </div>

          {/* Direct Link Box */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Live Phone Access URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-emerald-400 font-mono text-sm break-all font-semibold">
                {currentUrl}
              </div>
              <button
                id="modal-copy-url-btn"
                onClick={copyUrl}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick Wi-Fi Instructions */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Wifi className="w-4 h-4" />
              <span>How it works / कैसे कनेक्ट करें:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 pl-1 leading-relaxed">
              <li>Dono phone ko ek hi <strong>Wi-Fi</strong> ya <strong>Mobile Hotspot</strong> se connect karein.</li>
              <li>Termux me command chalayein: <code className="bg-neutral-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">termux:server start</code></li>
              <li>Dusre phone ke browser (Chrome/Safari) me upar diya gaya link <code className="bg-neutral-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">{currentUrl}</code> kholein.</li>
              <li>Aapka poora Termux terminal bina kisi cable ke live open ho jayega!</li>
            </ol>
          </div>

          {/* IP Address Editor (In case user has different hotspot IP) */}
          <div className="pt-2 border-t border-neutral-800/80">
            <details className="text-xs text-neutral-400">
              <summary className="cursor-pointer font-medium hover:text-neutral-200">
                ⚙️ Change IP Address or Port Manually
              </summary>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">Phone Wi-Fi IP:</label>
                  <input
                    type="text"
                    value={customIp}
                    onChange={(e) => setCustomIp(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                    placeholder="192.168.1.X"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">Port:</label>
                  <input
                    type="text"
                    value={customPort}
                    onChange={(e) => setCustomPort(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                    placeholder="8080"
                  />
                </div>
              </div>
            </details>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
