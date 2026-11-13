import React, { useState } from 'react';
import { PasswordAnalysis, AttackPreset } from '../types';
import {
  Shield,
  AlertTriangle,
  Zap,
  Flame,
  Atom,
  Cpu,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { playKeyTick } from '../utils/sound';

interface ResistanceCardProps {
  analysis: PasswordAnalysis;
  currentPreset: AttackPreset;
  onSelectPreset: (preset: AttackPreset) => void;
  presets: AttackPreset[];
}

export const ResistanceCard: React.FC<ResistanceCardProps> = ({
  analysis,
  currentPreset,
  onSelectPreset,
  presets,
}) => {
  const [isQuantumMode, setIsQuantumMode] = useState(false);

  const {
    password,
    formattedTime,
    level,
    levelLabel,
    levelDescription,
    entropy,
    combinationsStr,
    poolSize,
    colorClass,
    isDictionary,
    dictionaryWord,
    isSequentialOrRepeated,
    quantum,
  } = analysis;

  // Active metrics depending on toggle:
  const activeTime = isQuantumMode ? quantum.formattedQuantumTime : formattedTime;
  const activeLevel = isQuantumMode ? quantum.quantumLevel : level;
  const activeLabel = isQuantumMode ? quantum.quantumLevelLabel : levelLabel;
  const activeDesc = isQuantumMode ? quantum.quantumLevelDescription : levelDescription;

  const getMeterPercent = (lvl: number) => {
    if (!password) return 0;
    return lvl * 20;
  };

  const toggleQuantum = (mode: boolean) => {
    playKeyTick();
    setIsQuantumMode(mode);
  };

  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 border transition-all duration-500 relative overflow-hidden backdrop-blur-md ${
        isQuantumMode
          ? 'bg-indigo-950/25 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
          : `${colorClass.bg} ${colorClass.border} ${colorClass.glow}`
      }`}
    >
      {/* Background ambient gradient glow */}
      <div
        className={`absolute -right-20 -bottom-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-500 ${
          isQuantumMode ? 'bg-indigo-500' : 'bg-cyan-500'
        }`}
      />

      {/* Header of Resistance Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {isQuantumMode ? (
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center animate-pulse">
              <Atom className="w-4 h-4 text-indigo-400" />
            </div>
          ) : level === 1 ? (
            <Flame className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
          ) : level <= 3 ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <Shield className="w-5 h-5 text-teal-400 shrink-0" />
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
              {isQuantumMode
                ? '耐量子暗号 (PQC) 視点: 量子コンピュータ解読シミュレーション'
                : '通常GPUクラスタ 耐性判定'}
            </span>
            {isQuantumMode && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] font-mono text-indigo-300">
                  Grover探索適用
                </span>
              </>
            )}
          </div>
        </div>

        {/* Top-Right: Conventional vs Quantum Toggle Buttons */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => toggleQuantum(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              !isQuantumMode
                ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>通常GPUクラスタ</span>
          </button>

          <button
            type="button"
            onClick={() => toggleQuantum(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isQuantumMode
                ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-400/50 shadow-sm'
                : 'text-slate-400 hover:text-indigo-300'
            }`}
          >
            <Atom className="w-3.5 h-3.5 text-indigo-400" />
            <span>量子コンピュータ (Shor/Grover)</span>
          </button>
        </div>
      </div>

      {/* Main Feature: Estimated Crack Time in Giant Letters */}
      <div className="py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <span>推定解読時間（平均試行時間）</span>
            {isQuantumMode && (
              <span className="text-[11px] text-indigo-400 font-semibold">
                [量子重ね合わせ探索]
              </span>
            )}
          </span>

          {!isQuantumMode && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">想定環境:</span>
              <select
                id="attack-rate-select"
                value={currentPreset.id}
                onChange={(e) => {
                  const found = presets.find((p) => p.id === e.target.value);
                  if (found) onSelectPreset(found);
                }}
                className="bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 rounded-lg px-2 py-0.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.rateLabel})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
          <div
            className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display transition-colors duration-300 ${
              isQuantumMode ? 'text-indigo-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]' : colorClass.text
            }`}
          >
            {password ? activeTime : 'パスワードを入力してください'}
          </div>
        </div>

        {/* Quantum Speedup comparison banner */}
        {isQuantumMode && password && (
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold font-mono text-indigo-300">
                <TrendingDown className="w-4 h-4 text-indigo-400" />
                <span>量子加速による解読短縮: {quantum.speedupFactorStr}</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                  quantum.isPqcSafe
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                }`}
              >
                {quantum.isPqcSafe ? '耐量子安全基準 適合 (PQC Safe)' : '量子解読リスクあり'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-300">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400">通常GPUクラスタ解読:</span>{' '}
                <strong className="text-cyan-300">{formattedTime}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400">量子コンピュータ解読:</span>{' '}
                <strong className="text-indigo-300">{quantum.formattedQuantumTime}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-0.5">
              {quantum.algorithmNote}
            </p>
          </div>
        )}

        {/* Dictionary or sequential attack notice banner */}
        {isDictionary && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>致命的な脆弱性:</strong> 「{dictionaryWord}」は世界的な流出パスワード辞書に登録されているため、総当たりを待たずに<strong>開始0.0001秒で突破</strong>されます。
            </span>
          </div>
        )}

        {isSequentialOrRepeated && !isDictionary && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>推測の容易性:</strong> 同一文字の繰り返しやキーボード配列（qwerty / 123456 等）の連続が含まれており、スマートクラッキングツールで即時発見されます。
            </span>
          </div>
        )}
      </div>

      {/* 5-Level Meter */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">{activeLabel}</span>
          <span className="font-mono text-slate-400">
            {password ? `スコア: ${activeLevel} / 5` : '待機中'}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3 rounded-full bg-slate-950/80 border border-slate-800 overflow-hidden relative p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isQuantumMode ? 'bg-indigo-500' : colorClass.bar
            }`}
            style={{ width: `${getMeterPercent(activeLevel)}%` }}
          />
        </div>

        {/* 5-segment ticks */}
        <div className="grid grid-cols-5 text-[10px] text-slate-500 font-mono text-center pt-1">
          <div className={activeLevel >= 1 ? 'text-rose-400 font-semibold' : ''}>1: 超危険</div>
          <div className={activeLevel >= 2 ? 'text-amber-400 font-semibold' : ''}>2: 危険</div>
          <div className={activeLevel >= 3 ? 'text-yellow-400 font-semibold' : ''}>3: 注意</div>
          <div className={activeLevel >= 4 ? 'text-teal-400 font-semibold' : ''}>4: 高耐性</div>
          <div className={activeLevel >= 5 ? 'text-emerald-400 font-semibold' : ''}>5: 鉄壁</div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          {activeDesc}
        </p>
      </div>

      {/* Advanced Information Theory Metrics (Entropy & S=N^L) */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>
              {isQuantumMode ? '実効量子エントロピー' : 'エントロピー (情報量)'}
            </span>
            <span className={isQuantumMode ? 'text-indigo-400' : 'text-cyan-400'}>
              {isQuantumMode ? 'E / 2 (Grover)' : 'E = L·log₂(N)'}
            </span>
          </div>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums text-white flex items-baseline gap-1">
            <span>{password ? (isQuantumMode ? quantum.effectiveEntropy : entropy) : '0.0'}</span>
            <span className="text-xs text-slate-400 font-normal">bits</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isQuantumMode
              ? quantum.effectiveEntropy >= 64
                ? '耐量子安全基準 (128bit対称鍵相当)'
                : '耐量子強度不足 (鍵長倍増が必要)'
              : entropy >= 80
              ? '軍事・国家安全基準クリア'
              : entropy >= 60
              ? '一般安全基準クリア'
              : '強度不足'}
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>
              {isQuantumMode ? '量子探索空間 (√S)' : '組み合わせ総数 (S)'}
            </span>
            <span className={isQuantumMode ? 'text-indigo-400' : 'text-cyan-400'}>
              {isQuantumMode ? '√N^L' : 'S = N^L'}
            </span>
          </div>
          <div
            className="mt-1 text-sm sm:text-base font-bold font-mono tabular-nums text-white truncate"
            title={isQuantumMode ? quantum.quantumCombinationsStr : combinationsStr}
          >
            {isQuantumMode ? quantum.quantumCombinationsStr : combinationsStr}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isQuantumMode ? '量子重ね合わせ探索の必要ステップ数' : '探索すべき全パスワード空間の広さ'}
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>{isQuantumMode ? 'PQC（耐量子暗号）判定' : '文字候補プール (N)'}</span>
            <span className={isQuantumMode ? 'text-indigo-400' : 'text-cyan-400'}>
              {isQuantumMode ? 'NIST PQC' : 'N=10〜94'}
            </span>
          </div>
          <div className="mt-1 text-sm sm:text-base font-bold font-mono tabular-nums text-white flex items-baseline gap-1">
            {isQuantumMode ? (
              <span className={quantum.isPqcSafe ? 'text-emerald-300' : 'text-amber-300'}>
                {quantum.isPqcSafe ? 'PQC適合 (長大鍵)' : '非適合 (短縮リスク)'}
              </span>
            ) : (
              <>
                <span className="text-lg">{password ? poolSize : '0'}</span>
                <span className="text-xs text-slate-400 font-normal">種類</span>
              </>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isQuantumMode ? '量子脅威に耐えうるパスワード長か' : '使用文字種の合計探索空間'}
          </div>
        </div>
      </div>
    </div>
  );
};
