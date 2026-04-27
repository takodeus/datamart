import { useCallback, useEffect, useRef, useState } from 'react';
import cherreLogo from '@/assets/cherre-logo.jpeg';
import { useSearchParams } from 'react-router-dom';
import WelcomeScreen from '@/components/kiosk/WelcomeScreen';
import ItemLookupScreen from '@/components/kiosk/ItemLookupScreen';
import ReconciliationScreen from '@/components/kiosk/ReconciliationScreen';
import ResolutionScreen from '@/components/kiosk/ResolutionScreen';
import ReceiptScreen from '@/components/kiosk/ReceiptScreen';
import TeamScreen from '@/components/kiosk/TeamScreen';
import StepperBar from '@/components/kiosk/StepperBar';
import CartSidebar from '@/components/kiosk/CartSidebar';
import DeviceBezel from '@/components/kiosk/DeviceBezel';
import { ITEMS } from '@/lib/kiosk-data';
import { clickBeep, checkoutBeep, errorTone, successChime, scanBeep, initAudio, softClick, setSoundEnabled, startBeep, solutionVictory, receiptVictory } from '@/lib/kiosk-audio';

const TRANSITION_MS = 340;
const SCREEN_MIN = 1;
const SCREEN_MAX = 6;

function clampScreen(v: string | null): number {
  const n = parseInt(v ?? '', 10);
  return Number.isFinite(n) && n >= SCREEN_MIN && n <= SCREEN_MAX ? n : 1;
}

