import { PRODUCTOS } from '../core/config/media.config';

/**
 * Catálogo de productos: arándano, palta, uva, mango, mandarina y kion
 * (los 5 de la 1.ª reunión + mango, confirmado después).
 * El kion no es una fruta: en los textos se habla de "frutas y kion" / "fresh produce".
 * TODO: dato real de la clienta — variedades, calibres, empaques y meses de disponibilidad
 * son de ejemplo. Los textos visibles viven en public/i18n/{es,en}.json bajo `productos.items.<id>`.
 */
export type ProductId = 'arandano' | 'palta' | 'uva' | 'mango' | 'mandarina' | 'kion';

export interface Product {
  id: ProductId;
  image: string;
  /** true: se muestra el recuadro "Foto aquí" en lugar de la imagen. */
  placeholder?: boolean;
  /** Imagen (y video opcional, hoy sin uso en el catálogo): se editan en core/config/media.config.ts */
  video?: { webm?: string; mp4?: string };
  /** Meses de disponibilidad para exportar: 1 = enero … 12 = diciembre. */
  months: number[];
  /** Calibres (se muestran tal cual, no se traducen). */
  sizes: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'arandano',
    ...PRODUCTOS.arandano,
    months: [8, 9, 10, 11, 12, 1], // TODO: dato real de la clienta
    sizes: ['Jumbo (+18 mm)', 'Large (16–18 mm)', 'Standard (12–16 mm)'],
  },
  {
    id: 'palta',
    ...PRODUCTOS.palta,
    months: [3, 4, 5, 6, 7, 8, 9], // TODO: dato real de la clienta
    sizes: ['12', '14', '16', '18', '20', '22'],
  },
  {
    id: 'uva',
    ...PRODUCTOS.uva,
    months: [11, 12, 1, 2, 3, 4], // TODO: dato real de la clienta
    sizes: ['L (18–20 mm)', 'XL (20–22 mm)', 'XXL (+22 mm)'],
  },
  {
    id: 'mango',
    ...PRODUCTOS.mango,
    months: [11, 12, 1, 2, 3], // TODO: dato real de la clienta
    sizes: ['6', '7', '8', '9', '10', '12'],
  },
  {
    id: 'mandarina',
    ...PRODUCTOS.mandarina,
    months: [3, 4, 5, 6, 7, 8, 9, 10], // TODO: dato real de la clienta
    sizes: ['1XX', '1X', '1', '2', '3'],
  },
  {
    id: 'kion',
    ...PRODUCTOS.kion,
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // TODO: dato real de la clienta
    sizes: ['150–250 g', '250–350 g', '+350 g'],
  },
];

/** Meses del año con al menos un producto disponible (para la sección Datos). */
export const MONTHS_WITH_SUPPLY = new Set(PRODUCTS.flatMap((p) => p.months)).size;
