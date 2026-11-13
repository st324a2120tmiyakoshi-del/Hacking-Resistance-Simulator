import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 mt-16 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 font-medium">ハッキング耐性シミュレーター</span>
          <span>·</span>
          <span>Hacking Resistance Simulator</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>Shannon Entropy &amp; GPU Hashrate理論モデル</span>
          <span>·</span>
          <span>耐量子暗号 (PQC) 評価</span>
        </div>

        <div className="text-[11px] text-slate-600">
          © 2026 ハッキング耐性シミュレーター · すべての計算は端末内で完結
        </div>
      </div>
    </footer>
  );
};
