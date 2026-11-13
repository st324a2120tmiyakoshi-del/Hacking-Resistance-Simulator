import React from 'react';
import { Check, X } from 'lucide-react';
import { PasswordAnalysis } from '../types';

interface CharCoverageProps {
  analysis: PasswordAnalysis;
}

export const CharCoverage: React.FC<CharCoverageProps> = ({ analysis }) => {
  const { hasLower, hasUpper, hasDigit, hasSymbol, length } = analysis;

  const charItems = [
    {
      id: 'lower',
      name: '英小文字',
      code: 'a-z (26種)',
      has: hasLower,
      example: '例: a, b, c...',
    },
    {
      id: 'upper',
      name: '英大文字',
      code: 'A-Z (26種)',
      has: hasUpper,
      example: '例: A, B, C...',
    },
    {
      id: 'digit',
      name: '数字',
      code: '0-9 (10種)',
      has: hasDigit,
      example: '例: 0, 1, 2...',
    },
    {
      id: 'symbol',
      name: '記号・特殊文字',
      code: '!@#$... (32種)',
      has: hasSymbol,
      example: '例: !, @, #, $, %...',
    },
  ];

  const lengthChecks = [
    { label: '8文字以上', ok: length >= 8, min: '最低基準' },
    { label: '12文字以上', ok: length >= 12, min: '推奨基準' },
    { label: '16文字以上', ok: length >= 16, min: '理想基準' },
  ];

  const fulfilledCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>文字種の網羅チェック</span>
          <span className="text-xs font-mono text-cyan-400">
            ({fulfilledCount} / 4 充足)
          </span>
        </h3>
        <span className="text-[11px] text-slate-400">
          全4種を混ぜると候補数が爆発的に増加
        </span>
      </div>

      {/* 4 Character Types Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {charItems.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border transition-all ${
              item.has
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-200">
                {item.name}
              </span>
              {item.has ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400">{item.code}</div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">{item.example}</div>
          </div>
        ))}
      </div>

      {/* Length milestones */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-mono text-[11px]">桁数マイルストーン:</span>
        <div className="flex flex-wrap items-center gap-2">
          {lengthChecks.map((chk, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
                chk.ok
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-950/30 border-slate-800 text-slate-500'
              }`}
            >
              {chk.ok ? (
                <Check className="w-3 h-3 text-cyan-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              )}
              <span>{chk.label}</span>
              <span className="text-[10px] opacity-70">({chk.min})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
