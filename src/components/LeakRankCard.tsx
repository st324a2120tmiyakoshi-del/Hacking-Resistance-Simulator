import React from 'react';
import {
  Database,
  Flame,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileSearch,
  ExternalLink,
  Info,
} from 'lucide-react';
import { estimateLeakRank, LeakRankEstimate } from '../utils/dictionary';

interface LeakRankCardProps {
  password: string;
}

export const LeakRankCard: React.FC<LeakRankCardProps> = ({ password }) => {
  const rankInfo: LeakRankEstimate = estimateLeakRank(password);

  const getDangerTheme = (level: LeakRankEstimate['dangerLevel']) => {
    switch (level) {
      case 'extreme':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          cardBorder: 'border-rose-500/40',
          text: 'text-rose-400',
          barColor: 'bg-rose-500',
          meterPercent: 96,
          icon: <Flame className="w-5 h-5 text-rose-400 animate-pulse" />,
        };
      case 'high':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          cardBorder: 'border-amber-500/40',
          text: 'text-amber-400',
          barColor: 'bg-amber-500',
          meterPercent: 75,
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case 'medium':
        return {
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          cardBorder: 'border-yellow-500/40',
          text: 'text-yellow-300',
          barColor: 'bg-yellow-400',
          meterPercent: 50,
          icon: <Info className="w-5 h-5 text-yellow-400" />,
        };
      case 'low':
      default:
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          cardBorder: 'border-emerald-500/40',
          text: 'text-emerald-300',
          barColor: 'bg-emerald-400',
          meterPercent: 5,
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        };
    }
  };

  const theme = getDangerTheme(rankInfo.dangerLevel);

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border bg-slate-900/90 backdrop-blur-sm shadow-xl transition-all duration-300 ${theme.cardBorder}`}
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileSearch className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 font-display">
                漏洩辞書ランク推定
              </h3>
              <span className="text-slate-600">·</span>
              <span className={`text-xs font-mono font-medium ${theme.text}`}>
                {rankInfo.dangerLevel === 'extreme'
                  ? '最頻出危険ワード'
                  : rankInfo.dangerLevel === 'high'
                  ? '辞書ルール該当'
                  : rankInfo.dangerLevel === 'medium'
                  ? '要注意'
                  : '辞書未検出・安全'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              実在流出パスワード辞書（RockYou）の出現順位から危険性を推定
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 self-start sm:self-auto">
          <Database className="w-3 h-3 text-slate-400" />
          <span>RockYou 3,200万件DB照合</span>
        </div>
      </div>

      {/* Main Ranking Display */}
      <div className="py-4">
        <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
          <span>推定ランキング位置</span>
          <span className="text-slate-500">
            {password ? `${password.length}文字` : '未入力'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            {theme.icon}
          </div>
          <div>
            <div
              className={`text-xl sm:text-2xl font-bold font-display tracking-tight ${theme.text}`}
            >
              {password ? rankInfo.estimatedRankText : 'パスワードを入力してください'}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              {password ? rankInfo.title : '安全なパスワードを入力して診断開始'}
            </div>
          </div>
        </div>

        {/* Leak Threat Meter Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>ハッカーの辞書優先度（流出危険度メーター）</span>
            <span className={theme.text}>
              {password
                ? rankInfo.isRanked
                  ? '極めて危険（即時標的）'
                  : '辞書走査リスト圏外'
                : '待機中'}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${theme.barColor}`}
              style={{ width: `${password ? theme.meterPercent : 0}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>低リスク（辞書非該当）</span>
            <span className="text-amber-400/80">上位10万語 (派生ルール)</span>
            <span className="text-rose-400 font-bold">上位100語 (秒殺)</span>
          </div>
        </div>
      </div>

      {/* Match Pattern & Education Advice Callout */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 font-mono">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
            <span className="text-cyan-400">検出パターン情報:</span>
            <span className="text-slate-500">
              {rankInfo.matchedPattern}
            </span>
          </div>
          <p className="text-slate-300 font-sans leading-relaxed">
            {rankInfo.recommendation}
          </p>
        </div>

        {/* Why Dictionary attacks work */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            ハッカーはランダムな文字よりも先に「過去に世界中で漏洩したパスワード集」から試行します。
          </span>
        </div>
      </div>
    </div>
  );
};
