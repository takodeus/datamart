import { useEffect, useMemo, useRef, useState } from 'react';
import { ITEMS } from '@/lib/kiosk-data';
import cherreOsImg from '@/assets/Cherre-Os.png';
import ontoloPrimaryImg from '@/assets/ontolo-front.png';
import ontoloBackImg from '@/assets/ontolo-back.png';
import cherriesFrontImg from '@/assets/cherries-front.png';
import flourFrontImg from '@/assets/flour-front.png';
import sardinesFrontImg from '@/assets/sardines-front.png';
import cherreColaFrontImg from '@/assets/cherre-cola-front.png';

const ITEM_IMAGES: Record<string, string> = {
  'Cherre-Os.png': cherreOsImg,
  'ontolo-front.png': ontoloPrimaryImg,
  'ontolo-back.png': ontoloBackImg,
  'cherries-front.png': cherriesFrontImg,
  'flour-front.png': flourFrontImg,
  'sardines-front.png': sardinesFrontImg,
  'cherre-cola-front.png': cherreColaFrontImg,
};

interface ReconciliationScreenProps {
  onBetterWay: () => void;
  active: boolean;
  itemsWithQuery: Set<number>;
  queriedMethods: Set<number>[];
  quantities: Record<number, number>;
}

const parsePrice = (s: string): number => {
  const m = s.match(/[\d,]+\.?\d*/);
  if (!m) return 0;
  return parseFloat(m[0].replace(/,/g, ''));
};

