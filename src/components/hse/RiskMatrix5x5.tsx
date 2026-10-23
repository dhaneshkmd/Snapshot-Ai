import React from 'react';
import { RiskLevel, calculateRiskLevel } from '../../modules/hse/hseTypes';

interface RiskMatrix5x5Props {
  likelihood: number; // 1-5
  severity: number; // 1-5
  onChange: (likelihood: number, severity: number) => void;
  disabled?: boolean;
}

const LIKELIHOOD_LABELS = [
  { value: 1, label: '1 - Rare', desc: 'Conceivable only in extreme circumstances' },
  { value: 2, label: '2 - Unlikely', desc: 'Could happen occasionally' },
  { value: 3, label: '3 - Possible', desc: 'Reasonably expected at some point' },
  { value: 4, label: '4 - Likely', desc: 'High probability of occurrence' },
  { value: 5, label: '5 - Almost Certain', desc: 'Expected to occur regularly' },
];

const SEVERITY_LABELS = [
  { value: 1, label: '1 - Insignificant', desc: 'First aid only, zero lost time' },
  { value: 2, label: '2 - Minor', desc: 'Minor injury / reversible health effect' },
  { value: 3, label: '3 - Moderate', desc: 'Medical treatment case / reportable lost time' },
  { value: 4, label: '4 - Major', desc: 'Single fatality or permanent severe disability' },
  { value: 5, label: '5 - Catastrophic', desc: 'Multiple fatalities or toxic environmental release' },
];

export const RiskMatrix5x5: React.FC<RiskMatrix5x5Props> = ({
  likelihood,
  severity,
  onChange,
  disabled = false,
}) => {
  const currentRisk = calculateRiskLevel(likelihood, severity);

  const getCellRisk = (l: number, s: number) => calculateRiskLevel(l, s);

  const getBadgeStyle = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-600 text-white border-rose-700';
      case 'High':
        return 'bg-amber-500 text-white border-amber-600';
      case 'Medium':
        return 'bg-yellow-400 text-slate-900 border-yellow-500';
      default:
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  const getCellBg = (l: number, s: number, isSelected: boolean) => {
    const { level } = getCellRisk(l, s);
    const base = (() => {
      switch (level) {
        case 'Critical':
          return 'bg-rose-600/80 hover:bg-rose-600 text-white';
        case 'High':
          return 'bg-amber-500/80 hover:bg-amber-500 text-white';
        case 'Medium':
          return 'bg-yellow-400/80 hover:bg-yellow-400 text-slate-900';
        default:
          return 'bg-emerald-600/80 hover:bg-emerald-600 text-white';
      }
    })();

    if (isSelected) {
      return `${base} ring-3 ring-blue-500 ring-offset-2 z-10 font-black scale-105 shadow-md`;
    }
    return base;
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            5 × 5 Risk Assessment Matrix
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Likelihood × Severity = Risk Score
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Score: <strong className="text-slate-900 dark:text-white">{currentRisk.score}/25</strong>
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${getBadgeStyle(
              currentRisk.level
            )}`}
          >
            {currentRisk.level} Risk
          </span>
        </div>
      </div>

      {/* Interactive 5x5 Matrix Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[280px]">
          <div className="grid grid-cols-6 gap-1 text-center font-bold">
            {/* Header row */}
            <div className="text-[10px] text-slate-400 self-center">L \ S</div>
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="text-[10px] text-slate-600 dark:text-slate-400 py-0.5">
                S{s}
              </div>
            ))}

            {/* Matrix Rows: 5 (Likelihood 5 down to 1) */}
            {[5, 4, 3, 2, 1].map((l) => (
              <React.Fragment key={l}>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-center font-semibold">
                  L{l}
                </div>
                {[1, 2, 3, 4, 5].map((s) => {
                  const isSelected = likelihood === l && severity === s;
                  const { score } = getCellRisk(l, s);
                  return (
                    <button
                      key={`${l}-${s}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(l, s)}
                      className={`h-7 rounded-md transition-all flex items-center justify-center text-[10px] cursor-pointer ${getCellBg(
                        l,
                        s,
                        isSelected
                      )}`}
                      title={`Likelihood ${l} × Severity ${s} = ${score}`}
                    >
                      {score}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Selectors for Likelihood & Severity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Likelihood
          </label>
          <select
            value={likelihood}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value), severity)}
            className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {LIKELIHOOD_LABELS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} — {item.desc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Severity / Consequence
          </label>
          <select
            value={severity}
            disabled={disabled}
            onChange={(e) => onChange(likelihood, Number(e.target.value))}
            className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {SEVERITY_LABELS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} — {item.desc}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
