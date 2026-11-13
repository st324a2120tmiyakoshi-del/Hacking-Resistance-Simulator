import { PasswordAnalysis, SecurityLevel, AttackPreset } from '../types';

export const ATTACK_PRESETS: AttackPreset[] = [
  {
    id: 'gpu_cluster',
    name: '最新 分散GPUクラスタ',
    rate: 10_000_000_000, // 10 billion/s
    rateLabel: '100億回/秒 (10 GH/s)',
    description: '国家機関や最新の分散GPUファーム（RTX 4090/A100 × 多数）を想定した超高速ブルートフォース攻撃。',
  },
  {
    id: 'single_gpu',
    name: 'ハイエンド単体GPU (RTX 4090)',
    rate: 1_000_000_000, // 1 billion/s
    rateLabel: '10億回/秒 (1 GH/s)',
    description: '単一の高性能ゲーミングGPUを用いたローカル総当たり試行。',
  },
  {
    id: 'standard_pc',
    name: '一般PC / CPUクラック',
    rate: 10_000_000, // 10 million/s
    rateLabel: '1,000万回/秒 (10 MH/s)',
    description: '一般的なデスクトップ・ノートPCのCPUによる解読試行。',
  },
  {
    id: 'online_rate_limited',
    name: 'オンライン攻撃 (レート制限有)',
    rate: 100, // 100/s
    rateLabel: '100回/秒',
    description: 'Webサイトのログインフォーム等への直接攻撃（CAPTCHAや制限回避を試みる場合）。',
  },
];

const COMMON_PASSWORDS = new Set([
  '123456',
  'password',
  '123456789',
  '12345',
  'qwerty',
  '12345678',
  '111111',
  '1234567',
  'dragon',
  'admin',
  'welcome',
  'letmein',
  'iloveyou',
  'princess',
  'rockyou',
  'pass123',
  'abc123',
  'monkey',
  'master',
  'sunshine',
  'football',
  'superman',
  'trustno1',
  'baseball',
  'starwars',
  'pokemon',
  'shadow',
  'killer',
  'solo',
  'testing',
  'login',
  'guest',
  'root',
  'toor',
  'pass',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  'password1',
  'password123',
  'admin123',
  'welcome1',
]);

