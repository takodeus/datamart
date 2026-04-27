import { ITEMS } from '@/lib/kiosk-data';

interface ReceiptScreenProps {
  onRestart: () => void;
  itemsWithQuery: Set<number>;
  queriedMethods: Set<number>[];
}

const ReceiptScreen = ({ onRestart, itemsWithQuery, queriedMethods }: ReceiptScreenProps) => {
  const totalMethods = queriedMethods.reduce((sum, s) => sum + s.size, 0);

  return (
    <div className="flex flex-col justify-start items-center py-4 px-8 bg-card overflow-y-auto" style={{ position: 'absolute', inset: 0 }}>
      <div className="receipt bg-background w-full max-w-[400px] rounded-2xl px-8 py-6 font-mono text-foreground relative border border-border shadow-lg mt-2">
        <div className="text-center mb-5">
          <div className="text-base font-bold tracking-wide mb-1 text-primary">CHERRE DATA MART</div>
          <div className="text-[9px] text-muted-foreground tracking-wide">Self-Checkout Terminal</div>
        </div>

        <div className="w-full h-px bg-border my-3" />

        <div className="flex justify-between text-[9px] text-muted-foreground tracking-wide uppercase mb-2">
          <span>Item</span>
          <span>Result</span>
        </div>
        <div className="w-full h-px bg-border my-2.5" />

        {ITEMS.map((item, i) => {
          const wasQueried = itemsWithQuery.has(i);
          if (!wasQueried) return null;
          const methodCount = queriedMethods[i]?.size ?? 0;
          return (
            <div key={item.name} className="flex justify-between items-start text-xs py-1.5 border-b border-border/50 gap-2">
              <span className="font-normal flex items-center gap-1.5 text-foreground/70">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </span>
              <div className="text-right">
                <div className="text-success font-bold">Resolved</div>
                <div className="text-[9px] text-muted-foreground/50 mt-0.5">{methodCount} system{methodCount !== 1 ? 's' : ''} queried</div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between items-start text-xs py-1.5 gap-2">
          <span className="text-foreground/50 font-normal">Mystery Item</span>
          <div className="text-right">
            <div className="text-[10px] text-foreground/55 leading-snug">Classification Pending.</div>
            <div className="text-[9px] text-foreground/45 leading-snug mt-0.5">Check back at<br />Realcomm 2026.</div>
          </div>
        </div>

        <div className="w-full h-px bg-border my-2.5" />

        <div className="flex justify-between items-center py-2.5 text-sm">
          <span className="font-bold tracking-wide">TOTAL</span>
          <span className="text-primary font-bold text-base">TRUSTED</span>
        </div>
        <div className="text-[9px] text-muted-foreground/40 text-right mt-0.5">
          {totalMethods} lookup{totalMethods !== 1 ? 's' : ''} run. No reconciliation needed.
        </div>

        <div className="w-full h-px bg-border mt-5" />

        <div className="text-center mt-5">
          <div className="text-[11px] text-muted-foreground/50 italic mb-1">StayCurious.</div>
          <div className="text-[10px] text-primary tracking-wide font-bold">cherre.com</div>
        </div>
      </div>

      <div className="flex gap-3 mt-4 mb-4 justify-center">
        <button
          onClick={onRestart}
          data-sound="click"
          className="bg-background border border-border text-muted-foreground rounded-xl px-7 py-3 font-sans text-[11px] font-semibold tracking-wide uppercase cursor-pointer transition-all hover:border-primary hover:text-foreground hover:shadow-sm"
        >
          Start over
        </button>

      </div>
    </div>
  );
};

export default ReceiptScreen;
