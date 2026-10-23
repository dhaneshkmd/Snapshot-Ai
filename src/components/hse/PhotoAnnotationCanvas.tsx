import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HazardObservation, PositiveObservation } from '../../modules/hse/hseTypes';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Plus, ShieldCheck, Move, AlertTriangle } from 'lucide-react';

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
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showPositives, setShowPositives] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => setZoom(1);

  // Direct click on photo to add new pin (only when isEditingMarkers is active)
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingMarkers || !onAddMarker || draggingId) return;
    const rect = imageFrameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const x = Math.max(2, Math.min(98, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(2, Math.min(98, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    onAddMarker(x, y);
  };

  // Dragging logic to reposition pins accurately
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    onSelectObservation(id);
    setDraggingId(id);
  };

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingId || !onUpdateMarkerPosition || !imageFrameRef.current) return;
      const rect = imageFrameRef.current.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;

      const x = Math.max(2, Math.min(98, Math.round(((clientX - rect.left) / rect.width) * 100)));
      const y = Math.max(2, Math.min(98, Math.round(((clientY - rect.top) / rect.height) * 100)));
      onUpdateMarkerPosition(draggingId, x, y);
    },
    [draggingId, onUpdateMarkerPosition]
  );

  useEffect(() => {
    if (!draggingId) return;

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onEndDrag = () => {
      setDraggingId(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEndDrag);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEndDrag);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEndDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEndDrag);
    };
  }, [draggingId, handlePointerMove]);

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
      <div className="flex items-center justify-between px-1 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
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

        <div className="flex items-center gap-1 flex-wrap">
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

          <button
            type="button"
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
              showBoundingBoxes
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
            title="Toggle Bounding Boxes"
          >
            Boxes {showBoundingBoxes ? 'ON' : 'OFF'}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

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

      {/* Interactive Photo Canvas Viewport */}
      <div className="relative w-full rounded-2xl overflow-auto bg-slate-950/90 dark:bg-black border border-slate-200/90 dark:border-slate-800 shadow-md flex justify-center items-center min-h-[320px] p-2">
        {/* Tightly shrink-wrapped image frame container (ZERO letterbox margin offset) */}
        <div
          ref={imageFrameRef}
          onClick={handleImageClick}
          className={`relative inline-block transition-transform duration-200 origin-center ${
            isEditingMarkers ? 'cursor-crosshair' : 'cursor-default'
          }`}
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Pristine Original Photograph */}
          <img
            src={imageSrc}
            alt="Worksite Inspection"
            className="block max-h-[520px] max-w-full w-auto h-auto rounded-xl shadow-lg pointer-events-none select-none object-contain"
          />

          {/* Optional Visual Bounding Boxes for Detected Hazards */}
          {showBoundingBoxes &&
            observations.map((obs) => {
              if (!obs.boundingBox) return null;
              const isSelected = obs.id === selectedObservationId;
              const { x, y, width, height } = obs.boundingBox;
              return (
                <div
                  key={`box_${obs.id}`}
                  style={{
                    left: `${Math.max(0, Math.min(100, x * 100))}%`,
                    top: `${Math.max(0, Math.min(100, y * 100))}%`,
                    width: `${Math.max(4, Math.min(100, width * 100))}%`,
                    height: `${Math.max(4, Math.min(100, height * 100))}%`,
                  }}
                  className={`absolute pointer-events-none rounded border-2 transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-500/15 ring-2 ring-blue-400/50 z-20'
                      : 'border-orange-400/70 bg-orange-500/10 z-10'
                  }`}
                />
              );
            })}

          {/* Interactive Numbered Hazard Markers (01, 02, 03...) */}
          {observations.map((obs, idx) => {
            const isSelected = obs.id === selectedObservationId;
            const markerNum = String(obs.markerNumber || idx + 1).padStart(2, '0');
            const colorClass = getRiskColor(obs.riskRating);
            const isBeingDragged = draggingId === obs.id;

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
                className={`absolute z-30 group cursor-pointer ${
                  isBeingDragged ? 'z-50 scale-125' : ''
                }`}
              >
                {/* Marker Pin Button with Drag Grip Handle */}
                <div
                  onMouseDown={(e) => handleStartDrag(e, obs.id)}
                  onTouchStart={(e) => handleStartDrag(e, obs.id)}
                  className={`relative flex items-center justify-center transition-transform ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-115'
                  }`}
                  title={`${markerNum} — ${obs.title} (Drag to adjust position)`}
                >
                  {/* Pulsing ring for selected marker */}
                  {isSelected && (
                    <span className="absolute -inset-2 rounded-full animate-ping opacity-75 bg-blue-500 pointer-events-none" />
                  )}

                  {/* Marker Badge */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-xl transition-all ${colorClass} ${
                      isSelected ? 'ring-4 ring-blue-500/60 ring-offset-1 ring-offset-slate-900' : ''
                    }`}
                  >
                    {markerNum}
                  </div>
                </div>

                {/* Marker Hover or Persistent Label */}
                {showLabels && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold shadow-lg pointer-events-none transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white z-50 opacity-100 ring-1 ring-white/50'
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
                  className="absolute z-20 group cursor-default"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  {showLabels && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-950/95 text-emerald-200 text-[9px] font-semibold opacity-85 group-hover:opacity-100 shadow-md">
                      ✓ {pos.title.length > 24 ? `${pos.title.slice(0, 24)}...` : pos.title}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Tip helper banner */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Move className="w-3 h-3 text-slate-400" />
          Click or drag any pin to inspect or adjust position
        </span>
        {isEditingMarkers ? (
          <span className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
            <Plus className="w-3 h-3" /> Tap photo to place new hazard pin
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">Photo-accurate coordinates</span>
        )}
      </div>
    </div>
  );
};
