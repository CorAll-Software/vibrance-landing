import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CERTIFICATIONS, STATS } from '../../data/cifras.data';
import { CounterComponent } from '../../shared/components/counter/counter';
import { MapWorldComponent } from '../../shared/components/map-world/map-world';
import { LanguageService } from '../../core/services/language.service';
import { AccessTableComponent } from '../../shared/components/access-table/access-table';

/** Datos: cifras de la oferta, mapa de mercados, tabla de acceso por producto y certificaciones. */
@Component({
  selector: 'app-datos',
  imports: [TranslocoDirective, CounterComponent, MapWorldComponent, AccessTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './datos.html',
  styles: `
    .marquee {
      mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
    }
    .marquee__track {
      animation: marquee 36s linear infinite;
    }
    .marquee:hover .marquee__track,
    .marquee:focus-within .marquee__track {
      animation-play-state: paused;
    }
    @keyframes marquee {
      to {
        transform: translateX(calc(-50% - 0.5rem));
      }
    }
    /* Movimiento reducido: tarjetas fijas en varias filas */
    @media (prefers-reduced-motion: reduce) {
      .marquee {
        mask-image: none;
        padding-inline: 1rem;
      }
      .marquee__track {
        animation: none;
        flex-wrap: wrap;
        justify-content: center;
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
  protected readonly lang = inject(LanguageService);
}
