import React from 'react';
import { ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({ soundEnabled, onToggleSound }) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand App Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-display">
                ハッキング耐性シミュレーター
              </h1>
              <span className="hidden sm:inline text-xs text-slate-500">·</span>
              <span className="hidden sm:inline text-xs text-slate-400">
                セキュリティ解析ツール
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              端末内ローカル完結 · 外部通信なし
            </p>
          </div>
        </div>

        {/* App Utility Actions */}
        <div className="flex items-center gap-2">
          <PWAInstallPrompt />

          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'サウンドをミュート' : 'サウンドを有効化'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>サウンド: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>ミュート</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

