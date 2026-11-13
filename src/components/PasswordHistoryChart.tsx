import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Dot,
} from 'recharts';
import { Activity, History, Trash2, ArrowUpRight, ArrowDownRight, Minus, PlusCircle, RotateCcw } from 'lucide-react';
import { PasswordHistoryItem, PasswordAnalysis } from '../types';

interface PasswordHistoryChartProps {
  history: PasswordHistoryItem[];
  currentAnalysis: PasswordAnalysis;
  onRestorePassword: (password: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onAddCurrentToHistory: () => void;
  autoTrack: boolean;
  onToggleAutoTrack: () => void;
}

export const PasswordHistoryChart: React.FC<PasswordHistoryChartProps> = ({
  history,
  currentAnalysis,
  onRestorePassword,
  onClearHistory,
  onDeleteHistoryItem,
  onAddCurrentToHistory,
  autoTrack,
  onToggleAutoTrack,
}) => {
  const [metricMode, setMetricMode] = useState<'level' | 'entropy' | 'both'>('level');

  // Chart data format:
  const chartData = history.map((item, idx) => ({
    index: idx + 1,
    name: `#${idx + 1} (${item.length}文字)`,
    rawName: `#${idx + 1}`,
    level: item.level,
    entropy: item.entropy,
    maskedPassword: item.maskedPassword,
    fullPassword: item.password,
    formattedTime: item.formattedTime,
    levelLabel: item.levelLabel,
    timestamp: item.timestamp,
  }));

  // Trend calculation between last two entries
  const trend = React.useMemo(() => {
    if (history.length < 2) return null;
    const prev = history[history.length - 2];
    const curr = history[history.length - 1];
    const levelDiff = curr.level - prev.level;
    const entropyDiff = Number((curr.entropy - prev.entropy).toFixed(1));
    return { levelDiff, entropyDiff };
  }, [history]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return '#f43f5e'; // rose-500
      case 2:
        return '#f59e0b'; // amber-500
      case 3:
        return '#eab308'; // yellow-500
      case 4:
        return '#14b8a6'; // teal-500
      case 5:
        return '#10b981'; // emerald-500
      default:
        return '#64748b';
    }
  };

