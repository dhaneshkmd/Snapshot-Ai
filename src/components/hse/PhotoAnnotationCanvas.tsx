import React, { useState, useRef } from 'react';
import { HazardObservation, PositiveObservation } from '../../modules/hse/hseTypes';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Plus, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PhotoAnnotationCanvasProps {
  imageSrc: string;
  observations: HazardObservation[];
  positiveObservations?: PositiveObservation[];
  selectedObservationId: string | null;
  onSelectObservation: (id: string) => void;
  onAddMarker?: (xPercent: number, yPercent: number) => void;
  onUpdateMarkerPosition?: (id: string, xPercent: number, yPercent: number) => void;
  isEditingMarkers?: boolean;
}

export const PhotoAnnotationCanvas: React.FC<PhotoAnnotationCanvasProps> = ({
  imageSrc,
  observations,
  positiveObservations = [],
  selectedObservationId,
  onSelectObservation,
  onAddMarker,
  onUpdateMarkerPosition,
  isEditingMarkers = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showPositives, setShowPositives] = useState(true);
  const [isDraggingMarkerId, setIsDraggingMarkerId] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(1, z - 0.25));
  const handleResetZoom = () => setZoom(1);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingMarkers || !onAddMarker) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddMarker(Math.round(x), Math.round(y));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-600 border-white text-white shadow-rose-600/50';
      case 'High':
        return 'bg-amber-600 border-white text-white shadow-amber-600/50';
      case 'Medium':
        return 'bg-yellow-500 border-slate-900 text-slate-900 shadow-yellow-500/50';
      default:
        return 'bg-emerald-600 border-white text-white shadow-emerald-600/50';
    }
  };

  return (
    <div className="space-y-2 select-none">
      {/* Top Toolbar Controls */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {observations.length} Hazard Marker{observations.length !== 1 ? 's' : ''}
          </span>
          {positiveObservations.length > 0 && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {positiveObservations.length} Positive Controls
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
              showLabels
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            Labels {showLabels ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowPositives(!showPositives)}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
              showPositives
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            Controls {showPositives ? 'ON' : 'OFF'}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 2.5}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoom > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Photo Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-md">
        <div
          ref={containerRef}
          onClick={handleImageClick}
          className={`relative w-full transition-transform duration-200 origin-center ${
            isEditingMarkers ? 'cursor-crosshair' : 'cursor-default'
          }`}
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Original Photograph (Preserved Pristine) */}
          <img
            src={imageSrc}
            alt="Worksite Inspection"
            className="w-full h-auto max-h-[500px] object-contain block mx-auto pointer-events-none"
          />

          {/* Interactive Numbered Hazard Markers (01, 02, 03...) */}
          {observations.map((obs, idx) => {
            const isSelected = obs.id === selectedObservationId;
            const markerNum = String(obs.markerNumber || idx + 1).padStart(2, '0');
            const colorClass = getRiskColor(obs.riskRating);

            return (
              <div
                key={obs.id}
                style={{
                  left: `${obs.xPercent}%`,
                  top: `${obs.yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectObservation(obs.id);
                }}
                className="absolute z-20 group cursor-pointer"
              >
                {/* Marker Pin Button */}
                <div
                  className={`relative flex items-center justify-center transition-all ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                >
                  {/* Pulsing ring for selected marker */}
                  {isSelected && (
                    <span className="absolute -inset-2 rounded-full animate-ping opacity-75 bg-blue-500" />
                  )}

                  {/* Marker Badge */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-lg transition-transform ${colorClass} ${
                      isSelected ? 'ring-4 ring-blue-500/50' : ''
                    }`}
                  >
                    {markerNum}
                  </div>
                </div>

                {/* Marker Hover or Persistent Label */}
                {showLabels && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md pointer-events-none transition-opacity ${
                      isSelected
                        ? 'bg-blue-600 text-white z-40 opacity-100 ring-1 ring-white/50'
                        : 'bg-black/85 text-slate-100 opacity-90 group-hover:opacity-100'
                    }`}
                  >
                    {markerNum} — {obs.title.length > 28 ? `${obs.title.slice(0, 28)}...` : obs.title}
                  </div>
                )}
              </div>
            );
          })}

          {/* Positive Safety Observations (Green Shield Badges) */}
          {showPositives &&
            positiveObservations.map((pos) => {
              const x = pos.xPercent ?? 50;
              const y = pos.yPercent ?? 50;
              return (
                <div
                  key={pos.id}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-10 group cursor-default"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  {showLabels && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-200 text-[9px] font-semibold opacity-85 group-hover:opacity-100">
                      ✓ {pos.title.slice(0, 22)}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Tip helper banner */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-[11px] text-white/90">
          <span>Tap any numbered pin to jump to its findings</span>
          {isEditingMarkers && (
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <Plus className="w-3 h-3" /> Tap image to place marker
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
