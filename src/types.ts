export type SecurityLevel = 1 | 2 | 3 | 4 | 5;

export interface QuantumAnalysis {
  effectiveEntropy: number; // halved entropy
  quantumCombinationsStr: string;
  quantumCrackTimeSeconds: number;
  formattedQuantumTime: string;
  quantumLevel: SecurityLevel;
  quantumLevelLabel: string;
  quantumLevelDescription: string;
  speedupFactorStr: string;
  isPqcSafe: boolean; // true if quantum crack time >= 100 years or effective entropy >= 64 bit
  algorithmNote: string;
}

export interface PasswordAnalysis {
  password: string;
  length: number;
  poolSize: number;
  entropy: number;
  combinations: number; // BigInt or scientific approximation
  combinationsStr: string;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  isDictionary: boolean;
  dictionaryWord?: string;
  isSequentialOrRepeated: boolean;
  crackTimeSeconds: number;
  formattedTime: string;
  level: SecurityLevel;
  levelLabel: string;
  levelDescription: string;
  colorClass: {
    bg: string;
    border: string;
    text: string;
    glow: string;
    bar: string;
  };
  suggestions: string[];
  quantum: QuantumAnalysis;
}

export interface AttackPreset {
  id: string;
  name: string;
  rate: number; // hashes/sec
  rateLabel: string;
  description: string;
}

export interface PasswordHistoryItem {
  id: string;
  step: number; // 1 to 5
  password: string;
  maskedPassword: string;
  length: number;
  entropy: number;
  level: SecurityLevel;
  levelLabel: string;
  formattedTime: string;
  timestamp: string;
}