  // Custom Dot component to color each point according to its level
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const color = getLevelColor(payload.level);
    return (
      <circle
        key={`dot-${payload.index}`}
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="#0b0f19"
        strokeWidth={2}
        className="transition-all hover:r-7"
      />
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = getLevelColor(data.level);
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl font-mono text-xs backdrop-blur-md max-w-xs z-50">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
            <span>記録 {data.rawName}</span>
            <span>{data.timestamp}</span>
          </div>

          <div className="text-white font-bold mb-1 flex items-center justify-between">
            <span className="tracking-wider">{data.maskedPassword}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ({data.fullPassword.length}文字)
            </span>
          </div>

          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">耐性レベル:</span>
              <span style={{ color }} className="font-bold">
                レベル {data.level} / 5
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">エントロピー:</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {data.entropy} bit
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">推定解読時間:</span>
              <span className="text-slate-200 truncate ml-2 font-semibold">
                {data.formattedTime}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl relative overflow-hidden">
      {/* Background cyber accent */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 font-display">
              <span>パスワード強度 遷移チャート</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-cyan-400">
                直近 {history.length} / 5 件
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            入力・修正した過去5件の耐性スコアおよび情報量（エントロピー）の変化を追跡
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric mode toggle tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setMetricMode('level')}
              className={`px-2.5 py-1 rounded transition-colors ${
                metricMode === 'level'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              耐性Lv (1-5)
            </button>
            <button
              onClick={() => setMetricMode('entropy')}
              className={`px-2.5 py-1 rounded transition-colors ${
                metricMode === 'entropy'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              エントロピー (bit)
            </button>
            <button
              onClick={() => setMetricMode('both')}
              className={`px-2.5 py-1 rounded transition-colors ${
                metricMode === 'both'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              両方
            </button>
          </div>

          <button
            onClick={onAddCurrentToHistory}
            disabled={!currentAnalysis.password}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="現在のパスワードを履歴に記録"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>記録</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
              title="履歴をクリア"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>クリア</span>
            </button>
          )}
        </div>
      </div>

      {/* Trend indicator badge */}
      {trend && (
        <div className="mt-3 flex items-center justify-between bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800/70 text-xs">
          <span className="text-slate-400">直前の入力との強度比較:</span>
          <div className="flex items-center gap-3 font-mono">
            {trend.levelDiff > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                耐性向上: +{trend.levelDiff} レベル
              </span>
            ) : trend.levelDiff < 0 ? (
              <span className="text-red-400 font-semibold flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5" />
                耐性低下: {trend.levelDiff} レベル
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <Minus className="w-3.5 h-3.5" />
                耐性レベル維持
              </span>
            )}

            <span className="text-slate-500">|</span>

            <span
              className={
                trend.entropyDiff > 0
                  ? 'text-cyan-400'
                  : trend.entropyDiff < 0
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }
            >
              エントロピー: {trend.entropyDiff > 0 ? `+${trend.entropyDiff}` : trend.entropyDiff} bit
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="mt-4 h-56 sm:h-64 w-full">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
            <History className="w-8 h-8 text-slate-700 mb-2" />
            <p>まだ履歴データがありません。</p>
            <p className="text-[11px] text-slate-600 mt-1">
              パスワードを入力・変更するか、「記録」ボタンを押すと遷移グラフが表示されます。
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 20, left: -15, bottom: 5 }}
            >
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              {/* YAxis for Level (Left) */}
              {(metricMode === 'level' || metricMode === 'both') && (
                <YAxis
                  yAxisId="left"
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(val) => `Lv.${val}`}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
              )}

              {/* YAxis for Entropy (Right) */}
              {(metricMode === 'entropy' || metricMode === 'both') && (
                <YAxis
                  yAxisId="right"
                  orientation={metricMode === 'both' ? 'right' : 'left'}
                  domain={[0, 'auto']}
                  stroke="#64748b"
                  tick={{ fill: '#06b6d4', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(val) => `${val}b`}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
              )}

              <Tooltip content={<CustomTooltip />} />

              {/* Safe threshold line (Level 4: High Resistance) */}
              {(metricMode === 'level' || metricMode === 'both') && (
                <ReferenceLine
                  yAxisId="left"
                  y={4}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  label={{
                    value: '推奨安全基準 (Lv.4)',
                    fill: '#10b981',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}

              {/* Level line */}
              {(metricMode === 'level' || metricMode === 'both') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="level"
                  name="耐性レベル"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={renderCustomDot}
                  activeDot={{ r: 7, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
                  animationDuration={600}
                />
              )}

              {/* Entropy line */}
              {(metricMode === 'entropy' || metricMode === 'both') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="entropy"
                  name="エントロピー(bit)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray={metricMode === 'both' ? '4 2' : undefined}
                  dot={{ r: 4, fill: '#a855f7' }}
                  activeDot={{ r: 6, fill: '#c084fc' }}
                  animationDuration={600}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* History Items Strip (Max 5 entries) */}
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
            <span className="font-semibold text-slate-300">履歴リスト（復元 &amp; 個別削除）:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleAutoTrack}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  autoTrack
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}
                title="パスワード変更時の自動履歴記録を切り替え"
              >
                {autoTrack ? '自動記録: ON' : '自動記録: 停止中 (プライバシー優先)'}
              </button>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                ※最大5件保持
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-xs">
            {history.map((item, idx) => {
              const color = getLevelColor(item.level);
              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-left transition-all flex flex-col justify-between group relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ color }}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
                      >
                        Lv.{item.level}
                      </span>
                      {/* Individual Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHistoryItem(item.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="この履歴を安全に完全削除"
                        aria-label={`履歴 #${idx + 1} を削除`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-slate-200 font-medium truncate py-1">
                    {item.maskedPassword}
                  </div>

                  <div className="mt-1 pt-1.5 border-t border-slate-900/90 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{item.length}文字</span>
                    {/* Restore Button */}
                    <button
                      type="button"
                      onClick={() => onRestorePassword(item.password)}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-sans font-medium"
                      title="このパスワードを入力欄に復元"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>復元</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
