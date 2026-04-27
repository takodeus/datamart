import { ReactNode } from 'react';

interface DeviceBezelProps {
  children: ReactNode;
  soundOn?: boolean;
  onToggleSound?: () => void;
  onLock?: () => void;
}

const DeviceBezel = ({ children, soundOn, onToggleSound, onLock }: DeviceBezelProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/30 p-4 md:p-8">
      {/* Outer bezel shell */}
      <div className="relative w-full h-full max-w-[1100px] max-h-[750px] rounded-[2rem] bg-foreground/90 p-[10px] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
        {/* Inner bezel rim */}
        <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-background relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)]">
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 z-[200] flex items-center justify-between px-5 py-1.5 bg-foreground/95">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-primary-foreground/70 font-mono">
                Cherre Terminal
              </span>
            </div>
            <div className="flex items-center gap-3">
              {onLock && (
                <button
                  onClick={onLock}
                  data-sound="click"
                  className="text-[9px] font-mono text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors cursor-pointer"
                  title="Lock screen"
                  aria-label="Lock screen"
                >
                  ⏻
                </button>
              )}
              {onToggleSound && (
                <button
                  onClick={onToggleSound}
                  data-sound="click"
                  className="text-[9px] font-mono text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors cursor-pointer"
                >
                  {soundOn ? '🔊' : '🔇'}
                </button>
              )}
              <span className="text-[9px] text-primary-foreground/40 font-mono tabular-nums">
                KIOSK-F-042
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-1 rounded-full bg-primary-foreground/${i <= 3 ? '60' : '20'}`} style={{ height: 4 + i * 2 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div className="w-full h-full pt-[26px]">
            {children}
          </div>
        </div>

        {/* Home indicator / chin */}
        <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-24 h-[3px] rounded-full bg-primary-foreground/20" />
      </div>
    </div>
  );
};

export default DeviceBezel;
