import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, X, ZoomIn } from 'lucide-react';
import type { Item } from '@/lib/kiosk-data';
import { resolveItemImages } from './itemImages';

const ZOOM_LEVELS = [1, 1.5, 2, 3] as const;

interface ProductDetailModalProps {
  item: Item | null;
  open: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ item, open, onClose }: ProductDetailModalProps) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomIdx, setZoomIdx] = useState(0); // index into ZOOM_LEVELS
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const zoom = ZOOM_LEVELS[zoomIdx];
  const isZoomed = zoom > 1;

  const resetZoom = () => {
    setZoomIdx(0);
    setPan({ x: 0, y: 0 });
  };

  // Reset gallery + zoom when item changes, opens, or active image changes.
  useEffect(() => {
    setActiveIdx(0);
    resetZoom();
  }, [item, open]);

  useEffect(() => {
    resetZoom();
  }, [activeIdx]);

  // Keyboard handlers.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        setActiveIdx(i => Math.min((images.length || 1) - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx(i => Math.max(0, i - 1));
      } else if (e.key === '+' || e.key === '=') {
        setZoomIdx(i => Math.min(ZOOM_LEVELS.length - 1, i + 1));
      } else if (e.key === '-' || e.key === '_') {
        setZoomIdx(i => Math.max(0, i - 1));
        setPan({ x: 0, y: 0 });
      } else if (e.key === '0') {
        resetZoom();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  if (!open || !item) return null;

  const images = resolveItemImages(item.images);
  const activeImg = images[activeIdx];

  return (
    <div
      className="absolute inset-0 z-[90] flex items-center justify-center p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.name} details`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close product details"
        onClick={onClose}
        data-sound="click"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-default"
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-[820px] max-h-full bg-card border border-border rounded-[0.75rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-border bg-card/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-primary">
              <ZoomIn className="w-3 h-3" />
              Product Detail
            </div>
            <div className="text-foreground font-black tracking-tight text-[18px] leading-tight mt-0.5 truncate">
              {item.name}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{item.category}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-sound="click"
            aria-label="Close"
            className="flex-shrink-0 w-9 h-9 rounded-full border border-border bg-background hover:bg-muted/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-foreground/70" />
          </button>
        </div>

        {/* Body — 2 cols */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[55%_45%] min-h-0 overflow-hidden">
          {/* Image area */}
          <div className="bg-background flex flex-col border-b md:border-b-0 md:border-r border-border relative">
            <div
              className={`flex-1 min-h-[260px] flex items-center justify-center p-6 overflow-hidden select-none ${
                isZoomed ? 'cursor-grab active:cursor-grabbing' : activeImg ? 'cursor-zoom-in' : ''
              }`}
              onPointerDown={(e) => {
                if (!activeImg) return;
                if (!isZoomed) {
                  // Single tap on un-zoomed image → step in one zoom level.
                  setZoomIdx(i => Math.min(ZOOM_LEVELS.length - 1, i + 1));
                  return;
                }
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: pan.x, baseY: pan.y };
              }}
              onPointerMove={(e) => {
                if (!dragRef.current) return;
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;
                setPan({ x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy });
              }}
              onPointerUp={(e) => {
                if (dragRef.current) {
                  (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                  dragRef.current = null;
                }
              }}
              onPointerCancel={() => { dragRef.current = null; }}
              onDoubleClick={() => resetZoom()}
            >
              {activeImg ? (
                <img
                  src={activeImg}
                  alt={`${item.name} ${activeIdx === 0 ? 'front' : 'back'}`}
                  draggable={false}
                  className="max-w-full max-h-[380px] object-contain transition-transform duration-150 ease-out will-change-transform pointer-events-none"
                  style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                />
              ) : (
                <div className="text-6xl">{item.icon}</div>
              )}
            </div>

            {/* Zoom controls overlay */}
            {activeImg && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-full shadow-sm px-1 py-1">
                <button
                  type="button"
                  onClick={() => { setZoomIdx(i => Math.max(0, i - 1)); setPan({ x: 0, y: 0 }); }}
                  disabled={zoomIdx === 0}
                  data-sound="click"
                  aria-label="Zoom out"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/70 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-foreground/80 tabular-nums w-9 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomIdx(i => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
                  disabled={zoomIdx === ZOOM_LEVELS.length - 1}
                  data-sound="click"
                  aria-label="Zoom in"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/70 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  disabled={!isZoomed && pan.x === 0 && pan.y === 0}
                  data-sound="click"
                  aria-label="Reset zoom"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/70 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border bg-card/40">
                {images.map((src, i) => {
                  const on = i === activeIdx;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      data-sound="click"
                      aria-label={`Show image ${i + 1}`}
                      className={`w-14 h-14 rounded-md border-2 bg-background flex items-center justify-center overflow-hidden transition-all ${
                        on ? 'border-primary shadow-sm' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Text area */}
          <div className="overflow-y-auto px-5 py-4 bg-card/40">
            {/* Price */}
            <div className="mb-4">
              <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1">
                Price
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[22px] font-black text-foreground tracking-tight">{item.price}</span>
                <span className="text-[12px] font-mono text-muted-foreground line-through">
                  {item.conflictPrice}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-1.5">
                Product Information
              </div>
              <div className="text-[12px] leading-relaxed text-foreground whitespace-pre-line font-mono">
                {item.description ?? 'No additional details available.'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-5 py-2 border-t border-border bg-background/60 text-[10px] font-mono text-muted-foreground/70 text-center">
          Esc to close · tap image or +/− to zoom
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
