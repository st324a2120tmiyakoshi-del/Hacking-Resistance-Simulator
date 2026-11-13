import React from 'react';
import {
  AlertOctagon,
  Flame,
  X,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Dices,
  Lock,
} from 'lucide-react';
import { PasswordAnalysis } from '../types';
import { generateStrongPassword } from '../utils/security';
import { playKeyTick } from '../utils/sound';

interface DangerAlertModalProps {
  isOpen: boolean;
  analysis: PasswordAnalysis;
  onClose: () => void;
  onGenerateStrong: () => void;
}

export const DangerAlertModal: React.FC<DangerAlertModalProps> = ({
  isOpen,
  analysis,
  onClose,
  onGenerateStrong,
}) => {
  if (!isOpen) return null;

  const {
    password,
    length,
    isDictionary,
    dictionaryWord,
    isSequentialOrRepeated,
    formattedTime,
  } = analysis;

  const isShort = length > 0 && length < 8;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] border border-rose-500/60 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(244,63,94,0.35)] relative overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Warning Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-rose-500/20 bg-rose-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-400">
                セキュリティ警告
              </div>
              <h3 className="text-base font-bold text-white font-display mt-0.5">
                重大な脆弱性を検知
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playKeyTick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Targeted Password Preview Box */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-rose-500/30 font-mono text-center">
            <div className="text-[11px] text-slate-400 mb-1">
              入力されたパスワード
            </div>
            <div className="text-lg font-bold text-rose-300 break-all select-all tracking-wider">
              {password}
            </div>
            <div className="text-[11px] text-rose-400 font-semibold mt-1">
              解読推定時間: {formattedTime}（瞬殺）
            </div>
          </div>

          {/* Explanation of the exact danger */}
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isDictionary && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>世界的大規模辞書（RockYou）と完全一致</span>
                </div>
                <p className="text-xs text-slate-300">
                  「{dictionaryWord || password}」は世界中で最も流出しているパスワード集の最上位に登録されています。総当たりを待たずに<strong>開始0.0001秒で突破</strong>されます。
                </p>
              </div>
            )}

            {isShort && !isDictionary && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>極端に短いパスワード（{length}文字）</span>
                </div>
                <p className="text-xs text-slate-300">
                  8文字未満のパスワードは探索空間が狭すぎるため、安価なPCやGPUクラスタにより数秒〜数分で全通り試行が完了します。
                </p>
              </div>
            )}

            {isSequentialOrRepeated && !isDictionary && (
              <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/40 space-y-1">
                <div className="font-bold text-orange-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                  <span>単純な連続文字・キーボード配列</span>
                </div>
                <p className="text-xs text-slate-300">
                  同一文字の繰り返しや「qwerty」「123456」等の物理キーボード配列は、あらゆるハッキングツールの優先辞書に登録されています。
                </p>
              </div>
            )}

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong>推奨アクション:</strong> 実際のWebサービスやアカウントでこのパスワードを使用している場合は、直ちに12文字以上のランダムなパスワードに変更してください。
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playKeyTick();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            このまま閉じる
          </button>

          <button
            type="button"
            onClick={() => {
              playKeyTick();
              onGenerateStrong();
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all active:scale-95"
          >
            <Dices className="w-4 h-4" />
            <span>安全な16文字を自動生成</span>
          </button>
        </div>
      </div>
    </div>
  );
};
