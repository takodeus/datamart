let audioCtx: AudioContext | null = null;
let soundEnabled = false;

// Global gate — when false, all sound functions are no-ops.
// Index.tsx flips this whenever the user toggles the sound icon.
export const setSoundEnabled = (on: boolean) => { soundEnabled = on; };

function getAudio(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

// Play a single tone immediately — no scheduling, no clock offset.
// Used for click/softClick so button presses feel instantaneous.
function playInstant(freq: number, dur: number, type: OscillatorType, vol: number) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudio();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.start(now);
    o.stop(now + dur);
  } catch {}
}

// Schedule a single tone at an absolute AudioContext time. Using the
// audio clock (instead of setTimeout) avoids JS event-loop jitter so
// multi-tone sequences feel tight rather than echoey.
function scheduleTone(ctx: AudioContext, when: number, freq: number, dur: number, type: OscillatorType, vol: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  o.start(when);
  o.stop(when + dur);
}

// Play a sequence of tones starting immediately. Each tone is
// {f, d, t?, v?, gap?} — gap is the offset (s) from the previous tone's start.
type Tone = { f: number; d: number; t?: OscillatorType; v?: number; gap?: number };
function playSequence(tones: Tone[]) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudio();
    // Fire and forget resume — don't await it. If still suspended, the
    // scheduled oscillators will play as soon as the clock unpauses.
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    let t = ctx.currentTime + 0.001;
    tones.forEach((tone, i) => {
      if (i > 0) t += tone.gap ?? 0;
      scheduleTone(ctx, t, tone.f, tone.d, tone.t ?? 'sine', tone.v ?? 0.2);
    });
  } catch {}
}

const beep = (freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) =>
  playInstant(freq, dur, type, vol);

export const scanBeep = () =>
  playSequence([
    { f: 1800, d: 0.07, t: 'square', v: 0.2 },
    { f: 2200, d: 0.07, t: 'square', v: 0.15, gap: 0.06 },
  ]);

export const errorTone = () =>
  playSequence([
    { f: 220, d: 0.28, t: 'sawtooth', v: 0.15 },
    { f: 180, d: 0.32, t: 'sawtooth', v: 0.12, gap: 0.18 },
  ]);

export const successChime = () =>
  playSequence(
    [523, 659, 784, 1047].map((f, i) => ({
      f, d: 0.22, t: 'sine' as OscillatorType, v: 0.2, gap: i === 0 ? 0 : 0.06,
    }))
  );

// Short victory chirp for the Solution screen — bright two-note rise.
export const solutionVictory = () =>
  playSequence([
    { f: 784, d: 0.12, t: 'triangle', v: 0.22 },
    { f: 1175, d: 0.18, t: 'triangle', v: 0.22, gap: 0.09 },
  ]);

// Slightly different victory chirp for the Receipt screen — three-note
// resolved arpeggio so it feels like a "completed" cousin of solutionVictory.
export const receiptVictory = () =>
  playSequence([
    { f: 880, d: 0.1, t: 'triangle', v: 0.2 },
    { f: 1175, d: 0.1, t: 'triangle', v: 0.2, gap: 0.08 },
    { f: 1568, d: 0.2, t: 'triangle', v: 0.22, gap: 0.08 },
  ]);

export const clickBeep = () => playInstant(900, 0.06, 'square', 0.1);
// Very subtle, quiet UI click — used as a global button-press feedback.
export const softClick = () => playInstant(2400, 0.02, 'sine', 0.04);

export const initAudio = () => {
  try {
    const ctx = getAudio();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  } catch {}
};

// Same family as clickBeep (square wave, similar volume) but a two-tone
// rising chirp so Add to Cart feels related yet distinct from the
// stepper-bar nav clicks. Multi-tone — uses the audio clock for tight gap.
export const checkoutBeep = () =>
  playSequence([
    { f: 900, d: 0.06, t: 'square', v: 0.18 },
    { f: 1300, d: 0.07, t: 'square', v: 0.18, gap: 0.05 },
  ]);

// Friendly three-note "power-on" chirp for the Start Lookup button.
// Distinct from clickBeep / checkoutBeep — uses triangle wave and a
// rising arpeggio so the kiosk feels like it's booting into the flow.
export const startBeep = () =>
  playSequence([
    { f: 660, d: 0.09, t: 'triangle', v: 0.18 },
    { f: 880, d: 0.09, t: 'triangle', v: 0.18, gap: 0.07 },
    { f: 1320, d: 0.14, t: 'triangle', v: 0.2, gap: 0.07 },
  ]);
