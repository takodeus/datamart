import { useState, useCallback, useRef, useEffect } from 'react';
import { ITEMS, LOOKUP_METHODS, LOADING_MESSAGES, type LookupType } from '@/lib/kiosk-data';
import { scanBeep } from '@/lib/kiosk-audio';
import cherreOsImg from '@/assets/Cherre-Os.png';
import ontoloPrimaryImg from '@/assets/ontolo-front.png';
import ontoloCan1Img from '@/assets/ontolo-back.png';
import ontoloCans2Img from '@/assets/ontolo-cans.png';
import cherreOsBackImg from '@/assets/cherre-os-back.png';
import cherriesFrontImg from '@/assets/cherries-front.png';
import cherriesBackImg from '@/assets/cherries-back.png';
import flourFrontImg from '@/assets/flour-front.png';
import flourBackImg from '@/assets/flour-back.png';
import sardinesFrontImg from '@/assets/sardines-front.png';
import sardinesBackImg from '@/assets/sardines-back.png';
import cherreColaFrontImg from '@/assets/cherre-cola-front.png';
import cherreColaBackImg from '@/assets/cherre-cola-back.png';

// Map image filenames (as stored in kiosk-data) to their imported URLs.
// Add a new entry here whenever a new image is added to src/assets/.
const ITEM_IMAGES: Record<string, string> = {
  'Cherre-Os.png': cherreOsImg,
  'cherre-os-back.png': cherreOsBackImg,
  'ontolo-front.png': ontoloPrimaryImg,
  'ontolo-back.png': ontoloCan1Img,
  'ontolo-cans.png': ontoloCans2Img,
  'cherries-front.png': cherriesFrontImg,
  'cherries-back.png': cherriesBackImg,
  'flour-front.png': flourFrontImg,
  'flour-back.png': flourBackImg,
  'sardines-front.png': sardinesFrontImg,
  'sardines-back.png': sardinesBackImg,
  'cherre-cola-front.png': cherreColaFrontImg,
  'cherre-cola-back.png': cherreColaBackImg,
};

type CardState = 'idle' | 'loading' | 'done';

interface ItemLookupScreenProps {
  currentItem: number;
  onSelectItem: (idx: number) => void;
  itemsWithQuery: Set<number>;
  setItemsWithQuery: (updater: (prev: Set<number>) => Set<number>) => void;
  queriedMethods: Set<number>[];
  setQueriedMethods: (updater: (prev: Set<number>[]) => Set<number>[]) => void;
  onCheckout: () => void;
}

const teaser = (text: string): string => {
  const first = text.split('\n')[0].replace(/^"/, '').replace(/"$/, '');
  return first.length > 48 ? first.slice(0, 46) + '…' : first;
};

const statusLabel = (type: LookupType) => {
  if (type === 'ok') return '✓ Match found';
  if (type === 'err') return '✕ Error';
  return '⚠ Warning';
};

const statusBadgeClass = (type: LookupType) => {
  if (type === 'ok') return 'text-primary border-primary/20 bg-primary-light-bg';
  if (type === 'err') return 'text-destructive border-destructive/20 bg-destructive/5';
  return 'text-warning-foreground border-warning/20 bg-warning/10';
};

const bodyClass = (type: LookupType) => {
  if (type === 'ok') return 'text-foreground';
  if (type === 'err') return 'text-destructive font-mono text-[12px]';
  return 'text-warning-foreground';
};

