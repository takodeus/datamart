import { useEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { ITEMS, CATEGORIES, AISLES, type Aisle } from '@/lib/kiosk-data';
import { ITEM_IMAGES } from './itemImages';
import ProductDetailModal from './ProductDetailModal';

export interface ItemClassification {
  categories: string[];   // multi-select
  aisle: number | null;   // single-select aisle number, null when unset
}

export type Classifications = Record<number, ItemClassification>;

interface ClassificationScreenProps {
  currentItem: number;
  onSelectItem: (idx: number) => void;
  classifications: Classifications;
  setClassifications: (updater: (prev: Classifications) => Classifications) => void;
  onUpdateSystem: () => void;
}

const isClassified = (c?: ItemClassification): boolean =>
  !!c && c.categories.length > 0 && c.aisle !== null;

const ClassificationScreen = ({
  currentItem,
  onSelectItem,
  classifications,
  setClassifications,
  onUpdateSystem,
}: ClassificationScreenProps) => {
  const middleScrollRef = useRef<HTMLDivElement | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Reset middle-panel scroll on item change.
  useEffect(() => {
    middleScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentItem]);

  const item = ITEMS[currentItem];
  const current = classifications[currentItem] ?? { categories: [], aisle: null };

  const MIN_TO_SUBMIT = 3;

  const classifiedCount = useMemo(
    () => ITEMS.filter((_, i) => isClassified(classifications[i])).length,
    [classifications],
  );
  const allClassified = classifiedCount === ITEMS.length;
  const canSubmit = classifiedCount >= MIN_TO_SUBMIT;
  const remainingToUnlock = Math.max(0, MIN_TO_SUBMIT - classifiedCount);
  const currentDone = isClassified(classifications[currentItem]);
  const unclassifiedIndices = ITEMS
    .map((_, i) => i)
    .filter(i => i !== currentItem && !isClassified(classifications[i]));

  const toggleCategory = (cat: string) => {
    setClassifications(prev => {
      const cur = prev[currentItem] ?? { categories: [], aisle: null };
      const has = cur.categories.includes(cat);
      const nextCats = has
        ? cur.categories.filter(c => c !== cat)
        : [...cur.categories, cat];
      return { ...prev, [currentItem]: { ...cur, categories: nextCats } };
    });
  };

  const setAisle = (a: Aisle) => {
    setClassifications(prev => {
      const cur = prev[currentItem] ?? { categories: [], aisle: null };
      const nextAisle = cur.aisle === a.num ? null : a.num;
      return { ...prev, [currentItem]: { ...cur, aisle: nextAisle } };
    });
  };

  const itemImg = item.images?.[0] ? ITEM_IMAGES[item.images[0]] : undefined;

  return (
    <div className="flex flex-col h-full bg-background" style={{ position: 'absolute', inset: 0 }}>

      {/* Header strip ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-4 pb-3 border-b border-border bg-card/40">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-primary mb-1">
              Admin · System Settings
            </div>
            <div className="text-foreground font-black tracking-tight" style={{ fontSize: 'clamp(15px, 1.9vw, 18px)' }}>
              Classification Console
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground tracking-wide">
              {classifiedCount} / {ITEMS.length} classified
            </div>
            <div className="w-32 h-1 bg-border rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(classifiedCount / ITEMS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug max-w-[700px]">
          Review each item, resolve conflicting definitions, and update the system using your recommended classifications.
        </div>
      </div>

      {/* Three-panel body ─────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">

        {/* LEFT — product list ─────────────────────────────────────── */}
        <div className="w-[200px] flex-shrink-0 border-r border-border bg-card/40 flex flex-col">
          <div className="px-4 py-2.5 border-b border-border/60">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
              Sample Products
            </span>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {ITEMS.map((it, i) => {
              const done = isClassified(classifications[i]);
              const active = i === currentItem;
              const img = it.images?.[0] ? ITEM_IMAGES[it.images[0]] : undefined;
              return (
                <button
                  key={it.name}
                  onClick={() => {
                    if (active) setZoomOpen(true);
                    else onSelectItem(i);
                  }}
                  data-sound="click"
                  title={active ? 'Tap again to zoom' : it.name}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors border-l-2 ${
                    active
                      ? 'bg-primary-light-bg border-l-primary'
                      : 'border-l-transparent hover:bg-muted/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-md bg-background border border-border flex items-center justify-center text-base flex-shrink-0 overflow-hidden">
                    {img
                      ? <img src={img} alt={it.name} className="w-full h-full object-contain p-0.5" />
                      : it.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-bold truncate ${active ? 'text-foreground' : 'text-foreground/80'}`}>
                      {it.name}
                    </div>
                    <div className="text-[9px] text-muted-foreground truncate">{it.category}</div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                      done ? 'bg-primary' : 'bg-border'
                    }`}
                    aria-label={done ? 'Classified' : 'Not classified'}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* MIDDLE — system descriptions ────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col bg-background">
          <div className="px-5 py-2.5 border-b border-border/60 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              data-sound="click"
              aria-label={`Zoom into ${item.name} details`}
              className="group flex items-center gap-2 rounded-md -mx-1 px-1 py-0.5 transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="relative w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-colors">
                {itemImg
                  ? <img src={itemImg} alt={item.name} className="w-full h-full object-contain p-0.5" />
                  : <span className="text-base">{item.icon}</span>}
                <span className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-3.5 h-3.5 text-background opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </span>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  Selected
                  <ZoomIn className="w-2.5 h-2.5 text-primary/70" aria-hidden />
                </div>
                <div className="text-[13px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {item.name}
                </div>
              </div>
            </button>
            <div className="text-[10px] font-mono text-muted-foreground/70">
              4 systems · conflicting definitions
            </div>
          </div>

          <div ref={middleScrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {item.lookups.map((lk, i) => {
              const tone =
                lk.type === 'ok'
                  ? 'border-border bg-card'
                  : lk.type === 'warn'
                  ? 'border-warning/30 bg-warning/5'
                  : 'border-destructive/30 bg-destructive/5';
              const tagTone =
                lk.type === 'ok'
                  ? 'text-muted-foreground bg-muted/40'
                  : lk.type === 'warn'
                  ? 'text-warning-foreground bg-warning/10'
                  : 'text-destructive bg-destructive/10';
              return (
                <div key={i} className={`border rounded-xl p-4 ${tone}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-mono font-bold tracking-wide uppercase text-foreground/70">
                      {lk.sys}
                    </div>
                    <span className={`text-[9px] font-bold tracking-wide uppercase rounded px-1.5 py-0.5 ${tagTone}`}>
                      {lk.type === 'ok' ? 'Match' : lk.type === 'warn' ? 'Warning' : 'Error'}
                    </span>
                  </div>
                  <div className="text-[12px] leading-relaxed text-foreground whitespace-pre-line font-mono">
                    {lk.text}
                  </div>
                </div>
              );
            })}
            <div className="text-[10px] text-muted-foreground/60 italic px-1 pt-1">
              Four systems. Four answers. Pick the right classification on the right.
            </div>
          </div>
        </div>

        {/* RIGHT — classification controls ─────────────────────────── */}
        <div className="w-[280px] flex-shrink-0 border-l border-border bg-card/40 flex flex-col">
          <div className="px-4 py-2.5 border-b border-border/60">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
              Classification Settings
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">

            {/* Category — multi-select */}
            <div className="mb-5">
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wide text-foreground">
                  Category
                </label>
                <span className="text-[9px] font-mono text-muted-foreground">
                  Multi-select · {current.categories.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => {
                  const on = current.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      data-sound="click"
                      className={`text-[11px] font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                        on
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground/75 border-border hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aisle — single-select */}
            <div className="mb-2">
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wide text-foreground">
                  Aisle
                </label>
                <span className="text-[9px] font-mono text-muted-foreground">
                  Single-select
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {AISLES.map(a => {
                  const on = current.aisle === a.num;
                  return (
                    <button
                      key={a.num}
                      onClick={() => setAisle(a)}
                      data-sound="click"
                      className={`flex items-center justify-between text-[11px] rounded-md px-3 py-2 border transition-colors text-left ${
                        on
                          ? 'bg-primary-light-bg border-primary text-foreground'
                          : 'bg-background border-border text-foreground/75 hover:border-primary/40'
                      }`}
                    >
                      <span className="font-semibold">{a.label}</span>
                      <span className={`text-[9px] font-mono ${on ? 'text-primary' : 'text-muted-foreground'}`}>
                        Aisle {a.num}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-border bg-background/60 space-y-2">
            {hasNextUnclassified && (
              <button
                onClick={goToNext}
                data-sound="click"
                className="w-full rounded-xl px-4 py-2.5 font-sans text-[12px] font-bold tracking-wide uppercase transition-all shadow-sm bg-primary text-primary-foreground hover:bg-primary-light hover:shadow-md active:scale-[0.98]"
              >
                Next product →
              </button>
            )}
            <button
              onClick={onUpdateSystem}
              disabled={!canSubmit}
              data-sound="checkout"
              className={`w-full rounded-xl px-4 py-2.5 font-sans text-[12px] font-bold tracking-wide uppercase transition-all ${
                canSubmit
                  ? hasNextUnclassified
                    ? 'bg-background text-foreground border border-primary/40 hover:bg-primary-light-bg active:scale-[0.98] cursor-pointer'
                    : 'bg-primary text-primary-foreground hover:bg-primary-light shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer'
                  : 'bg-muted text-muted-foreground/60 cursor-not-allowed'
              }`}
            >
              Update System
            </button>
            <div className="text-[9px] text-muted-foreground/70 text-center leading-snug">
              {allClassified
                ? 'All items classified. Ready to apply.'
                : !canSubmit
                ? `Classify ${remainingToUnlock} more product${remainingToUnlock === 1 ? '' : 's'} to unlock Update System (${classifiedCount}/${ITEMS.length} done).`
                : `${classifiedCount}/${ITEMS.length} classified — keep going or submit now.`}
            </div>
          </div>
        </div>
      </div>

      <ProductDetailModal item={item} open={zoomOpen} onClose={() => setZoomOpen(false)} />
    </div>
  );
};

export default ClassificationScreen;
