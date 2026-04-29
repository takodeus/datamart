import cherreOsImg from '@/assets/Cherre-Os.png';
import cherreOsBackImg from '@/assets/cherre-os-back.png';
import ontoloFrontImg from '@/assets/ontolo-front.png';
import ontoloBackImg from '@/assets/ontolo-back.png';
import cherriesFrontImg from '@/assets/cherries-front.png';
import cherriesBackImg from '@/assets/cherries-back.png';
import flourFrontImg from '@/assets/flour-front.png';
import flourBackImg from '@/assets/flour-back.png';
import sardinesFrontImg from '@/assets/sardines-front.png';
import sardinesBackImg from '@/assets/sardines-back.png';
import cherreColaFrontImg from '@/assets/cherre-cola-front.png';
import cherreColaBackImg from '@/assets/cherre-cola-back.png';

// Map image filenames (as stored in kiosk-data) to their imported URLs.
export const ITEM_IMAGES: Record<string, string> = {
  'Cherre-Os.png': cherreOsImg,
  'cherre-os-back.png': cherreOsBackImg,
  'ontolo-front.png': ontoloFrontImg,
  'ontolo-back.png': ontoloBackImg,
  'cherries-front.png': cherriesFrontImg,
  'cherries-back.png': cherriesBackImg,
  'flour-front.png': flourFrontImg,
  'flour-back.png': flourBackImg,
  'sardines-front.png': sardinesFrontImg,
  'sardines-back.png': sardinesBackImg,
  'cherre-cola-front.png': cherreColaFrontImg,
  'cherre-cola-back.png': cherreColaBackImg,
};

export const resolveItemImages = (filenames?: string[]): string[] =>
  (filenames ?? []).map(fn => ITEM_IMAGES[fn]).filter(Boolean);