const ItemLookupScreen = ({
  currentItem,
  onSelectItem,
  itemsWithQuery,
  setItemsWithQuery,
  queriedMethods,
  setQueriedMethods,
  onCheckout,
}: ItemLookupScreenProps) => {
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<{ srcs: string[]; name: string; idx: number; zoom: number } | null>(null);
  const imgContainerSize = 520;
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const [scanningCard, setScanningCard] = useState<string | null>(null);
  const [loadingMsgs, setLoadingMsgs] = useState<string[][]>(
    ITEMS.map(() => LOOKUP_METHODS.map(() => ''))
  );
  const cardsScrollRef = useRef<HTMLDivElement | null>(null);

  // Preload every product image on mount so back-of-package shots are
  // instantly available when users open the lightbox or switch slides.
  useEffect(() => {
    Object.values(ITEM_IMAGES).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Close any open product lightbox whenever the kiosk session resets
  // (reset button, return to Welcome, or idle timeout).
  useEffect(() => {
    const close = () => { setLightbox(null); setPan({ x: 0, y: 0 }); };
    window.addEventListener('kiosk:reset', close);
    return () => window.removeEventListener('kiosk:reset', close);
  }, []);

  // Scroll the product details / lookups area back to the top whenever
  // the user opens a new product.
  useEffect(() => {
    cardsScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentItem]);

  const cardKey = (itemIdx: number, methodIdx: number) => `${itemIdx}-${methodIdx}`;

  const setCardLoading = useCallback((itemIdx: number, methodIdx: number, loading: boolean) => {
    setLoadingCards(prev => {
      const next = { ...prev };
      if (loading) next[cardKey(itemIdx, methodIdx)] = true;
      else delete next[cardKey(itemIdx, methodIdx)];
      return next;
    });
  }, []);

  const setCardMsg = useCallback((itemIdx: number, methodIdx: number, msg: string) => {
    setLoadingMsgs(prev => {
      const next = prev.map(row => [...row]);
      next[itemIdx][methodIdx] = msg;
      return next;
    });
  }, []);

  const anyLoading = Object.keys(loadingCards).length > 0;

  const runLookup = useCallback((methodIdx: number) => {
    const itemIdx = currentItem;
    if (queriedMethods[itemIdx]?.has(methodIdx)) return;
    if (loadingCards[cardKey(itemIdx, methodIdx)]) return;

    const ck = cardKey(itemIdx, methodIdx);
    setScanningCard(ck);
    setTimeout(() => setScanningCard(null), 800);

    setCardLoading(itemIdx, methodIdx, true);
    setCardMsg(itemIdx, methodIdx, 'Connecting to system…');

    setQueriedMethods(prev => {
      const next = prev.map(s => new Set(s));
      next[itemIdx].add(methodIdx);
      return next;
    });

    let mi = 0;
    const msgInterval = setInterval(() => {
      mi++;
      if (mi < LOADING_MESSAGES.length) setCardMsg(itemIdx, methodIdx, LOADING_MESSAGES[mi]);
    }, 280);

    const delay = 900 + Math.random() * 700;
    setTimeout(() => {
      clearInterval(msgInterval);
      setCardLoading(itemIdx, methodIdx, false);
      // Play the scan/result sound exactly when results render.
      scanBeep();
    }, delay);
  }, [currentItem, queriedMethods, loadingCards, setQueriedMethods, setItemsWithQuery, setCardLoading, setCardMsg]);

  const count = itemsWithQuery.size;
  const item = ITEMS[currentItem];
  const inCart = itemsWithQuery.has(currentItem);
  const queriedCountForItem = queriedMethods[currentItem]?.size ?? 0;
  const REQUIRED_LOOKUPS = 2;
  const allQueried = queriedCountForItem >= REQUIRED_LOOKUPS;
  const canAddToCart = allQueried && !anyLoading;

  const toggleCart = useCallback(() => {
    const itemIdx = currentItem;
    if (!inCart && !canAddToCart) return;
    setItemsWithQuery(prev => {
      const next = new Set(prev);
      if (next.has(itemIdx)) next.delete(itemIdx);
      else next.add(itemIdx);
      return next;
    });
  }, [currentItem, setItemsWithQuery, inCart, canAddToCart]);

  return (
    <>
    <div className="flex flex-col bg-background h-full" style={{ position: 'absolute', inset: 0, minHeight: 0 }}>
      {/* Header */}
      <div className="bg-primary px-10 pt-4 pb-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-semibold tracking-wide uppercase text-primary-foreground/70 mb-1">
            Self-checkout — Item Lookup
          </div>
          <div className="text-primary-foreground font-extrabold tracking-tight leading-[1.15]" style={{ fontSize: 'clamp(15px, 2.4vw, 20px)' }}>
            Each system has an answer,
            <br />
            yet they don't always agree.
          </div>
        </div>
        <div className="pill-badge text-[10px]" style={{ background: 'hsl(var(--primary-deep))' }}>Step 2 of 5</div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Items column */}
        <div className="w-[220px] flex-shrink-0 border-r border-border bg-card py-4 flex flex-col gap-1.5 px-2 overflow-y-auto min-h-0">
          {ITEMS.map((it, i) => {
            const doneCount = queriedMethods[i]?.size ?? 0;
            return (
              <button
                key={i}
                onClick={() => onSelectItem(i)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border text-left w-full transition-all rounded-lg ${
                  i === currentItem
                    ? 'bg-primary-light-bg border-primary/30 shadow-sm'
                    : 'bg-background border-transparent hover:border-border hover:bg-card'
                }`}
              >
                <div className="w-12 h-12 rounded-lg border border-border bg-background flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {it.images?.[0] && ITEM_IMAGES[it.images[0]]
                    ? <img src={ITEM_IMAGES[it.images[0]]} alt={it.name} className="w-full h-full object-contain p-0.5" loading="eager" decoding="sync" />
                    : it.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-foreground">{it.name}</div>
                  <div className="text-[10px] text-muted-foreground font-medium mt-px">{it.category}</div>
                  {doneCount > 0 && (
                    <div className="text-[9px] font-medium text-primary mt-1">
                      {Math.min(doneCount, 2)}/2 queried
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cards area */}
        <div ref={cardsScrollRef} className="flex-1 px-6 py-5 overflow-y-auto flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-3 mb-1">
            {(() => {
              const srcs = (item.images ?? []).map(f => ITEM_IMAGES[f]).filter(Boolean);
              const hasImages = srcs.length > 0;
              return (
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => hasImages && setLightbox({ srcs, name: item.name, idx: 0, zoom: 1 })}
                    disabled={!hasImages}
                    className={`w-16 h-16 rounded-lg border border-border bg-card overflow-hidden flex items-center justify-center text-3xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      hasImages ? 'cursor-zoom-in hover:border-primary/50' : 'cursor-default'
                    }`}
                    title={hasImages ? `Click to enlarge${srcs.length > 1 ? ` · ${srcs.length} photos` : ''}` : item.name}
                    aria-label={hasImages ? `View full image of ${item.name}` : item.name}
                  >
                    {hasImages ? (
                      <div className="relative w-full h-full">
                        {ITEMS.map((it, i) => {
                          const itSrc = it.images?.[0] ? ITEM_IMAGES[it.images[0]] : null;
                          if (!itSrc) return null;
                          return (
                            <img
                              key={i}
                              src={itSrc}
                              alt={it.name}
                              className="absolute inset-0 w-full h-full object-contain p-1"
                              style={{ visibility: i === currentItem ? 'visible' : 'hidden' }}
                              loading="eager"
                              decoding="sync"
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <span>{item.icon}</span>
                    )}
                  </button>
                  {hasImages && (
                    <span className="text-[8px] text-primary/70 font-semibold tracking-wide uppercase leading-none">
                      Click for details
                    </span>
                  )}
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">Looking up</div>
              <div className="text-[15px] font-extrabold text-foreground tracking-tight">{item.name}</div>
            </div>
            <button
              onClick={toggleCart}
              data-sound={!inCart && !canAddToCart ? 'none' : 'click'}
              disabled={!inCart && !canAddToCart}
              className={`flex-shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold tracking-wide uppercase transition-all shadow-sm ${
                inCart
                  ? 'bg-primary-light-bg text-primary border border-primary/30 hover:bg-primary/10 active:scale-[0.97]'
                  : canAddToCart
                  ? 'bg-primary text-primary-foreground border border-primary hover:bg-primary-light hover:shadow-md active:scale-[0.97]'
                  : 'bg-muted text-foreground/80 border border-border cursor-not-allowed'
              }`}
              aria-label={inCart ? `Remove ${item.name} from cart` : canAddToCart ? `Add ${item.name} to cart` : `Query all systems before adding ${item.name} to cart`}
              title={!inCart && !canAddToCart ? `Query at least 2 systems first (${queriedCountForItem}/2 done)` : undefined}
            >
              {inCart ? '✓ In Cart' : canAddToCart ? '+ Add to Cart' : `🔒 Query 2 Systems (${queriedCountForItem}/2)`}
            </button>
          </div>

          {item.description && (
            <div className="rounded-lg border border-border bg-card/50 px-4 py-3 mb-1">
              <div className="text-[9px] font-semibold tracking-wide uppercase text-muted-foreground mb-1">
                Product details
              </div>
              <div className="text-[12px] text-foreground/80 leading-relaxed whitespace-pre-line">
                {item.description}
              </div>
            </div>
          )}

          {LOOKUP_METHODS.map((method, methodIdx) => {
            const isDone    = queriedMethods[currentItem]?.has(methodIdx) && !loadingCards[cardKey(currentItem, methodIdx)];
            const isLoading = !!loadingCards[cardKey(currentItem, methodIdx)];
            const isIdle    = !isDone && !isLoading;
            const lookup    = item.lookups[methodIdx];
            const msg       = loadingMsgs[currentItem]?.[methodIdx] ?? '';

            return (
              <div
                key={methodIdx}
                className={`relative rounded-xl border transition-all duration-300 ${
                  isDone
                    ? lookup.type === 'ok'
                      ? 'border-primary/30 shadow-sm bg-primary-light-bg/30'
                      : lookup.type === 'err'
                      ? 'border-destructive/20 shadow-sm bg-destructive/[0.02]'
                      : 'border-warning/20 shadow-sm bg-warning/[0.03]'
                    : isLoading
                    ? 'border-primary/30 bg-primary-light-bg/20'
                    : 'border-border hover:border-primary/20 hover:shadow-sm'
                } bg-card`}
              >
                {/* Scan laser */}
                {scanningCard === cardKey(currentItem, methodIdx) && (
                  <div className="scan-laser" />
                )}
                {/* Header row */}
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isDone
                        ? lookup.type === 'ok' ? 'bg-primary' : lookup.type === 'err' ? 'bg-destructive' : 'bg-warning'
                        : isLoading ? 'bg-primary animate-pulse' : 'bg-border'
                    }`} />
                    <div>
                      <div className="text-[9px] font-semibold tracking-wide uppercase text-muted-foreground">
                        System {String.fromCharCode(65 + methodIdx)}
                      </div>
                      <div className="text-[12px] font-bold text-foreground">{method}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isDone && (
                      <span className={`text-[9px] font-bold tracking-wide uppercase rounded-full border px-2.5 py-0.5 ${statusBadgeClass(lookup.type)}`}>
                        {statusLabel(lookup.type)}
                      </span>
                    )}
                    {isIdle && (
                      <button
                        onClick={() => runLookup(methodIdx)}
                        data-sound="none"
                        className="bg-background border border-border text-muted-foreground rounded-lg px-3.5 py-1.5 text-[10px] font-bold tracking-wide uppercase cursor-pointer transition-all hover:border-primary hover:text-primary hover:shadow-sm"
                      >
                        Query →
                      </button>
                    )}
                    {isLoading && (
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            style={{ animation: `pulse-dot 0.8s ease infinite ${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body */}
                {isIdle && (
                  <div className="px-4 pb-3 border-t border-border/50 pt-2.5">
                    <div className="text-[11px] text-muted-foreground/40 select-none blur-[2px] pointer-events-none whitespace-pre-line leading-relaxed">
                      {lookup.text}
                    </div>
                    <div className="text-[9px] text-muted-foreground/30 mt-0.5 tracking-wide">— Query to reveal</div>
                  </div>
                )}
                {isLoading && (
                  <div className="px-4 pb-3 border-t border-primary/10 pt-2.5">
                    <div className="text-[11px] font-mono text-primary/60 tracking-wide">{msg}</div>
                  </div>
                )}
                {isDone && (
                  <div className="px-4 pb-5 border-t border-border/30 pt-3 animate-fade-in-up">
                    <div className={`text-[13px] font-normal leading-relaxed whitespace-pre-line ${bodyClass(lookup.type)}`}>
                      {lookup.text}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Add to Cart — at the very end of the details scroll */}
          <div className="mt-2 pt-2 flex justify-center">
            <button
              onClick={toggleCart}
              data-sound={!inCart && !canAddToCart ? 'none' : 'click'}
              disabled={!inCart && !canAddToCart}
              className={`w-full rounded-xl px-6 py-3.5 text-[12px] font-bold tracking-wide uppercase transition-all shadow-sm ${
                inCart
                  ? 'bg-primary-light-bg text-primary border border-primary/30 hover:bg-primary/10 active:scale-[0.98]'
                  : canAddToCart
                  ? 'bg-primary text-primary-foreground border border-primary hover:bg-primary-light hover:shadow-md active:scale-[0.98]'
                  : 'bg-muted text-foreground/80 border border-border cursor-not-allowed'
              }`}
              aria-label={inCart ? `Remove ${item.name} from cart` : canAddToCart ? `Add ${item.name} to cart` : `Query all systems before adding ${item.name} to cart`}
              title={!inCart && !canAddToCart ? `Query at least 2 systems first (${queriedCountForItem}/2 done)` : undefined}
            >
              {inCart
                ? `✓ ${item.name} is in your cart`
                : canAddToCart
                ? `+ Add ${item.name} to Cart`
                : `🔒 Query at least 2 systems first (${queriedCountForItem}/2)`}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-border flex items-center justify-between bg-card">
        <div className="flex gap-2 items-center">
          {ITEMS.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                itemsWithQuery.has(i) ? 'bg-primary' : i === count ? 'bg-foreground' : 'bg-border'
              }`}
            />
          ))}
          <span className="text-[11px] text-muted-foreground tracking-wide ml-1 font-medium">
            {count} of {ITEMS.length} items queried
          </span>
        </div>
        <button
          onClick={onCheckout}
          disabled={count < 2 || anyLoading}
          data-sound={count >= 2 && !anyLoading ? 'click' : 'none'}
          className={`bg-primary text-primary-foreground border-none rounded-xl px-8 py-3 font-sans text-xs font-bold tracking-wide uppercase cursor-pointer transition-all active:scale-[0.97] ${
            count >= 2 && !anyLoading
              ? 'opacity-100 hover:bg-primary-light shadow-md hover:shadow-lg'
              : 'opacity-30 pointer-events-none'
          }`}
        >
          {anyLoading ? 'Querying…' : 'Proceed to checkout'}
        </button>
      </div>
    </div>

    {lightbox && (
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center"
        onClick={() => setLightbox(null)}
        style={{ background: 'rgba(0,0,0,0.72)' }}
        role="dialog"
        aria-modal="true"
        aria-label={`${lightbox.name} — image ${lightbox.idx + 1} of ${lightbox.srcs.length}`}
      >
        <div
          className="relative flex flex-col items-center gap-4 p-4"
        >
          {/* Main image — transform-scale zoom with drag-to-pan */}
          <div
            className="relative rounded-xl shadow-2xl overflow-hidden bg-black/20"
            style={{ width: imgContainerSize, height: imgContainerSize, cursor: lightbox.zoom > 1 ? 'grab' : 'default' }}
            onPointerDown={e => {
              if (lightbox.zoom <= 1) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
            }}
            onPointerMove={e => {
              if (!dragRef.current) return;
              const dx = e.clientX - dragRef.current.startX;
              const dy = e.clientY - dragRef.current.startY;
              // Clamp pan so image edges can't go past the container edge
              const maxPan = (imgContainerSize * (lightbox.zoom - 1)) / 2;
              setPan({
                x: Math.max(-maxPan, Math.min(maxPan, dragRef.current.panX + dx)),
                y: Math.max(-maxPan, Math.min(maxPan, dragRef.current.panY + dy)),
              });
            }}
            onPointerUp={() => { dragRef.current = null; }}
            onPointerLeave={() => { dragRef.current = null; }}
          >
            {/* Stack every sibling image and toggle visibility — avoids the
                decode/paint flash you get when swapping a single <img>'s src. */}
            {lightbox.srcs.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${lightbox.name} ${i + 1}`}
                draggable={false}
                loading="eager"
                decoding="sync"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: imgContainerSize,
                  height: imgContainerSize,
                  objectFit: 'contain',
                  display: 'block',
                  transform: i === lightbox.idx
                    ? `scale(${lightbox.zoom}) translate(${pan.x / lightbox.zoom}px, ${pan.y / lightbox.zoom}px)`
                    : 'none',
                  transformOrigin: 'center',
                  transition: dragRef.current ? 'none' : 'transform 0.15s ease',
                  userSelect: 'none',
                  visibility: i === lightbox.idx ? 'visible' : 'hidden',
                }}
              />
            ))}
            {/* Prev / next arrows — overlaid on the image so they're always visible */}
            {lightbox.srcs.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPan({ x: 0, y: 0 });
                    setLightbox(lb => lb && { ...lb, idx: (lb.idx - 1 + lb.srcs.length) % lb.srcs.length, zoom: 1 });
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white text-xl flex items-center justify-center transition-colors focus:outline-none z-10"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPan({ x: 0, y: 0 });
                    setLightbox(lb => lb && { ...lb, idx: (lb.idx + 1) % lb.srcs.length, zoom: 1 });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white text-xl flex items-center justify-center transition-colors focus:outline-none z-10"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Zoom slider */}
          <div
            className="flex flex-col gap-1"
            style={{ width: imgContainerSize }}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <span className="text-white/60 font-mono text-[10px] tracking-[0.12em] uppercase text-center">
              Drag slider to zoom in / out
            </span>
            <div className="flex items-center gap-3">
              <span className="text-white/40 font-mono text-[10px] flex-shrink-0">1×</span>
              <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={lightbox.zoom}
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
              onChange={e => {
                const z = parseFloat(e.target.value);
                setLightbox(lb => lb && { ...lb, zoom: z });
                if (parseFloat(e.target.value) === 1) setPan({ x: 0, y: 0 });
              }}
              className="flex-1 h-1 appearance-none rounded-full cursor-pointer accent-white opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Zoom level"
              />
              <span className="text-white/40 font-mono text-[10px] flex-shrink-0">4×</span>
              <span className="text-white/60 font-mono text-[10px] w-8 text-right flex-shrink-0">
                {lightbox.zoom.toFixed(1)}×
              </span>
            </div>
          </div>

          {/* Label + dots */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <span className="text-white/80 font-mono text-[11px] tracking-[0.12em] uppercase">
              {lightbox.name}
            </span>
            {lightbox.srcs.length > 1 && (
              <div className="flex gap-2">
                {lightbox.srcs.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setPan({ x: 0, y: 0 }); setLightbox(lb => lb && { ...lb, idx: i, zoom: 1 }); }}
                    className={`w-2 h-2 rounded-full transition-colors focus:outline-none ${
                      i === lightbox.idx ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
        <p className="absolute bottom-2 text-white/40 text-[10px] font-mono tracking-wide">
          click anywhere to close
        </p>
      </div>
    )}
    </>
  );
};

export default ItemLookupScreen;