export function analyzePassword(
  password: string,
  rate: number = 10_000_000_000
): PasswordAnalysis {
  if (!password) {
    return {
      password: '',
      length: 0,
      poolSize: 0,
      entropy: 0,
      combinations: 0,
      combinationsStr: '0 通り',
      hasLower: false,
      hasUpper: false,
      hasDigit: false,
      hasSymbol: false,
      isDictionary: false,
      isSequentialOrRepeated: false,
      crackTimeSeconds: 0,
      formattedTime: '0秒',
      level: 1,
      levelLabel: '未入力',
      levelDescription: 'パスワードを入力してハッキング耐性を測定してください。',
      colorClass: {
        bg: 'bg-slate-900/50',
        border: 'border-slate-800',
        text: 'text-slate-400',
        glow: 'shadow-none',
        bar: 'bg-slate-700',
      },
      suggestions: ['パスワードを入力するか、自動作成ボタンを押してください。'],
      quantum: {
        effectiveEntropy: 0,
        quantumCombinationsStr: '0 通り',
        quantumCrackTimeSeconds: 0,
        formattedQuantumTime: '0秒',
        quantumLevel: 1,
        quantumLevelLabel: '未入力',
        quantumLevelDescription: 'パスワードを入力してください。',
        speedupFactorStr: '1倍',
        isPqcSafe: false,
        algorithmNote: 'Groverアルゴリズムによる平方根探索想定',
      },
    };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  // Pool Size calculation
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 32;
  if (poolSize === 0) poolSize = 1;

  // Check Dictionary match
  const lowerPw = password.toLowerCase().trim();
  let isDictionary = COMMON_PASSWORDS.has(lowerPw);
  let matchedWord = isDictionary ? lowerPw : undefined;

  if (!isDictionary) {
    // Check if starts or ends with dictionary word + 1 or 2 digits
    for (const common of COMMON_PASSWORDS) {
      if (
        (lowerPw.startsWith(common) && /^[0-9!@#]{1,2}$/.test(lowerPw.slice(common.length))) ||
        (lowerPw.endsWith(common) && /^[0-9!@#]{1,2}$/.test(lowerPw.slice(0, -common.length)))
      ) {
        isDictionary = true;
        matchedWord = common;
        break;
      }
    }
  }

  // Check simple repeating or sequential characters
  const isRepeated = /^([a-zA-Z0-9])\1{2,}$/.test(password);
  const sequentialPatterns = ['123456', '234567', '345678', '456789', 'abcdef', 'qwerty', 'asdfgh'];
  const isSequential = sequentialPatterns.some((pat) => lowerPw.includes(pat));
  const isSequentialOrRepeated = isRepeated || isSequential;

  // Entropy: E = L * log2(N)
  const entropy = Number((length * Math.log2(poolSize)).toFixed(1));

  // Combinations: S = N^L
  let combinations = Math.pow(poolSize, length);
  let combinationsStr = '';
  if (length === 0) {
    combinationsStr = '0 通り';
  } else if (combinations <= 1e12 && Number.isFinite(combinations)) {
    combinationsStr = `${Math.round(combinations).toLocaleString()} 通り`;
  } else {
    // Large number representation
    const exponent = Math.floor(length * Math.log10(poolSize));
    const mantissa = Math.pow(10, (length * Math.log10(poolSize)) - exponent);
    combinationsStr = `約 ${mantissa.toFixed(2)} × 10^${exponent} 通り`;
  }

  // Crack Time: S / (2 * rate)
  let crackTimeSeconds = 0;
  if (isDictionary) {
    crackTimeSeconds = 0.0001; // Instant crack by dictionary attack
  } else if (isSequentialOrRepeated) {
    crackTimeSeconds = 0.001;
  } else {
    // Compute log10(time) to avoid Infinity issues
    const logTotal = length * Math.log10(poolSize);
    const logRate = Math.log10(2 * rate);
    const logSeconds = logTotal - logRate;

    if (logSeconds > 300) {
      crackTimeSeconds = Number.POSITIVE_INFINITY;
    } else {
      crackTimeSeconds = Math.pow(10, logSeconds);
    }
  }

  const formattedTime = formatTime(crackTimeSeconds, isDictionary);
  const { level, label, desc, colors } = determineLevel(
    crackTimeSeconds,
    isDictionary,
    isSequentialOrRepeated,
    length,
    entropy
  );

  // Suggestions
  const suggestions: string[] = [];
  if (isDictionary) {
    suggestions.push(
      `⚠️ 「${matchedWord}」は流出パスワード辞書に含まれており、攻撃開始0.001秒未満で突破されます。`
    );
  }
  if (isSequentialOrRepeated) {
    suggestions.push(
      '⚠️ 単純な連続文字や同一文字の繰り返しは、推測アルゴリズムにより極めて短時間で突破されます。'
    );
  }
  if (length < 8) {
    suggestions.push('🚨 文字数が8文字未満です。最低でも12文字以上に増やすことを強く推奨します。');
  } else if (length < 12) {
    suggestions.push('💡 12文字以上に延ばすことで、ハッキング試行時間を数千倍〜数億倍に跳ね上げられます。');
  }
  if (!hasUpper) {
    suggestions.push('🔤 英大文字（A〜Z）を含めると、探索候補が26種類追加され強固になります。');
  }
  if (!hasDigit) {
    suggestions.push('🔢 数字（0〜9）を追加すると、アルファベットのみの総当たりツールを阻害できます。');
  }
  if (!hasSymbol) {
    suggestions.push('⚡ 記号（!@#$%^&* など）を混ぜると、探索パターンが爆発的に増加します。');
  }
  if (suggestions.length === 0) {
    suggestions.push(
      '🛡️ 完璧な強度です！16文字以上かつ4種類の文字種が満たされており、最新GPUクラスタでも解読不可能です。'
    );
  }

  // Quantum Computer analysis (Grover's Algorithm quadratic speedup: O(sqrt(S)) -> effective combinations = sqrt(S) = N^(L/2))
  const quantumRate = 100_000_000; // 100M quantum oracle queries/sec
  let quantumCrackTimeSeconds = 0;
  let effectiveEntropy = Number((entropy / 2).toFixed(1));
  let quantumCombinationsStr = '';
  let speedupFactorStr = '';

  if (isDictionary) {
    quantumCrackTimeSeconds = 0.00001;
    quantumCombinationsStr = '辞書即時照合';
    speedupFactorStr = '即時破綻';
  } else if (isSequentialOrRepeated) {
    quantumCrackTimeSeconds = 0.0001;
    quantumCombinationsStr = '規則性即時検出';
    speedupFactorStr = '即時破綻';
  } else {
    // Quantum search space: sqrt(S) = S^0.5
    const logTotalQuantum = (length * Math.log10(poolSize)) / 2;
    const logQuantumRate = Math.log10(quantumRate);
    const logQuantumSeconds = logTotalQuantum - logQuantumRate;

    if (logQuantumSeconds > 300) {
      quantumCrackTimeSeconds = Number.POSITIVE_INFINITY;
    } else {
      quantumCrackTimeSeconds = Math.pow(10, logQuantumSeconds);
    }

    const quantumExponent = Math.floor(logTotalQuantum);
    const quantumMantissa = Math.pow(10, logTotalQuantum - quantumExponent);
    quantumCombinationsStr =
      quantumExponent < 6
        ? `${Math.round(Math.pow(poolSize, length / 2)).toLocaleString()} 通り`
        : `約 ${quantumMantissa.toFixed(2)} × 10^${quantumExponent} 通り`;

    if (Number.isFinite(crackTimeSeconds) && Number.isFinite(quantumCrackTimeSeconds) && quantumCrackTimeSeconds > 0) {
      const ratio = crackTimeSeconds / quantumCrackTimeSeconds;
      if (ratio > 1e12) {
        speedupFactorStr = '数兆倍以上の加速';
      } else if (ratio > 1e8) {
        speedupFactorStr = '数億倍の劇的加速';
      } else if (ratio > 1e4) {
        speedupFactorStr = `${Math.round(ratio).toLocaleString()}倍 高速化`;
      } else {
        speedupFactorStr = `${ratio.toFixed(1)}倍 高速化`;
      }
    } else {
      speedupFactorStr = '平方根級の指数短縮';
    }
  }

  const formattedQuantumTime = formatTime(quantumCrackTimeSeconds, isDictionary);
  const { level: qLevel, label: qLabel, desc: qDesc } = determineLevel(
    quantumCrackTimeSeconds,
    isDictionary,
    isSequentialOrRepeated,
    length,
    effectiveEntropy
  );

  const isPqcSafe = quantumCrackTimeSeconds >= 100 * 365.25 * 86400 && effectiveEntropy >= 64;

  return {
    password,
    length,
    poolSize,
    entropy,
    combinations,
    combinationsStr,
    hasLower,
    hasUpper,
    hasDigit,
    hasSymbol,
    isDictionary,
    dictionaryWord: matchedWord,
    isSequentialOrRepeated,
    crackTimeSeconds,
    formattedTime,
    level,
    levelLabel: label,
    levelDescription: desc,
    colorClass: colors,
    suggestions,
    quantum: {
      effectiveEntropy,
      quantumCombinationsStr,
      quantumCrackTimeSeconds,
      formattedQuantumTime,
      quantumLevel: qLevel,
      quantumLevelLabel: qLabel,
      quantumLevelDescription: qDesc,
      speedupFactorStr,
      isPqcSafe,
      algorithmNote:
        'Groverアルゴリズムにより対称鍵・パスワードの探索空間が平方根（√N^L）に圧縮され、実効エントロピーが半減（50%喪失）します。',
    },
  };
}

export function formatTime(seconds: number, isDictionary: boolean): string {
  if (isDictionary) {
    return '一瞬（0.0001秒・辞書攻撃）';
  }
  if (!Number.isFinite(seconds) || seconds > 1e30) {
    return '宇宙の寿命（10¹⁰⁰年）以上';
  }
  if (seconds < 0.001) {
    return '一瞬（0.001秒未満）';
  }
  if (seconds < 1) {
    return `一瞬（${seconds.toFixed(3)}秒）`;
  }
  if (seconds < 60) {
    return `約 ${seconds.toFixed(1)} 秒`;
  }
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `約 ${mins} 分 ${secs > 0 ? `${secs} 秒` : ''}`;
  }
  if (seconds < 86400) {
    const hours = (seconds / 3600).toFixed(1);
    return `約 ${hours} 時間`;
  }

  const days = seconds / 86400;
  if (days < 365) {
    return `約 ${Math.round(days)} 日`;
  }

  const years = days / 365.25;
  if (years < 10000) {
    return `約 ${Math.round(years).toLocaleString()} 年`;
  }
  if (years < 100_000_000) {
    const manYears = Math.round(years / 10000);
    return `約 ${manYears.toLocaleString()} 万年`;
  }
  if (years < 1_000_000_000_000) {
    const okuYears = (years / 100_000_000).toFixed(1);
    return `約 ${okuYears} 億年`;
  }
  if (years < 1e16) {
    const choYears = (years / 1e12).toFixed(1);
    return `約 ${choYears} 兆年`;
  }
  if (years < 1e20) {
    const keiYears = (years / 1e16).toFixed(1);
    return `約 ${keiYears} 京年`;
  }
  return '宇宙の寿命以上（数千恒河沙年）';
}

function determineLevel(
  seconds: number,
  isDictionary: boolean,
  isSequential: boolean,
  length: number,
  entropy: number
): {
  level: SecurityLevel;
  label: string;
  desc: string;
  colors: { bg: string; border: string; text: string; glow: string; bar: string };
} {
  if (isDictionary || isSequential || seconds < 1) {
    return {
      level: 1,
      label: 'レベル 1: 超危険（即座に突破）',
      desc: '一般的なハッキング辞書やGPUの初動試行により、0秒〜1秒未満で瞬時に解読されます。直ちに変更が必要です。',
      colors: {
        bg: 'bg-rose-950/30',
        border: 'border-rose-500/50',
        text: 'text-rose-400',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.18)]',
        bar: 'bg-rose-500',
      },
    };
  }

  // < 1 day (86400 seconds)
  if (seconds < 86400) {
    return {
      level: 2,
      label: 'レベル 2: 危険（数秒〜数時間）',
      desc: '市販のゲーミングPCやクラスタで数分〜数時間以内に解読可能です。標的型攻撃には耐えられません。',
      colors: {
        bg: 'bg-amber-950/30',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.18)]',
        bar: 'bg-amber-500',
      },
    };
  }

  // < 100 years
  if (seconds < 100 * 365.25 * 86400) {
    return {
      level: 3,
      label: 'レベル 3: 注意（数日〜数年）',
      desc: '一定の耐性がありますが、将来的な計算能力の向上や分散攻撃により数年以内に突破されるリスクがあります。',
      colors: {
        bg: 'bg-yellow-950/25',
        border: 'border-yellow-500/40',
        text: 'text-yellow-300',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
        bar: 'bg-yellow-400',
      },
    };
  }

  // < 1 million years
  if (seconds < 1_000_000 * 365.25 * 86400) {
    return {
      level: 4,
      label: 'レベル 4: 高耐性（数千年〜数万年）',
      desc: '非常に堅牢です。最新の超高速GPUクラスタを総動員しても、人間の一生はおろか文明史を超える年数がかかります。',
      colors: {
        bg: 'bg-teal-950/30',
        border: 'border-teal-500/45',
        text: 'text-teal-300',
        glow: 'shadow-[0_0_20px_rgba(20,184,166,0.18)]',
        bar: 'bg-teal-400',
      },
    };
  }

  // Level 5
  return {
    level: 5,
    label: 'レベル 5: 鉄壁（数億年以上）',
    desc: '情報理論的にも物理的にも総当たり解読が事実上不可能です。地球の寿命や宇宙の年齢に匹敵する解読年数を誇ります。',
    colors: {
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-500/50',
      text: 'text-emerald-300',
      glow: 'shadow-[0_0_22px_rgba(16,185,129,0.22)]',
      bar: 'bg-emerald-400',
    },
  };
}

