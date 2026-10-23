import React, { useState } from 'react';
import { HazardObservation, ActionStatus, RiskLevel } from '../../modules/hse/hseTypes';
import { CheckCircle2, Clock, AlertCircle, FileCheck, Filter, UserCheck, Calendar } from 'lucide-react';

interface CorrectiveActionTableProps {
  observations: HazardObservation[];
  onUpdateObservation: (id: string, updates: Partial<HazardObservation>) => void;
  onSelectObservation?: (id: string) => void;
}

export const CorrectiveActionTable: React.FC<CorrectiveActionTableProps> = ({
  observations,
  onUpdateObservation,
  onSelectObservation,
}) => {
  const [filterStatus, setFilterStatus] = useState<ActionStatus | 'All'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredObservations =
    filterStatus === 'All'
      ? observations
      : observations.filter((o) => o.actionStatus === filterStatus);

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Pending Verification':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-200';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200';
    }
  };

  const handleStatusChange = (id: string, newStatus: ActionStatus) => {
    onUpdateObservation(id, {
      actionStatus: newStatus,
      inspectorVerifiedClosure: newStatus === 'Closed',
    });
  };

  return (
    <div className="space-y-3">
      {/* Filters Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['All', 'Open', 'In Progress', 'Pending Verification', 'Closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st} {st !== 'All' ? `(${observations.filter((o) => o.actionStatus === st).length})` : `(${observations.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards / Table */}
      <div className="space-y-3">
        {filteredObservations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-slate-500 text-xs">
            No corrective actions found for status: <strong>{filterStatus}</strong>
          </div>
        ) : (
          filteredObservations.map((obs) => (
            <div
              key={obs.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              {/* Header: ID, Title & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {obs.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getRiskBadge(obs.riskRating)}`}>
                      {obs.riskRating} Priority
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Marker #{String(obs.markerNumber).padStart(2, '0')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {obs.title}
                  </h4>
                </div>

                {/* Status Selector */}
                <select
                  value={obs.actionStatus}
                  onChange={(e) => handleStatusChange(obs.id, e.target.value as ActionStatus)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none ${getStatusBadge(
                    obs.actionStatus
                  )}`}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Observed Hazard & Recommended Corrective Actions */}
              <div className="text-xs space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">Action Required:</strong>{' '}
                  {obs.immediateAction || obs.engineeringControls || 'Address unsafe condition as specified.'}
                </div>
                {obs.engineeringControls && (
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    <strong>Engineering:</strong> {obs.engineeringControls}
                  </div>
                )}
                {obs.administrativeControls && (
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    <strong>Admin/Permit:</strong> {obs.administrativeControls}
                  </div>
                )}
              </div>

              {/* Action Metadata: Responsible, Target Date, Closure Evidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={obs.actionAssignee || ''}
                    placeholder="Assign to person / trade..."
                    onChange={(e) => onUpdateObservation(obs.id, { actionAssignee: e.target.value })}
                    className="flex-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs border border-transparent focus:border-blue-400 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={obs.actionTargetDate || ''}
                    placeholder="Target Date (e.g. 24-Oct-2026)"
                    onChange={(e) => onUpdateObservation(obs.id, { actionTargetDate: e.target.value })}
                    className="flex-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs border border-transparent focus:border-blue-400 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Closure Evidence Input */}
              {(obs.actionStatus === 'Pending Verification' || obs.actionStatus === 'Closed') && (
                <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-purple-900 dark:text-purple-300">
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-purple-600" /> Evidence of Closure
                    </span>
                    <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={obs.inspectorVerifiedClosure || false}
                        onChange={(e) =>
                          onUpdateObservation(obs.id, { inspectorVerifiedClosure: e.target.checked })
                        }
                        className="rounded text-purple-600 focus:ring-0"
                      />
                      <span>Verified by Inspector</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={obs.closureEvidenceText || ''}
                    placeholder="Describe completed control / permit sign-off reference..."
                    onChange={(e) => onUpdateObservation(obs.id, { closureEvidenceText: e.target.value })}
                    className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white border border-purple-200 dark:border-purple-800 focus:outline-none"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
