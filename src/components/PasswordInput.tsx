import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Dices, Key, Trash2, Sliders } from 'lucide-react';
import { generateStrongPassword, generatePassphrase } from '../utils/security';
import { playKeyTick } from '../utils/sound';
import { CustomPasswordModal } from './CustomPasswordModal';

interface PasswordInputProps {
  password: string;
  onChange: (value: string) => void;
  onRunSimulation?: () => void;
}

const PRESETS = [
  { label: '123456 (超危険)', value: '123456', tag: '辞書即死' },
  { label: 'password', value: 'password', tag: '定番漏洩' },
  { label: 'Tokyo2026!', value: 'Tokyo2026!', tag: 'よくある10文字' },
  { label: 'correct-horse-battery-99', value: 'correct-horse-battery-99', tag: 'パスフレーズ' },
  { label: 'N8#wP$9vL@2xQ!4m', value: 'N8#wP$9vL@2xQ!4m', tag: '堅牢16文字' },
];

export const PasswordInput: React.FC<PasswordInputProps> = ({
  password,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleGenerateStrong = () => {
    playKeyTick();
    const generated = generateStrongPassword(16);
    onChange(generated);
  };

  const handleGeneratePassphrase = () => {
    playKeyTick();
    const generated = generatePassphrase();
    onChange(generated);
  };

  const handleClear = () => {
    playKeyTick();
    onChange('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Label & Character count */}
      <div className="flex items-center justify-between mb-3">
        <label
          htmlFor="password-field"
          className="text-sm font-semibold text-slate-200"
        >
          テスト対象パスワード
        </label>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>
            長さ: <strong className="text-cyan-400 font-bold tabular-nums text-sm">{password.length}</strong> 文字
          </span>
          {password.length > 0 && (
            <button
              onClick={handleClear}
              className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              title="入力をクリア"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>クリア</span>
            </button>
          )}
        </div>
      </div>

      {/* Input container */}
      <div className="relative group">
        <input
          id="password-field"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            playKeyTick();
            onChange(e.target.value);
          }}
          placeholder="パスワードを入力、または下記ジェネレーターから生成..."
          className="w-full bg-slate-950/90 text-white font-mono text-base sm:text-lg px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-slate-700/80 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 pr-28 transition-all tracking-wide placeholder:text-slate-600 placeholder:text-sm"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Action icons inside input */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
            title={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!password}
            className={`p-2 rounded-lg transition-colors ${
              copied
                ? 'text-emerald-400 bg-emerald-950/60'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 disabled:opacity-40 disabled:hover:text-slate-400'
            }`}
            title="クリップボードにコピー"
            aria-label="パスワードをコピー"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Quick Action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            playKeyTick();
            setIsCustomModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-colors shadow-sm"
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>カスタム生成 (8〜64文字)</span>
        </button>

        <button
          type="button"
          onClick={handleGenerateStrong}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <Dices className="w-4 h-4 text-slate-400" />
          <span>16文字ランダム生成</span>
        </button>

        <button
          type="button"
          onClick={handleGeneratePassphrase}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <Key className="w-4 h-4 text-slate-400" />
          <span>パスフレーズ生成</span>
        </button>
      </div>

      {/* Custom Password Modal */}
      <CustomPasswordModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onApply={(newPw) => onChange(newPw)}
      />

      {/* Preset pills to test */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 text-xs font-medium mr-1">プリセット検証:</span>
        {PRESETS.map((item) => (
          <button
            key={item.value}
            onClick={() => {
              playKeyTick();
              onChange(item.value);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors font-mono text-[11px]"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