export function generateStrongPassword(length: number = 16): string {
  const lowers = 'abcdefghijkmnopqrstuvwxyz'; // excluding easily confused 'l'
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // excluding 'I', 'O'
  const digits = '23456789'; // excluding '0', '1'
  const symbols = '!@#$%^&*()_+-=~';
  const all = lowers + uppers + digits + symbols;

  // Guarantee at least 1 of each
  const result: string[] = [
    lowers[cryptoRandomInt(lowers.length)],
    uppers[cryptoRandomInt(uppers.length)],
    digits[cryptoRandomInt(digits.length)],
    symbols[cryptoRandomInt(symbols.length)],
  ];

  for (let i = 4; i < length; i++) {
    result.push(all[cryptoRandomInt(all.length)]);
  }

  // Shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

const PASSPHRASE_WORDS = [
  'cyber', 'neon', 'shield', 'matrix', 'falcon', 'quantum', 'cipher', 'orbit',
  'galaxy', 'aurora', 'shadow', 'zenith', 'pulse', 'vector', 'horizon', 'delta',
  'echo', 'phoenix', 'apex', 'vortex', 'titan', 'solaris', 'stellar', 'plasma',
  'fuji', 'sakura', 'katana', 'tokyo', 'coffee', 'river', 'forest', 'mountain',
  'ocean', 'sunset', 'breeze', 'thunder', 'iron', 'silver', 'crystal', 'anchor'
];

export function generatePassphrase(): string {
  const chosen: string[] = [];
  for (let i = 0; i < 4; i++) {
    chosen.push(PASSPHRASE_WORDS[cryptoRandomInt(PASSPHRASE_WORDS.length)]);
  }
  const num = cryptoRandomInt(90) + 10;
  return `${chosen.join('-')}-${num}`;
}

export interface CustomPasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean; // e.g. 0, O, o, 1, l, I, |
}