function clampItem(v: string | null): number {
  const n = parseInt(v ?? '', 10);
  return Number.isFinite(n) && n >= 0 && n < ITEMS.length ? n : 0;
}

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentScreen, setCurrentScreen] = useState<number>(() => {
    const s = clampScreen(searchParams.get('screen'));
    return s === 5 ? 1 : s;
  });
  const [currentItem, setCurrentItem] = useState<number>(() => clampItem(searchParams.get('item')));

  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [soundOn, setSoundOn] = useState(true);
  const [itemsWithQuery, setItemsWithQuery] = useState<Set<number>>(new Set());
  const [queriedMethods, setQueriedMethods] = useState<Set<number>[]>(ITEMS.map(() => new Set()));
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [maxReached, setMaxReached] = useState<number>(1);
  const [lockOnWelcome, setLockOnWelcome] = useState(false);

  const prevScreenRef = useRef(currentScreen);
  const transitioning = useRef(false);
  const internalNavRef = useRef(0);
  const soundOnRef = useRef(true);
  useEffect(() => {
    soundOnRef.current = soundOn;
    setSoundEnabled(soundOn);
  }, [soundOn]);

  // Global button sound router: fires on pointer-down so sounds start on
  // press instead of waiting for click / mouse-up.
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      initAudio();
      if (!soundOnRef.current) return;
      const target = e.target as HTMLElement | null;
      const btn = target?.closest('button') as HTMLButtonElement | null;
      if (!btn) return;
      if (btn.disabled) return;

      const sound = btn.dataset.sound;
      if (sound === 'none' || (!sound && btn.dataset.noClickSound === 'true')) return;

      switch (sound) {
        case 'click':
          clickBeep();
          break;
        case 'start':
          startBeep();
          break;
        case 'scan':
          scanBeep();
          break;
        case 'error':
          errorTone();
          break;
        case 'success':
          successChime();
          break;
        case 'checkout':
          checkoutBeep();
          break;
        default:
          softClick();
      }
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, []);

  const pushParams = useCallback((screen: number, item: number) => {
    internalNavRef.current++;
    const next: Record<string, string> = { screen: String(screen) };
    if (screen === 2) next.item = String(item);
    setSearchParams(next, { replace: false });
  }, [setSearchParams]);

  useEffect(() => {
    if (internalNavRef.current > 0) {
      internalNavRef.current--;
      return;
    }

    const newScreen = clampScreen(searchParams.get('screen'));
    const newItem = clampItem(searchParams.get('item'));

    if (newScreen === currentScreen && newItem === currentItem) return;

    const dir = newScreen > prevScreenRef.current ? 'forward' : 'back';
    setDirection(dir);

    const outgoingEl = document.querySelector(`[data-screen="${prevScreenRef.current}"]`);
    if (outgoingEl) {
      outgoingEl.classList.add('exiting');
      outgoingEl.setAttribute('data-exit-dir', dir);
      setTimeout(() => {
        outgoingEl.classList.remove('exiting');
        outgoingEl.removeAttribute('data-exit-dir');
      }, TRANSITION_MS);
    }

    prevScreenRef.current = newScreen;
    setCurrentScreen(newScreen);
    setCurrentItem(newItem);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback((n: number) => {
    if (transitioning.current) return;

    const dir = n > prevScreenRef.current ? 'forward' : 'back';
    setDirection(dir);

    const outgoingEl = document.querySelector(`[data-screen="${prevScreenRef.current}"]`);
    if (outgoingEl) {
      outgoingEl.classList.add('exiting');
      outgoingEl.setAttribute('data-exit-dir', dir);
    }

    transitioning.current = true;
    setTimeout(() => {
      if (outgoingEl) {
        outgoingEl.classList.remove('exiting');
        outgoingEl.removeAttribute('data-exit-dir');
      }
      transitioning.current = false;
    }, TRANSITION_MS);

    prevScreenRef.current = n;
    setCurrentScreen(n);
    setMaxReached(prev => Math.max(prev, n));
    pushParams(n, currentItem);
  }, [currentItem, pushParams]);

  const selectItem = useCallback((idx: number) => {
    setCurrentItem(idx);
    pushParams(currentScreen, idx);
  }, [currentScreen, pushParams]);

  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      if (!prev) initAudio();
      return !prev;
    });
  }, []);

  // Initialize audio on first user interaction so the default-on sound can play
  useEffect(() => {
    const onFirstInteract = () => {
      initAudio();
      document.removeEventListener('pointerdown', onFirstInteract, true);
      document.removeEventListener('keydown', onFirstInteract, true);
    };
    document.addEventListener('pointerdown', onFirstInteract, true);
    document.addEventListener('keydown', onFirstInteract, true);
    return () => {
      document.removeEventListener('pointerdown', onFirstInteract, true);
      document.removeEventListener('keydown', onFirstInteract, true);
    };
  }, []);

  const lockScreen = useCallback(() => {
    setLockOnWelcome(true);
    goTo(1);
  }, [goTo]);

  const handleChangeQuantity = useCallback((itemIdx: number, delta: number) => {
    setQuantities(prev => ({ ...prev, [itemIdx]: Math.max(1, (prev[itemIdx] ?? 1) + delta) }));
  }, []);

  const handleRemoveItem = useCallback((itemIdx: number) => {
    setItemsWithQuery(prev => { const next = new Set(prev); next.delete(itemIdx); return next; });
    setQuantities(prev => { const next = { ...prev }; delete next[itemIdx]; return next; });
  }, []);

  const restart = useCallback(() => {
    window.dispatchEvent(new Event('kiosk:reset'));
    setItemsWithQuery(new Set());
    setQueriedMethods(ITEMS.map(() => new Set()));
    setQuantities({});
    setCurrentItem(0);
    setMaxReached(1);
    goTo(1);
  }, [goTo]);

  // Auto-reset to welcome after 60s of inactivity (excluding screen 1 itself,
  // which already has its own idle backdrop behavior).
  const restartRef = useRef(restart);
  useEffect(() => { restartRef.current = restart; }, [restart]);
  useEffect(() => {
    if (currentScreen === 1) return;
    let timer = setTimeout(() => restartRef.current(), 60000);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => restartRef.current(), 60000);
    };
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart', 'mousemove'];
    events.forEach(e => document.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach(e => document.removeEventListener(e, reset));
    };
  }, [currentScreen]);

  // Auto-reset all session state whenever the Welcome screen is shown
  // (covers the stepper "Welcome" jump as well as initial mount).
  const didMount = useRef(false);
  useEffect(() => {
    if (currentScreen !== 1) return;
    if (!didMount.current) { didMount.current = true; return; }
    window.dispatchEvent(new Event('kiosk:reset'));
    setItemsWithQuery(new Set());
    setQueriedMethods(ITEMS.map(() => new Set()));
    setQuantities({});
    setCurrentItem(0);
    setMaxReached(1);
  }, [currentScreen]);

  // Per-screen arrival sounds: error on Problem, victory on Solution & Receipt.
  useEffect(() => {
    if (!soundOnRef.current) return;
    if (currentScreen === 3) errorTone();
    else if (currentScreen === 4) solutionVictory();
    else if (currentScreen === 6) receiptVictory();
  }, [currentScreen]);

  return (
    <DeviceBezel soundOn={soundOn} onToggleSound={toggleSound} onLock={lockScreen}>
      <div className="w-full h-full flex flex-col bg-background overflow-hidden relative">
        {/* Persistent Cherre logo watermark */}
        {currentScreen !== 1 && (
          <img
            src={cherreLogo}
            alt="Cherre"
            className="absolute top-3 left-3 h-6 object-contain z-[100] pointer-events-none"
            style={{ mixBlendMode: 'multiply', opacity: currentScreen === 4 ? 0.8 : 0.4 }}
          />
        )}
        <StepperBar currentScreen={currentScreen} maxReached={maxReached} onNavigate={goTo} onReset={restart} />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <div data-screen="1" className={`screen ${currentScreen === 1 ? `active enter-${direction}` : ''}`}>
              <WelcomeScreen onStart={() => goTo(2)} active={currentScreen === 1} forceIdle={lockOnWelcome} onIdleAcknowledged={() => setLockOnWelcome(false)} />
            </div>
            <div data-screen="2" className={`screen ${currentScreen === 2 ? `active enter-${direction}` : ''}`}>
              <ItemLookupScreen
                currentItem={currentItem}
                onSelectItem={selectItem}
                itemsWithQuery={itemsWithQuery}
                setItemsWithQuery={setItemsWithQuery}
                queriedMethods={queriedMethods}
                setQueriedMethods={setQueriedMethods}
                onCheckout={() => goTo(3)}
              />
            </div>
            <div data-screen="3" className={`screen ${currentScreen === 3 ? `active enter-${direction}` : ''}`}>
              <ReconciliationScreen onBetterWay={() => goTo(4)} active={currentScreen === 3} itemsWithQuery={itemsWithQuery} queriedMethods={queriedMethods} quantities={quantities} />
            </div>
            <div data-screen="4" className={`screen ${currentScreen === 4 ? `active enter-${direction}` : ''}`}>
              <ResolutionScreen onTalk={() => goTo(5)} onSkipToReceipt={() => goTo(6)} />
            </div>
            <div data-screen="5" className={`screen ${currentScreen === 5 ? `active enter-${direction}` : ''}`}>
              <TeamScreen onContinue={() => goTo(6)} />
            </div>
            <div data-screen="6" className={`screen ${currentScreen === 6 ? `active enter-${direction}` : ''}`}>
              <ReceiptScreen
                onRestart={restart}
                itemsWithQuery={itemsWithQuery}
                queriedMethods={queriedMethods}
              />
            </div>
          </div>

          {/* Running cart sidebar */}
          <CartSidebar
            itemsWithQuery={itemsWithQuery}
            queriedMethods={queriedMethods}
            currentScreen={currentScreen}
            quantities={quantities}
            onChangeQuantity={handleChangeQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </div>
    </DeviceBezel>
  );
};

export default Index;
