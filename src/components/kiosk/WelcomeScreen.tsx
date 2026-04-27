import { useCallback, useEffect, useRef, useState } from 'react';
import cherreLogo from '@/assets/cherre-logo.jpeg';
import backdropImg from '@/assets/backdrop.jpg';
import { initAudio } from '@/lib/kiosk-audio';

interface WelcomeScreenProps {
  onStart: () => void;
  active: boolean;
  forceIdle?: boolean;
  onIdleAcknowledged?: () => void;
}

const IDLE_DELAY = 8000;

const WelcomeScreen = ({ onStart, active, forceIdle, onIdleAcknowledged }: WelcomeScreenProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [idle, setIdle] = useState(false);
  // Ken Burns cycles between two pan positions while idle
  const [kenBurnsPhase, setKenBurnsPhase] = useState(0);
  const kenBurnsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    setIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdle(true), IDLE_DELAY);
  }, []);

  // Start/stop Ken Burns interval when idle changes
  useEffect(() => {
    if (idle) {
      setKenBurnsPhase(1);
      kenBurnsRef.current = setInterval(() => {
        setKenBurnsPhase(p => (p === 1 ? 2 : 1));
      }, 7000);
    } else {
      setKenBurnsPhase(0);
      if (kenBurnsRef.current) clearInterval(kenBurnsRef.current);
    }
    return () => { if (kenBurnsRef.current) clearInterval(kenBurnsRef.current); };
  }, [idle]);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIdle(false);
      return;
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    timerRef.current = setTimeout(() => setIdle(true), IDLE_DELAY);
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, resetTimer]);

  // External lock trigger (from terminal bar lock button)
  useEffect(() => {
    if (forceIdle) {
      setIdle(true);
      onIdleAcknowledged?.();
    }
  }, [forceIdle, onIdleAcknowledged]);

  // Tapping idle screen returns to welcome (not straight to demo)
  const handleIdleTap = () => {
    resetTimer();
  };

  const handleStart = () => {
    resetTimer();
    initAudio();
    onStart();
  };

  // Ken Burns transform per phase
  const kenBurnsTransform =
    kenBurnsPhase === 0 ? 'scale(1) translate(0%, 0%)' :
    kenBurnsPhase === 1 ? 'scale(1.08) translate(-2%, -1%)' :
                          'scale(1.08) translate(2%, 1%)';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

      {/* ── Backdrop ── always present, opacity switches on idle ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${backdropImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: idle ? 1 : 0.13,
          transform: kenBurnsTransform,
          transition: idle
            ? 'opacity 0.8s ease, transform 7s ease-in-out'
            : 'opacity 0.8s ease, transform 0.8s ease',
          pointerEvents: 'none',
        }}
      />

      {/* ── Radial gradient — only in normal state for text readability ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)/0.75) 100%)',
          opacity: idle ? 0 : 1,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
        }}
      />

      {/* ── IDLE STATE — full backdrop + tap to begin pill ── */}
      {idle && (
        <button
          onClick={handleIdleTap}
          style={{
            position: 'absolute', inset: 0,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '60px 40px 40px',
          }}
          aria-label="Tap to begin"
        >
          <div style={{
            background: 'rgba(0,0,0,0.50)',
            color: 'rgba(255,255,255,0.9)',
            borderRadius: '999px',
            padding: '8px 24px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}>
            Tap to begin
          </div>
        </button>
      )}

      {/* ── NORMAL STATE — welcome content ── */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '40px',
          opacity: idle ? 0 : 1,
          transition: 'opacity 0.6s ease',
          pointerEvents: idle ? 'none' : 'auto',
        }}
      >
        <img
          src={cherreLogo}
          alt="Cherre"
          className="h-14 mb-6 object-contain"
          style={{ mixBlendMode: 'multiply' }}
        />

        <div className="pill-badge mb-8">
          Price Check on Aisle F
        </div>

        <div
          className="text-foreground font-black leading-none tracking-tight mb-3"
          style={{ fontSize: 'clamp(38px, 7vw, 72px)' }}
        >
          Cherre<br /><span className="text-primary">Data Mart</span>
        </div>

        <div
          className="text-foreground/70 font-medium mb-8 tracking-wide max-w-[400px]"
          style={{ fontSize: 'clamp(14px, 2vw, 18px)' }}
        >
          Scan, search, or look up your item to begin checkout.
        </div>

        <div className="text-[13px] text-foreground/70 italic font-light max-w-[380px] leading-relaxed border border-border rounded-xl px-6 py-4 mb-10 bg-card/60 backdrop-blur-sm">
          "This store has been running on four different inventory systems since 2003. Good luck."
        </div>

        <button
          onClick={handleStart}
          data-sound="start"
          className="bg-primary text-primary-foreground border-none rounded-xl px-14 py-5 font-sans text-sm font-bold tracking-wide uppercase cursor-pointer transition-all hover:bg-primary-light hover:shadow-lg active:scale-[0.98] shadow-md"
        >
          Start Lookup
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