const ReconciliationScreen = ({ onBetterWay, active, itemsWithQuery, queriedMethods, quantities }: ReconciliationScreenProps) => {
  // Build a key reflecting which items are in cart AND their quantities.
  // Same cart + quantities → same totals. Any change → recompute.
  const cartKey = useMemo(
    () =>
      Array.from(itemsWithQuery)
        .sort((a, b) => a - b)
        .map(i => `${i}x${quantities[i] ?? 1}`)
        .join(','),
    [itemsWithQuery, quantities]
  );

  // Compute totals directly from the cart so they reflect quantities & combo.
  const { mainText, altText } = useMemo(() => {
    let main = 0;
    let alt = 0;
    Array.from(itemsWithQuery).forEach(i => {
      const item = ITEMS[i];
      if (!item) return;
      const qty = quantities[i] ?? 1;
      main += parsePrice(item.price) * qty;
      alt  += parsePrice(item.conflictPrice) * qty;
    });
    // Add a small deterministic jitter so totals don't always end in clean numbers.
    let hash = 0;
    for (let i = 0; i < cartKey.length; i++) hash = (hash * 31 + cartKey.charCodeAt(i)) >>> 0;
    const jitter = ((hash % 97) / 100); // 0.00 – 0.96
    main += jitter;
    alt  += ((hash >> 7) % 73) / 100;
    const fmt = (n: number) => '$' + n.toFixed(2);
    return { mainText: fmt(main), altText: 'Or ' + fmt(alt) + '.' };
  }, [itemsWithQuery, quantities, cartKey]);

  const [mainTotal, setMainTotal] = useState(mainText);
  const [altTotal,  setAltTotal]  = useState(altText);
  const hasScrambledForCart = useRef<string | null>(null);

  // Keep totals in sync when cart contents change while not on this screen.
  useEffect(() => {
    if (!active) {
      setMainTotal(mainText);
      setAltTotal(altText);
    }
  }, [mainText, altText, active]);

  useEffect(() => {
    if (!active) return;
    // Only scramble once per unique cart+quantity combination.
    if (hasScrambledForCart.current === cartKey) {
      setMainTotal(mainText);
      setAltTotal(altText);
      return;
    }
    hasScrambledForCart.current = cartKey;
    let flips = 0;
    const scramble = setInterval(() => {
      setMainTotal('$' + (Math.random() * 120 + 30).toFixed(2));
      setAltTotal('Or $' + (Math.random() * 80 + 20).toFixed(2) + '.');
      flips++;
      if (flips > 10) {
        clearInterval(scramble);
        setMainTotal(mainText);
        setAltTotal(altText);
      }
    }, 80);
    return () => clearInterval(scramble);
  }, [active, cartKey, mainText, altText]);

  // Items the user actually queried, in order
  const queriedItems = ITEMS.filter((_, i) => itemsWithQuery.has(i));

  // Count items where a warn or err lookup was run
  const conflictCount = ITEMS.filter((_, i) => {
    if (!itemsWithQuery.has(i)) return false;
    return Array.from(queriedMethods[i] ?? []).some(
      methodIdx => ITEMS[i].lookups[methodIdx]?.type !== 'ok'
    );
  }).length;

  return (
    <div
      className="flex flex-col justify-center items-center p-8 pb-12 bg-background"
      style={{ position: 'absolute', inset: 0 }}
    >
      <div className="max-w-[520px] w-full flex flex-col items-center">

        {/* Error badge */}
        <div className="inline-flex items-center gap-2.5 bg-destructive/5 border border-destructive/20 rounded-xl px-6 py-3 mb-6">
          <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <span className="text-destructive font-black text-[11px]">!</span>
          </div>
          <div className="text-[11px] font-bold tracking-wide uppercase text-destructive">
            Reconciliation Required
          </div>
        </div>

        {/* Order summary card */}
        <div className="w-full bg-card border border-border rounded-xl overflow-hidden mb-6 shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground font-mono">
              Order Summary
            </span>
            {conflictCount > 0 && (
              <span className="text-[10px] font-bold text-destructive font-mono">
                {conflictCount} conflict{conflictCount !== 1 ? 's' : ''} detected
              </span>
            )}
          </div>

          {queriedItems.length > 0 ? (
            queriedItems.map((item, idx) => {
              const origIdx = ITEMS.indexOf(item);
              const qty = quantities[origIdx] ?? 1;
              return (
                <div
                  key={item.name}
                  className={`flex items-center justify-between px-5 py-3 ${
                    idx < queriedItems.length - 1 ? 'border-b border-border/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.images?.[0] && ITEM_IMAGES[item.images[0]] ? (
                      <img
                        src={ITEM_IMAGES[item.images[0]]}
                        alt={item.name}
                        className="w-8 h-8 object-contain flex-shrink-0"
                      />
                    ) : (
                      <span className="text-base leading-none">{item.icon}</span>
                    )}
                    <span className="text-[13px] font-medium text-foreground">{item.name}</span>
                    {qty > 1 && (
                      <span className="text-[10px] font-mono text-muted-foreground">× {qty}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-foreground">{item.price}</div>
                    <div className="text-[10px] text-destructive/70 line-through font-mono">{item.conflictPrice}</div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Fallback if somehow landed here with no items */
            ITEMS.slice(0, 3).map((item, idx) => (
              <div
                key={item.name}
                className={`flex items-center justify-between px-5 py-3 ${idx < 2 ? 'border-b border-border/60' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  {item.images?.[0] && ITEM_IMAGES[item.images[0]] ? (
                    <img
                      src={ITEM_IMAGES[item.images[0]]}
                      alt={item.name}
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                  ) : (
                    <span className="text-base leading-none">{item.icon}</span>
                  )}
                  <span className="text-[13px] font-medium text-foreground">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-bold text-foreground">{item.price}</div>
                  <div className="text-[10px] text-destructive/70 line-through font-mono">{item.conflictPrice}</div>
                </div>
              </div>
            ))
          )}

          {/* Scrambling total row */}
          <div className="flex items-end justify-between px-5 py-4 bg-muted/20 border-t border-border">
            <div>
              <div className="text-[10px] text-muted-foreground font-mono mb-0.5">Your total is…</div>
              <div className="text-[11px] text-muted-foreground/60 italic">
                Depends on which system you believe.
              </div>
            </div>
            <div className="text-right">
              <div className="text-foreground font-black leading-none tracking-tight tabular-nums" style={{ fontSize: 'clamp(28px, 5vw, 42px)' }}>
                {mainTotal}
              </div>
              <div className="text-muted-foreground font-light line-through text-[13px] mt-0.5 tabular-nums">
                {altTotal}
              </div>
            </div>
          </div>
        </div>

        {/* Wait time */}
        <div className="flex items-center justify-between w-full px-1 mb-8">
          <span className="text-[13px] text-destructive/70 font-medium">Please see your data analyst.</span>
          <span className="text-destructive font-black tracking-wide" style={{ fontSize: 'clamp(16px, 2.5vw, 22px)' }}>
            6 hrs
          </span>
        </div>

        <button
          onClick={onBetterWay}
          className="w-full bg-background border border-primary text-primary rounded-xl px-12 py-4 font-sans text-sm font-bold tracking-wide uppercase cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.98] shadow-sm"
        >
          There is a better way →
        </button>
      </div>
    </div>
  );
};

export default ReconciliationScreen;
