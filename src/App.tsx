import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PasswordInput } from './components/PasswordInput';
import { ResistanceCard } from './components/ResistanceCard';
import { CharCoverage } from './components/CharCoverage';
import { SimulationConsole } from './components/SimulationConsole';
import { AdviceAndGuide } from './components/AdviceAndGuide';
import { PasswordHistoryChart } from './components/PasswordHistoryChart';
import { LeakRankCard } from './components/LeakRankCard';
import { DangerAlertModal } from './components/DangerAlertModal';
import { Footer } from './components/Footer';
import { analyzePassword, ATTACK_PRESETS, generateStrongPassword } from './utils/security';
import { toggleSound, isSoundEnabled, playKeyTick, playCrackAlert } from './utils/sound';
import { PasswordHistoryItem } from './types';

// Masking helper (e.g. "Tokyo2026!" -> "To****6!")
function maskPassword(pw: string): string {
  if (pw.length <= 4) return pw.replace(/./g, '*');
  const first = pw.slice(0, 2);
  const last = pw.slice(-2);
  const middle = '*'.repeat(Math.min(pw.length - 4, 6));
  return `${first}${middle}${last}`;
}

export default function App() {
  const [password, setPassword] = useState('Tokyo2026!');
  const [currentPreset, setCurrentPreset] = useState(ATTACK_PRESETS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initial history with 3 educational starter points to demonstrate the trend right away
  const [history, setHistory] = useState<PasswordHistoryItem[]>([
    {
      id: 'init-1',
      step: 1,
      password: '123456',
      maskedPassword: '12**56',
      length: 6,
      entropy: 19.9,
      level: 1,
      levelLabel: 'レベル 1: 超危険',
      formattedTime: '一瞬（0.0001秒・辞書攻撃）',
      timestamp: '22:00:15',
    },
    {
      id: 'init-2',
      step: 2,
      password: 'Tokyo2026',
      maskedPassword: 'To*****26',
      length: 9,
      entropy: 53.6,
      level: 2,
      levelLabel: 'レベル 2: 危険',
      formattedTime: '約 0.7 秒',
      timestamp: '22:01:05',
    },
    {
      id: 'init-3',
      step: 3,
      password: 'Tokyo2026!',
      maskedPassword: 'To******6!',
      length: 10,
      entropy: 65.5,
      level: 3,
      levelLabel: 'レベル 3: 注意',
      formattedTime: '約 2.8 日',
      timestamp: '22:01:45',
    },
  ]);

  const [autoTrack, setAutoTrack] = useState(true);
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const dismissedDangersRef = useRef<Set<string>>(new Set());

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundEnabled(next);
  };

  const analysis = useMemo(() => {
    return analyzePassword(password, currentPreset.rate);
  }, [password, currentPreset]);

  // Debounced danger alert trigger when password is dictionary-matched or extremely short
  const dangerTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (dangerTimerRef.current) {
      clearTimeout(dangerTimerRef.current);
    }

    if (!password || password.trim().length === 0) {
      setIsDangerModalOpen(false);
      return;
    }

    const trimmed = password.trim();
    const isExtremeDanger =
      analysis.isDictionary ||
      analysis.isSequentialOrRepeated ||
      (trimmed.length > 0 && trimmed.length < 8);

    if (isExtremeDanger && !dismissedDangersRef.current.has(trimmed)) {
      // Trigger modal alert after user pauses typing for 800ms
      dangerTimerRef.current = setTimeout(() => {
        setIsDangerModalOpen(true);
        playCrackAlert();
      }, 800);
    } else {
      setIsDangerModalOpen(false);
    }

    return () => {
      if (dangerTimerRef.current) {
        clearTimeout(dangerTimerRef.current);
      }
    };
  }, [password, analysis.isDictionary, analysis.isSequentialOrRepeated, analysis.length]);

  // Debounced auto-record history on significant password edit
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRecordedPasswordRef = useRef<string>('Tokyo2026!');

  useEffect(() => {
    if (!autoTrack) return;
    if (!password || password.trim().length === 0) return;
    if (password === lastRecordedPasswordRef.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      addPasswordToHistory(password);
    }, 1200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [password, currentPreset.rate, autoTrack]);

  const addPasswordToHistory = (pwToRecord: string = password) => {
    if (!pwToRecord) return;
    const itemAnalysis = analyzePassword(pwToRecord, currentPreset.rate);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    lastRecordedPasswordRef.current = pwToRecord;

    setHistory((prev) => {
      // Avoid duplicate consecutive entry
      if (prev.length > 0 && prev[prev.length - 1].password === pwToRecord) {
        return prev;
      }

      const newItem: PasswordHistoryItem = {
        id: Math.random().toString(),
        step: prev.length + 1,
        password: pwToRecord,
        maskedPassword: maskPassword(pwToRecord),
        length: pwToRecord.length,
        entropy: itemAnalysis.entropy,
        level: itemAnalysis.level,
        levelLabel: itemAnalysis.levelLabel,
        formattedTime: itemAnalysis.formattedTime,
        timestamp: timeStr,
      };

      // Keep only the past 5 entries
      const updated = [...prev, newItem];
      return updated.slice(-5);
    });
  };

  const handleRestorePassword = (restored: string) => {
    playKeyTick();
    setPassword(restored);
  };

  const handleDeleteHistoryItem = (idToDelete: string) => {
    playKeyTick();
    setHistory((prev) => prev.filter((item) => item.id !== idToDelete));
  };

  const handleClearHistory = () => {
    playKeyTick();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#0d121f] text-slate-100 flex flex-col cyber-grid relative selection:bg-teal-500/30 selection:text-teal-200">
      <Header soundEnabled={soundEnabled} onToggleSound={handleToggleSound} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Section: Password Input & Controls */}
        <section aria-labelledby="password-input-section">
          <h2 id="password-input-section" className="sr-only">
            パスワード入力と設定
          </h2>
          <PasswordInput password={password} onChange={setPassword} />
        </section>

        {/* Recharts Password Strength Transition History Component */}
        <section aria-labelledby="password-history-section">
          <h2 id="password-history-section" className="sr-only">
            パスワード強度 遷移チャート
          </h2>
          <PasswordHistoryChart
            history={history}
            currentAnalysis={analysis}
            onRestorePassword={handleRestorePassword}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
            onAddCurrentToHistory={() => addPasswordToHistory(password)}
            autoTrack={autoTrack}
            onToggleAutoTrack={() => setAutoTrack(!autoTrack)}
          />
        </section>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Resistance Card & Character Coverage & Interactive Console */}
          <div className="lg:col-span-7 space-y-6">
            <section aria-labelledby="resistance-metrics">
              <h2 id="resistance-metrics" className="sr-only">
                耐性スコアと解読予測
              </h2>
              <ResistanceCard
                analysis={analysis}
                currentPreset={currentPreset}
                onSelectPreset={setCurrentPreset}
                presets={ATTACK_PRESETS}
              />
            </section>

            <section aria-labelledby="char-coverage-section">
              <h2 id="char-coverage-section" className="sr-only">
                文字種網羅
              </h2>
              <CharCoverage analysis={analysis} />
            </section>

            <section aria-labelledby="virtual-console-section">
              <h2 id="virtual-console-section" className="sr-only">
                仮想クラックシミュレーション
              </h2>
              <SimulationConsole
                analysis={analysis}
                currentPreset={currentPreset}
              />
            </section>
          </div>

          {/* Right Column (5 cols): Leak Rank Diagnosis, Advice & Security Guide Columns */}
          <div className="lg:col-span-5 space-y-6">
            <section aria-labelledby="leak-rank-section">
              <h2 id="leak-rank-section" className="sr-only">
                漏洩辞書ランクイン診断
              </h2>
              <LeakRankCard password={password} />
            </section>

            <section aria-labelledby="advice-section">
              <h2 id="advice-section" className="sr-only">
                アドバイスとセキュリティ解説
              </h2>
              <AdviceAndGuide analysis={analysis} onApplyExample={setPassword} />
            </section>
          </div>
        </div>
      </main>

      {/* Danger Alert Modal Component for Short or Common Dictionary Passwords */}
      <DangerAlertModal
        isOpen={isDangerModalOpen}
        analysis={analysis}
        onClose={() => {
          dismissedDangersRef.current.add(password.trim());
          setIsDangerModalOpen(false);
        }}
        onGenerateStrong={() => {
          const newStrong = generateStrongPassword(16);
          setPassword(newStrong);
          setIsDangerModalOpen(false);
        }}
      />

      <Footer />
    </div>
  );
}

