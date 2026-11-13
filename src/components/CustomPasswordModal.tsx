import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  CustomPasswordOptions,
  generateCustomPassword,
  analyzePassword,
} from '../utils/security';
import { playKeyTick } from '../utils/sound';

interface CustomPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (password: string) => void;
}

export const CustomPasswordModal: React.FC<CustomPasswordModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [options, setOptions] = useState<CustomPasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  });

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate a password whenever options change or on open
  useEffect(() => {
    if (isOpen) {
      regenerate();
    }
  }, [isOpen, options]);

  const regenerate = () => {
    playKeyTick();
    const pw = generateCustomPassword(options);
    setGeneratedPassword(pw);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleApply = () => {
    playKeyTick();
    onApply(generatedPassword);
    onClose();
  };

  if (!isOpen) return null;

  // Realtime quick preview analysis of the generated password
  const previewAnalysis = analyzePassword(generatedPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle cyber background ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                詳細カスタムパスワード生成
              </h3>
              <p className="text-xs text-slate-400">
                桁数・文字種・可読性を自由にカスタマイズ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Generated Result Card */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>生成結果プレビュー ({generatedPassword.length}文字)</span>
              <span className={previewAnalysis.colorClass.text}>
                {previewAnalysis.levelLabel.split('（')[0]}
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-700/60 font-mono text-base sm:text-lg break-all text-cyan-300 font-bold tracking-wider flex items-center justify-between gap-2 shadow-inner">
              <span className="select-all">{generatedPassword}</span>
              <button
                type="button"
                onClick={regenerate}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors shrink-0"
                title="別のパスワードを再生成"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Entropy & Crack Estimate bar */}
            <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>情報量: {previewAnalysis.entropy} bits</span>
              <span className="truncate ml-2 text-slate-300">
                推定解読: {previewAnalysis.formattedTime}
              </span>
            </div>
          </div>

          {/* Length Slider Control */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label htmlFor="length-slider" className="text-slate-200">
                パスワードの長さ（桁数）
              </label>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-cyan-400">
                  {options.length}
                </span>
                <span className="text-slate-400 text-xs">文字</span>
              </div>
            </div>

            <input
              id="length-slider"
              type="range"
              min={8}
              max={64}
              value={options.length}
              onChange={(e) =>
                setOptions({ ...options, length: parseInt(e.target.value, 10) })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>8文字 (最小)</span>
              <span className="text-cyan-400/80">16文字 (標準推奨)</span>
              <span>32文字</span>
              <span>64文字 (最大)</span>
            </div>
          </div>

          {/* Character Options Checkboxes */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="text-xs font-semibold text-slate-200 mb-2">
              使用する文字種
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              {/* Uppercase */}
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeUppercase: e.target.checked,
                    })
                  }
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                />
                <span className="text-slate-200">英大文字 (A〜Z)</span>
              </label>

              {/* Lowercase */}
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeLowercase: e.target.checked,
                    })
                  }
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                />
                <span className="text-slate-200">英小文字 (a〜z)</span>
              </label>

              {/* Numbers */}
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeNumbers: e.target.checked,
                    })
                  }
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                />
                <span className="text-slate-200">数字 (0〜9)</span>
              </label>

              {/* Symbols */}
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeSymbols: e.target.checked,
                    })
                  }
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                />
                <span className="text-slate-200">記号 (!@#$%^&*...)</span>
              </label>
            </div>

            {/* Exclude Ambiguous Checkbox */}
            <div className="pt-2 border-t border-slate-900">
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={options.excludeAmbiguous}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      excludeAmbiguous: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-950"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    見間違いやすい文字を除外 (人間が入力しやすい)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    例: 0 (ゼロ) と O (オー)、1 (イチ) と l (エル) と I (アイ) 等を除外
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
              copied
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>コピー完了！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>クリップボードにコピー</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>入力欄に適用</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
