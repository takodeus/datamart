import { ITEMS, LOOKUP_METHODS } from '@/lib/kiosk-data';
import cherreOsImg from '@/assets/Cherre-Os.png';
import ontoloPrimaryImg from '@/assets/ontolo-front.png';
import ontoloCan1Img from '@/assets/ontolo-back.png';
import ontoloCans2Img from '@/assets/ontolo-cans.png';

const ITEM_IMAGES: Record<string, string> = {
  'Cherre-Os.png': cherreOsImg,
  'ontolo-front.png': ontoloPrimaryImg,
  'ontolo-back.png': ontoloCan1Img,
  'ontolo-cans.png': ontoloCans2Img,
};

interface CartSidebarProps {
  itemsWithQuery: Set<number>;
  queriedMethods: Set<number>[];
  currentScreen: number;
  quantities: Record<number, number>;
  onChangeQuantity: (itemIdx: number, delta: number) => void;
  onRemoveItem: (itemIdx: number) => void;
}

const CartSidebar = ({ itemsWithQuery, queriedMethods, currentScreen, quantities, onChangeQuantity, onRemoveItem }: CartSidebarProps) => {
  if (currentScreen < 2 || currentScreen > 3) return null;
  // Cart is read-only on the Problem slide — only allow edits during Lookup.
  const editable = currentScreen === 2;

  const scannedItems = ITEMS.filter((_, i) => itemsWithQuery.has(i));
  const totalMethods = queriedMethods.reduce((sum, s) => sum + s.size, 0);

  // Multiply unit price by quantity for line-item display.
  const lineTotal = (price: string, qty: number): string => {
    const match = price.match(/([^\d.,-]*)([\d,]+(?:\.\d+)?)/);
    if (!match) return price;
    const prefix = match[1] ?? '';
    const num = parseFloat(match[2].replace(/,/g, ''));
    if (!Number.isFinite(num)) return price;
    return `${prefix}${(num * qty).toFixed(2)}`;
  };

  return (
    <div className="w-[200px] flex-shrink-0 border-l border-border bg-card flex flex-col h-full">
      {/* Cart header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm">🛒</span>
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
            Cart
          </span>
          {scannedItems.length > 0 && (
            <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {scannedItems.length}
            </span>
          )}
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {scannedItems.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-2xl mb-2 opacity-30">🛒</div>
            <div className="text-[11px] text-muted-foreground/50">
              Scan items to add<br />them to your cart
            </div>
          </div>
        ) : (
          <div className="py-2">
            {scannedItems.map((item) => {
              const itemIdx = ITEMS.indexOf(item);
              const qty = quantities[itemIdx] ?? 1;
              return (
                <div
                  key={item.name}
                  className="px-3 py-2.5 border-b border-border/40 animate-fade-in-up"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-9 h-7 rounded-md bg-background border border-border flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
                      {item.images?.[0] && ITEM_IMAGES[item.images[0]]
                        ? <img src={ITEM_IMAGES[item.images[0]]} alt={item.name} className="w-full h-full object-contain p-0.5" />
                        : item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-foreground truncate">{item.name}</div>
                      <div className="text-[9px] text-muted-foreground">
                        {qty > 1 ? (
                          <>
                            <span className="tabular-nums font-semibold text-foreground">{lineTotal(item.price, qty)}</span>
                            <span className="opacity-60"> ({item.price} × {qty})</span>
                          </>
                        ) : (
                          item.price
                        )}
                      </div>
                    </div>
                    {/* Delete button */}
                    {editable && (
                      <button
                        onClick={() => onRemoveItem(itemIdx)}
                        data-sound="click"
                        className="text-[10px] text-muted-foreground/40 hover:text-primary transition-colors flex-shrink-0 mt-0.5"
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-1.5 ml-11">
                    <div className="flex items-center gap-1">
                      {editable ? (
                        <>
                          <button
                            onClick={() => onChangeQuantity(itemIdx, -1)}
                            disabled={qty <= 1}
                            data-sound="click"
                            className="w-5 h-5 rounded border border-border bg-background text-[10px] font-bold text-foreground flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-background disabled:hover:text-foreground disabled:hover:border-border transition-colors"
                          >
                            −
                          </button>
                          <span className="text-[11px] font-bold text-foreground w-5 text-center tabular-nums">{qty}</span>
                          <button
                            onClick={() => onChangeQuantity(itemIdx, 1)}
                            data-sound="click"
                            className="w-5 h-5 rounded border border-border bg-background text-[10px] font-bold text-foreground flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                          Qty: <span className="text-foreground">{qty}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {LOOKUP_METHODS.map((_, mi) => (
                        <div
                          key={mi}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            queriedMethods[itemIdx]?.has(mi) ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart footer */}
      {scannedItems.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold tracking-wide uppercase text-muted-foreground">Lookups</span>
            <span className="text-[11px] font-bold text-foreground tabular-nums">{totalMethods}</span>
          </div>
          <div className="w-full bg-border rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(totalMethods / (ITEMS.length * LOOKUP_METHODS.length)) * 100}%` }}
            />
          </div>
          <div className="text-[8px] text-muted-foreground/50 mt-1 text-right">
            {totalMethods} / {ITEMS.length * LOOKUP_METHODS.length} systems queried
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;