export function generateCustomPassword(options: CustomPasswordOptions): string {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeAmbiguous = false,
  } = options;

  let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~';

  if (excludeAmbiguous) {
    // Remove ambiguous chars: 0, O, o, 1, l, I, |, `, ', ", ,, ;, :, ., etc.
    upperChars = upperChars.replace(/[OI]/g, '');
    lowerChars = lowerChars.replace(/[lo]/g, '');
    numberChars = numberChars.replace(/[01]/g, '');
    symbolChars = symbolChars.replace(/[|;:,.<>`'"]/g, '');
  }

  const pools: string[] = [];
  const guaranteed: string[] = [];

  if (includeUppercase && upperChars.length > 0) {
    pools.push(upperChars);
    guaranteed.push(upperChars[cryptoRandomInt(upperChars.length)]);
  }
  if (includeLowercase && lowerChars.length > 0) {
    pools.push(lowerChars);
    guaranteed.push(lowerChars[cryptoRandomInt(lowerChars.length)]);
  }
  if (includeNumbers && numberChars.length > 0) {
    pools.push(numberChars);
    guaranteed.push(numberChars[cryptoRandomInt(numberChars.length)]);
  }
  if (includeSymbols && symbolChars.length > 0) {
    pools.push(symbolChars);
    guaranteed.push(symbolChars[cryptoRandomInt(symbolChars.length)]);
  }

  // Fallback if all unchecked
  if (pools.length === 0) {
    pools.push('abcdefghijklmnopqrstuvwxyz');
    guaranteed.push('a');
  }

  const combinedPool = pools.join('');
  const result: string[] = [...guaranteed];

  while (result.length < length) {
    result.push(combinedPool[cryptoRandomInt(combinedPool.length)]);
  }

  // If length is shorter than guaranteed (unlikely since min 8), trim
  if (result.length > length) {
    result.length = length;
  }

  // Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

function cryptoRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

