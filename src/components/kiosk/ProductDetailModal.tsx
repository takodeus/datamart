import { useEffect, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import type { Item } from '@/lib/kiosk-data';
import { resolveItemImages } from './itemImages';

interface ProductDetailModalProps {
  item: Item | null;
  open: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ item, open, onClose }: ProductDetailModalProps) => {
  const [activeIdx, setActiveIdx] = useState(0);

  // Reset gallery when item changes or modal opens.
  useEffect(() => {
    setActiveIdx(0);
  }, [item, open]);

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
          <div className="bg-background flex flex-col border-b md:border-b-0 md:border-r border-border">
            <div className="flex-1 min-h-[260px] flex items-center justify-center p-6">
              {activeImg ? (
                <img
                  src={activeImg}
                  alt={`${item.name} ${activeIdx === 0 ? 'front' : 'back'}`}
                  className="max-w-full max-h-[380px] object-contain"
                />
              ) : (
                <div className="text-6xl">{item.icon}</div>
              )}
            </div>
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
          Esc or tap outside to close{images.length > 1 ? ' · ← → to switch images' : ''}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
