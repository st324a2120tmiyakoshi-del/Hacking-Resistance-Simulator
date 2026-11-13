import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Square,
  RefreshCw,
  ShieldCheck,
  AlertOctagon,
  Cpu,
  Zap,
  BookOpen,
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { PasswordAnalysis, AttackPreset } from '../types';
import {
  DICTIONARY_WORDLISTS,
  TOP_DICTIONARY_WORDS,
  checkDictionaryAttack,
  DictionaryWordlist,
} from '../utils/dictionary';
import { playCrackAlert, playSecureChime, playKeyTick } from '../utils/sound';

interface SimulationConsoleProps {
  analysis: PasswordAnalysis;
  currentPreset: AttackPreset;
}

interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'warn' | 'success' | 'danger' | 'system';
}

export const SimulationConsole: React.FC<SimulationConsoleProps> = ({
  analysis,
  currentPreset,
}) => {
  const { password, crackTimeSeconds, formattedTime } = analysis;

  // Mode: 'bruteforce' (GPU total combination) or 'dictionary' (wordlist + Hashcat rules)
  const [attackMode, setAttackMode] = useState<'bruteforce' | 'dictionary'>('dictionary');
  const [selectedWordlist, setSelectedWordlist] = useState<DictionaryWordlist>(DICTIONARY_WORDLISTS[0]);

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      time: '00:00:00.000',
      text: '[SYSTEM] 攻撃シミュレーター起動完了。ブルートフォース & 辞書攻撃エンジン待機中...',
      type: 'system',
    },
    {
      id: 'init-2',
      time: '00:00:00.005',
      text: `[SYSTEM] 照合辞書データベース: ${selectedWordlist.name} (${selectedWordlist.sizeLabel})`,
      type: 'info',
    },
  ]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [trialsCount, setTrialsCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [simulationResult, setSimulationResult] = useState<'idle' | 'cracked' | 'secure'>('idle');
  const [dictionaryVerdict, setDictionaryVerdict] = useState<ReturnType<typeof checkDictionaryAttack> | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const addLog = (text: string, type: LogEntry['type']) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
      now.getMilliseconds()
    ).padStart(3, '0')}`;

    setLogs((prev) => [...prev.slice(-50), { id: Math.random().toString(), time: timeStr, text, type }]);
  };

  // Run Dictionary Attack Simulation
  const runDictionarySimulation = () => {
    if (!password) {
      addLog('[ERROR] パスワードが入力されていません。', 'danger');
      return;
    }

    setIsRunning(true);
    setSimulationResult('idle');
    setTrialsCount(0);
    setElapsedMs(0);
    startTimeRef.current = performance.now();

    const dictResult = checkDictionaryAttack(password, selectedWordlist.sizeCount);
    setDictionaryVerdict(dictResult);

    addLog(`[DICTIONARY] 辞書攻撃モード実行: ${selectedWordlist.name}`, 'system');
    addLog(`[RULE-ENGINE] Hashcat Best64 & Leetspeak変形ルール展開中...`, 'info');
    addLog(`[TARGET] 照合対象: "${password}" (${password.length}文字)`, 'info');

    const totalWords = selectedWordlist.sizeCount;
    const simDuration = dictResult.matched ? 1600 : 2500; // time in ms for visual effect
    const sampleWords = TOP_DICTIONARY_WORDS.map((w) => w.word);

    let wordIdx = 0;

    const loop = (time: number) => {
      const elapsed = time - startTimeRef.current;
      setElapsedMs(Math.round(elapsed));

      // Calculate scanned words
      const progress = Math.min(elapsed / simDuration, 1);
      const wordsScanned = Math.floor(progress * (dictResult.matched ? (dictResult.rank ? dictResult.rank * 150 : 2500) : totalWords));
      setTrialsCount(wordsScanned);

      // Roll dictionary words
      if (wordIdx < sampleWords.length) {
        setCurrentGuess(sampleWords[wordIdx % sampleWords.length]);
        wordIdx++;
      } else {
        setCurrentGuess(sampleWords[Math.floor(Math.random() * sampleWords.length)]);
      }

      if (elapsed < simDuration) {
        animationFrameRef.current = requestAnimationFrame(loop);
      } else {
        // Finished
        setIsRunning(false);
        if (dictResult.matched) {
          setCurrentGuess(dictResult.matchedWord || password);
          setSimulationResult('cracked');
          playCrackAlert();
          addLog(`💥 [CRACKED!] 辞書データベースで一致を検出！`, 'danger');
          addLog(`[MATCH] 適用ルール: ${dictResult.ruleDescription}`, 'danger');
          addLog(`[RESULT] 実質解読時間: ${dictResult.formattedTime}`, 'danger');
          addLog(`[VERDICT] ${dictResult.explanation}`, 'danger');
        } else {
          setCurrentGuess('[辞書走査完了: 不一致]');
          setSimulationResult('secure');
          playSecureChime();
          addLog(`🛡️ [SECURE] 辞書リスト ${totalWords.toLocaleString()} 件に一致なし！`, 'success');
          addLog(`[RESULT] 走査時間: ${(elapsed / 1000).toFixed(2)} 秒`, 'success');
          addLog(`[ANALYSIS] 辞書攻撃を突破しました。攻撃者は総当たり（ブルートフォース）への移行を強いられます。`, 'success');
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  // Run Brute Force Simulation
  const runBruteForceSimulation = () => {
    if (!password) {
      addLog('[ERROR] パスワードが入力されていません。', 'danger');
      return;
    }

    setIsRunning(true);
    setSimulationResult('idle');
    setTrialsCount(0);
    setElapsedMs(0);
    startTimeRef.current = performance.now();

    addLog(`[TARGET] 解析対象文字数: ${password.length}文字, 探索空間: ${analysis.poolSize}種類`, 'system');
    addLog(`[ATTACK] 総当たり攻撃 (Brute-Force) を開始します...`, 'warn');

    // If already dictionary matched or very low time
    const willCrack = crackTimeSeconds < 3600;
    const simDuration = willCrack ? (crackTimeSeconds < 1 ? 1200 : 2600) : 3800;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

    const loop = (time: number) => {
      const elapsed = time - startTimeRef.current;
      setElapsedMs(Math.round(elapsed));

      const simulatedTrials = Math.floor((elapsed / 1000) * currentPreset.rate);
      setTrialsCount(simulatedTrials);

      let guess = '';
      const progressRatio = Math.min(elapsed / simDuration, 1);

      if (willCrack) {
        const revealedChars = Math.floor(progressRatio * password.length);
        for (let i = 0; i < password.length; i++) {
          if (i < revealedChars) {
            guess += password[i];
          } else {
            guess += chars[Math.floor(Math.random() * chars.length)];
          }
        }
      } else {
        for (let i = 0; i < password.length; i++) {
          guess += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setCurrentGuess(guess);

      if (elapsed < simDuration) {
        animationFrameRef.current = requestAnimationFrame(loop);
      } else {
        setIsRunning(false);
        if (willCrack) {
          setCurrentGuess(password);
          setSimulationResult('cracked');
          playCrackAlert();
          addLog(`[STATUS] キー空間のハッシュ衝突を検出。`, 'warn');
          addLog(`💥 [CRACKED!] パスワード "${password}" が解読されました！`, 'danger');
          addLog(`[METRIC] 試行回数: ${simulatedTrials.toLocaleString()} 回, 解読時間: ${(elapsed / 1000).toFixed(2)}秒`, 'danger');
        } else {
          setSimulationResult('secure');
          playSecureChime();
          addLog(`[TIMEOUT] 試行上限（${simulatedTrials.toLocaleString()} 回）到達。解読不能。`, 'info');
          addLog(`🛡️ [SECURE] 制限時間内に解読できませんでした！推定解読時間: ${formattedTime}`, 'success');
          addLog(`[ANALYSIS] 強固な暗号学的エントロピー（${analysis.entropy} bit）によりGPUクラスタの突破を完全防御。`, 'success');
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const handleStart = () => {
    if (attackMode === 'dictionary') {
      runDictionarySimulation();
    } else {
      runBruteForceSimulation();
    }
  };

  const stopSimulation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRunning(false);
    addLog('[HALT] ユーザーによってシミュレーションが中断されました。', 'warn');
  };

  const clearLogs = () => {
    playKeyTick();
    setLogs([
      {
        id: Math.random().toString(),
        time: '00:00:00.000',
        text: '[SYSTEM] ターミナルログが初期化されました。',
        type: 'system',
      },
    ]);
    setSimulationResult('idle');
    setDictionaryVerdict(null);
    setCurrentGuess('');
    setTrialsCount(0);
    setElapsedMs(0);
  };

  return (
    <div className="bg-black/95 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative font-mono">
      {/* Terminal Header & Mode Switcher */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs text-slate-400 font-mono pl-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            解読シミュレーション コンソール
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                playKeyTick();
                setAttackMode('dictionary');
                setSimulationResult('idle');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                attackMode === 'dictionary'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>辞書攻撃 (Dictionary)</span>
            </button>
            <button
              onClick={() => {
                playKeyTick();
                setAttackMode('bruteforce');
                setSimulationResult('idle');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                attackMode === 'bruteforce'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>総当たり (Brute-force)</span>
            </button>
          </div>

          <button
            onClick={clearLogs}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1 rounded hover:bg-slate-800 flex items-center gap-1 border border-transparent hover:border-slate-700"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">クリア</span>
          </button>
        </div>
      </div>

      {/* Dictionary Settings Sub-bar (Only when dictionary mode active) */}
      {attackMode === 'dictionary' && (
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 font-mono">照合リスト:</span>
            <select
              value={selectedWordlist.id}
              onChange={(e) => {
                const found = DICTIONARY_WORDLISTS.find((w) => w.id === e.target.value);
                if (found) {
                  setSelectedWordlist(found);
                  addLog(`[CONFIG] 辞書リストを「${found.name}」に変更しました。`, 'info');
                }
              }}
              className="bg-slate-950 border border-slate-700 text-amber-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {DICTIONARY_WORDLISTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sizeLabel})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>ルールエンジン:</span>
            <span className="text-cyan-400 font-mono">Hashcat Best64 + Leet置換有効</span>
          </div>
        </div>
      )}

      {/* Control Action Bar */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!password}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 ${
                attackMode === 'dictionary'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              {attackMode === 'dictionary' ? (
                <>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>辞書攻撃シミュレーションを開始</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>総当たり攻撃シミュレーションを開始</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>シミュレーションを中断</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            {attackMode === 'dictionary' ? (
              <span className="flex items-center gap-1.5 text-amber-300">
                <Database className="w-3.5 h-3.5" />
                <span>漏洩辞書照合 (高速ハッシュマッチング)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>{currentPreset.rateLabel}</span>
              </span>
            )}
          </div>
        </div>

        {/* Real-time Counter Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">
              {attackMode === 'dictionary' ? '照合済み単語数' : '総当たり試行数'}
            </div>
            <div className="text-cyan-400 font-bold tabular-nums">
              {trialsCount.toLocaleString()} {attackMode === 'dictionary' ? '語' : '回'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">実行時間</div>
            <div className="text-white font-bold tabular-nums">
              {(elapsedMs / 1000).toFixed(3)} 秒
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Rolling Guess Stage */}
      <div className="p-4 sm:p-5 bg-black border-b border-slate-800">
        <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                attackMode === 'dictionary' ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
            />
            {attackMode === 'dictionary'
              ? '辞書ワードリスト走査レーン（リアルタイム照合）:'
              : 'GPUクラスタ探索レーン（試行バッファ）:'}
          </span>
          <span className="text-slate-500">
            {password ? `${password.length} 桁` : '待機中'}
          </span>
        </div>

        <div className="bg-slate-950 rounded-xl p-3 sm:p-4 border border-slate-800 font-mono flex items-center justify-between text-base sm:text-xl tracking-widest overflow-hidden min-h-[58px]">
          {isRunning ? (
            <div className="flex items-center gap-1 text-cyan-300 animate-pulse">
              <span className="text-emerald-400 select-none">&gt;&gt;</span>
              <span
                className={`drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] font-bold ${
                  attackMode === 'dictionary' ? 'text-amber-300' : 'text-cyan-300'
                }`}
              >
                {currentGuess || '••••••••'}
              </span>
              <span className="inline-block w-2.5 h-5 bg-cyan-400 animate-bounce ml-1" />
            </div>
          ) : simulationResult === 'cracked' ? (
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <span>CRACKED: {currentGuess}</span>
            </div>
          ) : simulationResult === 'secure' ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>
                {attackMode === 'dictionary'
                  ? 'NOT FOUND: 辞書内に一致なし（辞書攻撃防御成功）'
                  : 'DEFENSE ACTIVE: 攻撃遮断成功（解読不可）'}
              </span>
            </div>
          ) : (
            <span className="text-slate-600 text-sm tracking-normal">
              {attackMode === 'dictionary'
                ? '「辞書攻撃シミュレーションを開始」を押すと、漏洩辞書との照合と変形ルール試行が実行されます'
                : '「総当たり攻撃シミュレーションを開始」を押すと、GPU総当たり試行がリアルタイムで実行されます'}
            </span>
          )}

          <div className="text-xs text-slate-500 font-mono hidden md:block">
            {attackMode === 'dictionary' ? selectedWordlist.name : currentPreset.name}
          </div>
        </div>
      </div>

      {/* Terminal Output Logs */}
      <div className="p-4 bg-black font-mono text-xs max-h-64 overflow-y-auto terminal-scroll space-y-1.5">
        {logs.map((log) => {
          let color = 'text-slate-300';
          if (log.type === 'system') color = 'text-cyan-400';
          if (log.type === 'warn') color = 'text-amber-400';
          if (log.type === 'danger') color = 'text-red-400 font-bold';
          if (log.type === 'success') color = 'text-emerald-400 font-bold';

          return (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 select-none shrink-0 font-mono">
                {log.time}
              </span>
              <span className={`${color} break-all`}>{log.text}</span>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Pop-up Overlay Result with Dictionary Detailed Breakdown */}
      {simulationResult !== 'idle' && (
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in ${
            simulationResult === 'cracked'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            {simulationResult === 'cracked' ? (
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40 mt-0.5 sm:mt-0">
                <Flame className="w-5 h-5 text-red-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40 mt-0.5 sm:mt-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            )}
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>
                  {simulationResult === 'cracked'
                    ? attackMode === 'dictionary'
                      ? '[CRACKED] 辞書攻撃により即時破綻しました'
                      : '[CRACKED] パスワードが突破されました'
                    : attackMode === 'dictionary'
                    ? '[RESISTANT] 辞書攻撃を防御しました'
                    : '[SECURE] 制限時間内に解読できませんでした'}
                </span>
                {dictionaryVerdict?.matched && attackMode === 'dictionary' && (
                  <span className="px-2 py-0.5 rounded bg-red-500/30 text-red-300 text-[10px] font-mono border border-red-400/40">
                    所要時間: {dictionaryVerdict.formattedTime}
                  </span>
                )}
              </div>
              <div className="text-xs opacity-90 mt-1 leading-relaxed">
                {attackMode === 'dictionary' && dictionaryVerdict
                  ? dictionaryVerdict.explanation
                  : simulationResult === 'cracked'
                  ? `最新GPUの演算能力により短時間で解読されました。パスワードの長さを増やすか、記号・数字を追加してください。`
                  : `強力なエントロピーにより、総当たり攻撃を完全に跳ね返しました。`}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSimulationResult('idle')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors shrink-0 self-end sm:self-auto"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};
