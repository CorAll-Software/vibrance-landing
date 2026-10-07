/**
 * Catálogo de productos.
 * TODO: dato real de la clienta — frutas, variedades, calibres, empaques y meses
 * de cosecha son de ejemplo. Los textos visibles viven en public/i18n/{es,en}.json
 * bajo `productos.items.<id>`.
 */
export type ProductId = 'palta' | 'arandano' | 'mango' | 'uva';

export interface Product {
  id: ProductId;
  image: string;
  /** Loop corto opcional que se reproduce al pasar el mouse (webm/mp4). */
  video?: { webm?: string; mp4?: string };
  /** Meses de cosecha/disponibilidad: 1 = enero … 12 = diciembre. */
  months: number[];
  /** Calibres (se muestran tal cual, no se traducen). */
  sizes: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'palta',
    image: 'media/producto-palta.webp',
    // video: { webm: 'media/producto-palta.webm', mp4: 'media/producto-palta.mp4' },
    months: [3, 4, 5, 6, 7, 8, 9], // TODO: dato real de la clienta
    sizes: ['12', '14', '16', '18', '20', '22'],
  },
  {
    id: 'arandano',
    image: 'media/producto-arandano.webp',
    months: [8, 9, 10, 11, 12, 1], // TODO: dato real de la clienta
    sizes: ['Jumbo (+18 mm)', 'Large (16–18 mm)', 'Standard (12–16 mm)'],
  },
  {
    id: 'mango',
    image: 'media/producto-mango.webp',
    months: [11, 12, 1, 2, 3], // TODO: dato real de la clienta
    sizes: ['6', '7', '8', '9', '10', '12'],
  },
  {
    id: 'uva',
    image: 'media/producto-uva.webp',
    months: [11, 12, 1, 2, 3, 4], // TODO: dato real de la clienta
    sizes: ['L (18–20 mm)', 'XL (20–22 mm)', 'XXL (+22 mm)'],
  },
];
