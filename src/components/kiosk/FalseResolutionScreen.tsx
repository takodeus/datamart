import { useEffect, useRef, useState } from 'react';
import { FALSE_RESOLUTION_EXCEPTIONS } from '@/lib/kiosk-data';
import { errorTone } from '@/lib/kiosk-audio';

interface FalseResolutionScreenProps {
  onGetHelp: () => void;
  active: boolean;
}

type Phase = 'applied' | 'loading' | 'revealing' | 'warning';

const APPLIED_DELAY = 900;        // brief "System Updates Applied" pause
const EXCEPTION_STAGGER = 480;    // ms between each exception fade-in
const WARNING_DELAY = 600;        // pause before WARNING appears

const FalseResolutionScreen = ({ onGetHelp, active }: FalseResolutionScreenProps) => {
  const [phase, setPhase] = useState<Phase>('applied');
  const [revealedCount, setRevealedCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasRunRef = useRef(false);

  // Reset whenever screen becomes inactive so re-entry replays the cascade.
  useEffect(() => {
    if (!active) {
      hasRunRef.current = false;
      setPhase('applied');
      setRevealedCount(0);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    }
  }, [active]);

  // Drive the choreography on activation. Run once per activation.
  useEffect(() => {
    if (!active || hasRunRef.current) return;
    hasRunRef.current = true;

    const schedule = (ms: number, fn: () => void) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    // Play the error tone shortly after the screen shows so it lands
    // with the UI rather than overlapping the screen-transition click.
    schedule(220, () => errorTone());

    // Stage 1 → 2: pretend the fix worked, then start surfacing exceptions.
    schedule(APPLIED_DELAY, () => {
      setPhase('loading');
    });

    // Stage 2 → 3: reveal exceptions one by one (silent reveals).
    FALSE_RESOLUTION_EXCEPTIONS.forEach((_, i) => {
      schedule(APPLIED_DELAY + 300 + i * EXCEPTION_STAGGER, () => {
        setRevealedCount(i + 1);
        if (i === 0) setPhase('revealing');
      });
    });

    // Stage 3 → 4: surface the WARNING block.
    const total =
      APPLIED_DELAY +
      300 +
      FALSE_RESOLUTION_EXCEPTIONS.length * EXCEPTION_STAGGER +
      WARNING_DELAY;
    schedule(total, () => setPhase('warning'));

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [active]);

  return (
    <div
      className="flex flex-col items-center justify-start bg-background overflow-y-auto py-8 px-6"
      style={{ position: 'absolute', inset: 0 }}
    >
      <div className="w-full max-w-[640px] flex flex-col items-stretch">

        {/* Stage 1 — System Updates Applied (transient) ──────────── */}
        <div className={`transition-opacity duration-500 ${phase === 'applied' ? 'opacity-100' : 'opacity-60'}`}>
          <div className="inline-flex items-center gap-2 bg-primary-light-bg border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-wide uppercase text-primary">
              System Updates Applied
            </span>
          </div>
        </div>

        {/* Stage 2+ — New Exceptions Detected ─────────────────────── */}
        {phase !== 'applied' && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-full px-4 py-1.5">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-[11px] font-bold tracking-wide uppercase text-destructive">
                  New Exceptions Detected
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {revealedCount} / {FALSE_RESOLUTION_EXCEPTIONS.length}
              </span>
            </div>

            <div className="border border-border rounded-xl bg-card/60 overflow-hidden mb-6">
              {FALSE_RESOLUTION_EXCEPTIONS.map((ex, i) => {
                const shown = i < revealedCount;
                return (
                  <div
                    key={ex.headline}
                    className={`flex items-start gap-3 px-5 py-3.5 border-b border-border/60 last:border-b-0 transition-all duration-300 ${
                      shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    <span className="text-warning-foreground text-[14px] leading-none mt-0.5">⚠</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground leading-snug">
                        {ex.headline}
                      </div>
                      {ex.detail && (
                        <div className="text-[11px] font-mono text-destructive/80 mt-1 leading-snug">
                          {ex.detail}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 3 — WARNING block + Get Help CTA ─────────────────── */}
        {phase === 'warning' && (
          <div className="animate-fade-in-up flex flex-col items-stretch">
            <div className="border-l-4 border-destructive bg-destructive/5 rounded-r-lg px-5 py-4 mb-7">
              <div className="text-[10px] font-black tracking-[0.18em] uppercase text-destructive mb-1.5">
                Warning
              </div>
              <div className="text-[14px] leading-relaxed text-foreground">
                Classification alone cannot resolve disconnected systems, conflicting definitions, or unstable decision-making.
                <span className="font-bold text-foreground"> There's a better way.</span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onGetHelp}
                data-sound="checkout"
                className="idle-btn bg-primary text-primary-foreground border-none rounded-2xl px-14 py-5 font-sans text-[14px] font-black tracking-wider uppercase cursor-pointer transition-all hover:bg-primary-light active:scale-[0.98]"
                style={{ boxShadow: '0 0 0 1px hsl(var(--primary) / 0.5), 0 8px 28px hsl(var(--primary) / 0.35)' }}
              >
                Get Help
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FalseResolutionScreen;
