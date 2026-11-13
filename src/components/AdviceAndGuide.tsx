import React, { useState } from 'react';
import {
  Lightbulb,
  BookOpen,
  Shield,
  KeyRound,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Atom,
} from 'lucide-react';
import { PasswordAnalysis } from '../types';
import { playKeyTick } from '../utils/sound';

interface AdviceAndGuideProps {
  analysis: PasswordAnalysis;
  onApplyExample?: (sample: string) => void;
}

export const AdviceAndGuide: React.FC<AdviceAndGuideProps> = ({
  analysis,
  onApplyExample,
}) => {
  const { suggestions, length, entropy } = analysis;
  const [activeTab, setActiveTab] = useState<number>(0);

  const columns = [
    {
      id: 'length',
      badge: '必読・基本原則',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      title: 'なぜ「長さ（桁数）」が最大の防御になるのか？',
      shortDesc: '複雑な8文字より、平易な16文字が数千億倍安全な数学的理由',
      icon: <Lock className="w-5 h-5 text-cyan-400" />,
      accentBorder: 'border-cyan-500/40',
      accentGlow: 'hover:border-cyan-500/60',
      example: 'N8#wP$9vL@2xQ!4m',
      exampleLabel: '安全な16文字',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            ブルートフォース攻撃に対する耐性は、探索空間の総数{' '}
            <span className="font-mono text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              S = N^L
            </span>{' '}
            （Nは文字種プール、Lはパスワードの文字数）という指数関数で決まります。
          </p>

          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 shadow-inner">
            <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>【指数の爆発（Exponential Explosion）の比較】</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">・英小文字のみ 8文字 (26⁸):</span>
              <span className="text-rose-400 font-bold">約 2,088 億通り（約 10 秒で突破）</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">・英小文字のみ 12文字 (26¹²):</span>
              <span className="text-amber-400 font-bold">約 9,540 京通り（約 151 年かかる）</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">・英小文字のみ 16文字 (26¹⁶):</span>
              <span className="text-emerald-400 font-bold">約 43 不可思議（約 68 兆年かかる）</span>
            </div>
          </div>

          <p>
            文字種（英小文字から大文字や記号）を増やすこと（底N）も有効ですが、<strong>文字数（指数L）を延ばすことによる計算量の急増は天文学的</strong>です。「覚えるのが苦痛な複雑な8文字」よりも「長くて単純な16文字」のほうがハッカーにとって圧倒的に攻略困難になります。
          </p>
        </div>
      ),
    },
    {
      id: 'passphrase',
      badge: '推奨テクニック',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      title: '覚えやすくて強固な「パスフレーズ」とは？',
      shortDesc: '日常の単語を繋げて、人間が暗記しやすく機械には解読不可能な長さを獲得',
      icon: <KeyRound className="w-5 h-5 text-emerald-400" />,
      accentBorder: 'border-emerald-500/40',
      accentGlow: 'hover:border-emerald-500/60',
      example: 'correct-horse-battery-99',
      exampleLabel: 'パスフレーズ例',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            ランダムな記号の羅列（例: <code className="text-emerald-300 font-mono bg-slate-950 px-1 py-0.5 rounded">X#9@qL$2!vM</code>）は人間が覚えるのが極めて困難で、付箋にメモしたりブラウザに自動保存したまま放置して漏洩する原因になります。
          </p>
          <p>
            そこで米NIST（国立標準技術研究所）をはじめ世界的に推奨されているのが、複数の日常単語をハイフンや数字で繋げた<strong>「パスフレーズ（Passphrase）方式」</strong>です。
          </p>

          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-emerald-500/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold font-mono text-sm">
                例: correct-horse-battery-99
              </span>
              <span className="text-[10px] text-slate-500 font-mono">25文字 / エントロピー高</span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              単語の組み合わせにより全体の文字数は20文字を超え、総当たり攻撃では宇宙の寿命（数兆年）以上の年月がかかります。しかし人間にとっては「正しい馬のバッテリー99」と情景として簡単に暗記できます。
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'mfa',
      badge: '究極の防壁',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      title: '二重の鍵「多要素認証（MFA / 2FA）」の重要性',
      shortDesc: 'パスワードが漏洩してもアカウントへの侵入を99.9%阻止できる仕組み',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      accentBorder: 'border-purple-500/40',
      accentGlow: 'hover:border-purple-500/60',
      example: 'Google Authenticator / Passkey',
      exampleLabel: '認証手段',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            どれほど強固なパスワードを設定していても、フィッシング詐欺サイトに入力してしまったり、サービス提供元企業からデータベースが流出した場合には突破されてしまいます。
          </p>
          <p>
            これを防ぐ究極の防壁が<strong>「多要素認証（MFA / 2要素認証）」</strong>です。以下の3要素のうち2つ以上を組み合わせます：
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">要素 1: 知っていること</div>
              <div className="font-bold text-slate-200 mt-0.5">知識要素</div>
              <div className="text-[10px] text-slate-500 mt-1">パスワード, PIN</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">要素 2: 持っているもの</div>
              <div className="font-bold text-slate-200 mt-0.5">所持要素</div>
              <div className="text-[10px] text-slate-500 mt-1">スマホ認証アプリ, 物理Key</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px]">要素 3: あなた自身</div>
              <div className="font-bold text-slate-200 mt-0.5">生体要素</div>
              <div className="text-[10px] text-slate-500 mt-1">指紋認証, 顔認証 (Passkey)</div>
            </div>
          </div>

          <p className="text-slate-400 text-xs">
            パスワードを知られても第2の認証端末が手元になければログインできないため、マイクロソフトの調査では<strong>アカウント乗っ取りの99.9%を防御できる</strong>と実証されています。
          </p>
        </div>
      ),
    },
    {
      id: 'pqc',
      badge: '最新トレンド',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      title: '耐量子暗号（PQC）と「Grover/Shor」の脅威',
      shortDesc: '量子計算の出現で暗号はどう壊れ、なぜ鍵長の倍増が必要になるのか？',
      icon: <Atom className="w-5 h-5 text-indigo-400" />,
      accentBorder: 'border-indigo-500/40',
      accentGlow: 'hover:border-indigo-500/60',
      example: 'K#9m$X2qL!vP4wZ7@bR9eT1yU3iO5sA8',
      exampleLabel: 'PQC耐性32文字',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            実用的な誤り訂正量子コンピュータが実現すると、従来の公開鍵暗号（RSAや楕円曲線暗号）は<strong>Shorアルゴリズム</strong>によって多項式時間で瞬時に因数分解され、完全に破綻します。
          </p>

          <p>
            一方、パスワードやAESなどの共通鍵暗号に対しては<strong>Groverアルゴリズム</strong>が適用されます。Groverは O(N) の探索ステップを O(√N) へ二乗加速（Quadratic Speedup）します。
          </p>

          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-indigo-500/30 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5">
              <Atom className="w-4 h-4" />
              <span>【Groverアルゴリズムによる「エントロピー半減」の数学】</span>
            </div>
            <div className="text-[12px] text-slate-300 leading-relaxed space-y-1">
              <div>・従来の総当たり探索空間: S = N^L （128 bit エントロピーなら 2¹²⁸ 通り）</div>
              <div>・量子Grover探索空間: √S = S^0.5 （実質 2⁶⁴ ステップで解読可能に！）</div>
              <div className="text-rose-400 font-semibold pt-1">
                ➔ 従来の「10億年解読不能」だったパスワードが、量子環境では「わずか数日〜数ヶ月」に短縮される危険性。
              </div>
            </div>
          </div>

          <p>
            これを防ぐため、米NISTは<strong>耐量子暗号（Post-Quantum Cryptography: PQC）</strong>規格（ML-KEM / ML-DSA）を策定するとともに、共通鍵・パスワードは<strong>鍵長を従来の2倍（256bit以上、文字数なら20〜32文字以上）へ引き上げる新安全基準</strong>を強く推奨しています。
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Improvement Suggestions Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 font-display">
            リアルタイム改善アドバイス
          </h3>
        </div>

        <div className="space-y-2">
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed"
            >
              {sug}
            </div>
          ))}
        </div>
      </div>

      {/* Cyber Security Learning Column: High Visibility Featured Hub */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  サイバーセキュリティ学習コラム
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold">
                  知って得する防衛術
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                暗号学・ハッカーの攻撃・耐量子暗号（PQC）のメカニズムを4大テーマで徹底解説
              </p>
            </div>
          </div>
        </div>

        {/* Column Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
          {columns.map((col, idx) => {
            const isSelected = activeTab === idx;
            return (
              <button
                key={col.id}
                onClick={() => {
                  playKeyTick();
                  setActiveTab(idx);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? `bg-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30`
                    : `bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${col.badgeColor}`}
                    >
                      {col.badge}
                    </span>
                    <div className="p-1 rounded bg-slate-900 border border-slate-800">
                      {col.icon}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-bold leading-snug line-clamp-2 ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {col.title}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                  <span>テーマ 0{idx + 1}</span>
                  <span
                    className={`font-semibold flex items-center gap-0.5 ${
                      isSelected ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {isSelected ? '閲覧中' : '読む'}
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Column Content Showcase Card */}
        <div className="mt-4 p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800/90 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
            <div>
              <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>テーマ 0{activeTab + 1}: {columns[activeTab].badge}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {columns[activeTab].title}
              </h4>
            </div>

            {/* Quick Test Button for Examples */}
            {onApplyExample && columns[activeTab].example && (
              <button
                type="button"
                onClick={() => {
                  playKeyTick();
                  onApplyExample(columns[activeTab].example);
                }}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-all shrink-0 hover:border-cyan-500/60"
                title={`「${columns[activeTab].example}」を入力欄に反映して試す`}
              >
                <span>試す: {columns[activeTab].exampleLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Render Body */}
          {columns[activeTab].content}
        </div>
      </div>
    </div>
  );
};
