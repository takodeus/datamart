
interface StepperBarProps {
  currentScreen: number;
  maxReached: number;
  onNavigate: (screen: number) => void;
  onReset: () => void;
}

const STEPS = [
  { n: 1, label: 'Welcome' },
  { n: 2, label: 'Lookup' },
  { n: 3, label: 'Problem' },
  { n: 4, label: 'Solution' },
  { n: 5, label: 'Team' },
  { n: 6, label: 'Receipt' },
];

const StepperBar = ({ currentScreen, maxReached, onNavigate, onReset }: StepperBarProps) => {
  return (
    <div className="flex-shrink-0 relative z-50">
      <div className="modern-accent-top w-full" />

      <div className="bg-background border-b border-border flex items-center px-6 h-[42px]">
        {/* Stepper — centred */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {STEPS.map((step, i) => {
            const isPast      = currentScreen > step.n;
            const isCurrent   = currentScreen === step.n;
            const isNavigable = step.n <= maxReached && !isCurrent;

            return (
              <div key={step.n} className="flex items-center">
                <button
                  onClick={() => isNavigable && onNavigate(step.n)}
                  disabled={!isNavigable}
                  data-sound={isNavigable ? 'click' : 'none'}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-150 ${
                    isNavigable
                      ? 'cursor-pointer hover:bg-primary/10 hover:text-primary'
                      : 'cursor-default'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                      isCurrent
                        ? 'bg-primary scale-125 shadow-[0_0_8px_hsl(var(--primary)/0.4)]'
                        : isPast
                        ? 'bg-primary/40'
                        : 'bg-border'
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-wide transition-all duration-300 ${
                      isCurrent
                        ? 'text-primary font-bold'
                        : isPast
                        ? 'text-muted-foreground/60 font-medium'
                        : 'text-muted-foreground/30 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>

                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 transition-colors duration-500 ${isPast ? 'bg-primary/30' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Reset button — right side, visible on screens 2–5 */}
        <button
          onClick={onReset}
          data-sound="click"
          className={`flex items-center gap-1 text-[10px] font-semibold tracking-wide text-muted-foreground/50 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/10 ${
            currentScreen > 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Reset demo"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
};

export default StepperBar;
