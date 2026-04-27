export type LookupType = 'ok' | 'err' | 'warn';

export interface Lookup {
  sys: string;
  type: LookupType;
  text: string;
}

export interface Item {
  name: string;
  icon: string;
  images?: string[];    // optional product images — first is thumbnail, rest shown in gallery
  category: string;
  price: string;        // canonical price (System A/B agree)
  conflictPrice: string; // absurd price from the worst lookup
  description?: string; // realistic product description (ingredients, nutrition, etc.)
  lookups: Lookup[];
}

export const ITEMS: Item[] = [
  {
    name: 'Ontolo-Tea',
    icon: '🫙',
    images: ['ontolo-front.png', 'ontolo-back.png'],
    category: 'Beverage',
    price: '$4.99',
    conflictPrice: 'or $12.50?',
    description: 'Functional cold-brew tea, lightly sparkling. 12 fl oz aluminum can.\nIngredients: Filtered water, organic black tea, organic cane sugar, citric acid, natural cherry flavor, L-theanine.\nNutrition (per can): 60 cal · 14g sugar · 0g fat · 25mg caffeine.',
    lookups: [
      { sys: 'System A — By Name', type: 'ok', text: '"Beverage, Cold, Canned"\nCategory: RTD > Tea > Functional' },
      { sys: 'System B — By Category', type: 'ok', text: '"Beverages > Canned > Ambient"\nRefrigerated or shelf-stable?\nSystem B is not sure.' },
      { sys: 'System C — By SKU', type: 'err', text: 'ITEM NOT FOUND.\nDid you mean: "Onto-Tea"?\nOr: "Onto-T" (apparel, size S)?' },
      { sys: 'System D — By Vendor Code', type: 'warn', text: '"Classified as Produce."\nLocation: Aisle F, next to the apples.' },
    ],
  },
  {
    name: "Alpha Bytes Cereal",
    icon: '🥣',
    images: ['Cherre-Os.png', 'cherre-os-back.png'],
    category: 'Cereal box',
    price: '$5.49',
    conflictPrice: 'or $3.99?',
    description: 'Crunchy whole-grain alphabet-shaped cereal. 12 oz box.\nIngredients: Whole grain oats, corn flour, sugar, corn starch, salt, vitamin E (mixed tocopherols).\nNutrition (1 cup / 32g): 120 cal · 24g carbs · 9g sugar · 3g fiber · 3g protein.',
    lookups: [
      { sys: 'System A — By Name', type: 'ok', text: '"Breakfast, Grain-Based, Fortified"\nServing size: 1 cup (32g)' },
      { sys: 'System B — By Category', type: 'ok', text: '"Cereal > Kids"\nShelf life: 18 months' },
      { sys: 'System C — By SKU', type: 'warn', text: '"Snack Food, Savory"\nNOTE: Classified as chips.\n(It sounds like "bytes." So... chips?)' },
      { sys: 'System D — By Vendor Code', type: 'err', text: 'DATA NOT FOUND.\nRecord last updated: February 2003.\nPlease contact your administrator.' },
    ],
  },
  {
    name: 'Fresh Cherries',
    icon: '🍒',
    images: ['cherries-front.png', 'cherries-back.png'],
    category: 'Produce',
    price: '$6.99',
    conflictPrice: 'or $120,000/yr',
    description: 'Fresh dark-sweet cherries. 1 lb clamshell.\nVariety: Bing.\nOrigin: Pacific Northwest, USA.\nNutrition (1 cup / 140g): 95 cal · 25g carbs · 19g sugar · 3g fiber · 2g protein.\nKeep refrigerated. Rinse before serving. Best within 5–7 days of purchase.',
    lookups: [
      { sys: 'System A — By Name', type: 'ok', text: '"Fruit, Stone, Fresh"\nOrigin: Pacific Northwest' },
      { sys: 'System B — By Category', type: 'ok', text: '"Produce"\nSeasonal. Price fluctuates.' },
      { sys: 'System C — By SKU', type: 'warn', text: 'Returns 3 results.\nAll vendors named "Cherre."\nAll different prices.\nAll listed as different items.' },
      { sys: 'System D — By Vendor Code', type: 'err', text: '"Software. Enterprise License.\nAnnual Subscription."\n$120,000/yr. Renews automatically.' },
    ],
  },
  {
    name: 'Bag of Flour',
    icon: '🌾',
    images: ['flour-front.png', 'flour-back.png'],
    category: 'Baking & Pantry',
    price: '$4.29',
    conflictPrice: 'or $0.42?',
    description: 'All-purpose enriched wheat flour. 5 lb paper sack.\nIngredients: Enriched wheat flour (niacin, reduced iron, thiamin mononitrate, riboflavin, folic acid), malted barley flour.\nNutrition (1/4 cup / 30g): 100 cal · 22g carbs · 0g sugar · 1g fiber · 3g protein · 0g fat.\nStore in a cool, dry place. Best within 8 months of opening.',
    lookups: [
      { sys: 'System A — By Name', type: 'ok', text: '"Baking, Dry Goods, Milled Grain"\nUnit: 5 lb paper sack' },
      { sys: 'System B — By Category', type: 'warn', text: '"Powder, White, Bulk"\nMatched 14 records.\nIncludes: sugar, salt, drywall compound.' },
      { sys: 'System C — By SKU', type: 'err', text: 'WEIGHT MISMATCH.\nExpected: 5 lb.\nReceived: 5 lb (per scale).\nDiscrepancy unresolved.' },
      { sys: 'System D — By Vendor Code', type: 'ok', text: '"Wheat Flour, All-Purpose, Enriched"\nMill code: WF-002\nLot stable.' },
    ],
  },
  {
    name: 'Sardines',
    icon: '🐟',
    images: ['sardines-front.png', 'sardines-back.png'],
    category: 'Canned Seafood',
    price: '$2.79',
    conflictPrice: 'or $14.00?',
    description: 'Wild-caught sardines in extra-virgin olive oil. 3.75 oz tin.\nIngredients: Sardines, extra-virgin olive oil, sea salt.\nNutrition (1 tin drained / ~85g): 190 cal · 0g carbs · 12g fat · 22g protein · 350mg sodium · 350mg calcium.\nOrigin: Portugal. Easy-open pull tab. Best by date printed on bottom.',
    lookups: [
      { sys: 'System A — By Name', type: 'ok', text: '"Fish, Small, Preserved in Oil"\nNet weight: 3.75 oz' },
      { sys: 'System B — By Category', type: 'warn', text: '"Pet Food > Cat > Wet"\nNOTE: Cats love it.\nHumans also eat it. Confusing.' },
      { sys: 'System C — By SKU', type: 'ok', text: '"Canned Sardines in Olive Oil"\nOrigin: Portugal\nBest by: 2029-04' },
      { sys: 'System D — By Vendor Code', type: 'err', text: 'BARCODE MISREAD.\nReturned: "Yacht, 42ft, Used."\nMSRP: $14,000.\nPlease rescan.' },
    ],
  },
  {
    name: 'Cherre Cola',
    icon: '🥤',
    images: ['cherre-cola-front.png', 'cherre-cola-back.png'],
    category: 'Beverage',
    price: '$1.99',
    conflictPrice: 'or $0.05 deposit?',
    description: 'Cherry-flavored cola in a 12 fl oz glass bottle.\nIngredients: Carbonated water, cane sugar, caramel color, natural cherry flavor, phosphoric acid, caffeine.\nNutrition (per bottle): 150 cal · 39g sugar · 0g fat · 35mg caffeine · 30mg sodium.\nServe chilled. $0.05 bottle deposit — return at any kiosk.',
    lookups: [
      { sys: 'System A — By Name', type: 'warn', text: '"Soft Drink, Carbonated, Cherry"\nDid you mean: "Cherre O\'s"?\nDid you mean: "Cherries"?' },
      { sys: 'System B — By Category', type: 'ok', text: '"Beverages > Soda > Cola"\n12 fl oz glass bottle' },
      { sys: 'System C — By SKU', type: 'err', text: 'TRADEMARK CONFLICT.\nName too similar to: "Cherre" (vendor).\nLegal hold: 1998–present.' },
      { sys: 'System D — By Vendor Code', type: 'ok', text: '"Bottled Cola, Cherry Flavor"\nDeposit: $0.05/bottle\nReturn at any kiosk.' },
    ],
  },
];

export const LOOKUP_METHODS = ['By Name', 'By Category', 'By SKU', 'By Vendor'];

export const LOADING_MESSAGES = [
  'Connecting to system…',
  'Fetching record…',
  'Normalizing schema…',
  'Almost there…',
];

export const TOTAL_VALUES = [
  ['$94.17', 'Or $47.83.'],
  ['$112.50', 'Or $38.99.'],
  ['$83.40', 'Or $61.22.'],
  ['$178.30', 'Or $52.14.'],
];
