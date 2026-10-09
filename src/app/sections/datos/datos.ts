import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { CERTIFICATIONS, STATS } from '../../data/cifras.data';
import { SHOW_PLACEHOLDER_NOTES } from '../../core/config/brand';
import { CounterComponent } from '../../shared/components/counter/counter';
import { MapWorldComponent } from '../../shared/components/map-world/map-world';
import { AccessTableComponent } from '../../shared/components/access-table/access-table';

/** Datos: cifras de la oferta, mapa de mercados, tabla de acceso por producto y certificaciones. */
@Component({
  selector: 'app-datos',
  imports: [
    TranslocoDirective,
    TranslocoPipe,
    CounterComponent,
    MapWorldComponent,
    AccessTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './datos.html',
  styles: `
    .marquee {
      mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
    }
    .marquee__track {
      animation: marquee 40s linear infinite;
    }
    .marquee:hover .marquee__track,
    .marquee:focus-within .marquee__track {
      animation-play-state: paused;
    }
    @keyframes marquee {
      to {
        transform: translateX(-50%);
      }
    }
    /* Movimiento reducido: logos estáticos en varias filas */
    @media (prefers-reduced-motion: reduce) {
      .marquee {
        mask-image: none;
      }
      .marquee__track {
        animation: none;
        flex-wrap: wrap;
        width: auto;
      }
      .marquee__dup {
        display: none;
      }
    }
  `,
})
export class DatosComponent {
  protected readonly stats = STATS;
  protected readonly certifications = CERTIFICATIONS;
  protected readonly showNote = SHOW_PLACEHOLDER_NOTES;
}
