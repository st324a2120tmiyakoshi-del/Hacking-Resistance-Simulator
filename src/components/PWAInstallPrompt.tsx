import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed and opened as an app, display a subtle "App Mode" status
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/50 border border-teal-500/30 text-teal-300 text-xs font-mono">
        <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
        <span className="hidden sm:inline">アプリとして実行中</span>
        <span className="sm:hidden">APP MODE</span>
      </div>
    );
  }

  return (
    <>
      {/* Install Button for Chromium / Android / Desktop */}
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all active:scale-95"
          title="ホーム画面またはPCにアプリとしてインストール"
        >
          <Download className="w-3.5 h-3.5" />
          <span>アプリをインストール</span>
        </button>
      )}

      {/* Install Button for iOS Safari */}
      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-teal-300 hover:border-teal-500/40 transition-colors"
          title="iPhone / iPadのホーム画面に追加"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span>ホーム画面に追加</span>
        </button>
      )}

      {/* Generic fallback install button (for browsers supporting manual install or testing) */}
      {!isInstallable && !isIOS && (
        <button
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-teal-300 hover:border-teal-500/40 transition-colors"
          title="アプリとしてインストールする方法"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span>アプリ化</span>
        </button>
      )}

      {/* iOS & Manual Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative font-sans text-slate-200">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="閉じる"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white font-display">
                  スマホ・PCのホーム画面に追加
                </h3>
                <p className="text-xs text-slate-400">
                  ネイティブアプリのように全画面で起動できます
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  ブラウザのメニューまたは下部の{' '}
                  <strong className="text-white flex items-center gap-1 inline-flex">
                    <Share className="w-3.5 h-3.5 text-teal-400" />
                    共有ボタン
                  </strong>{' '}
                  をタップします。
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  メニュー内の{' '}
                  <strong className="text-white flex items-center gap-1 inline-flex">
                    <PlusSquare className="w-3.5 h-3.5 text-teal-400" />
                    「ホーム画面に追加」
                  </strong>{' '}
                  を選択します。
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  右上の「追加」をタップすると、専用アイコンでホーム画面にインストール完了です！
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
};
