import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { gsap } from 'gsap';
import type { ProductId } from '../../../data/productos.data';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';
import { FruitIconComponent } from '../fruit-icon/fruit-icon';
import { BASKET, BRAID, FRUIT_SIZE, SLOTS, STAKES, WEAVE } from './basket-art';

/**
 * Cesta de mimbre Vibrance con lugar para las 6 frutas.
 * - `managed`: la sección padre decide cuándo aparece cada fruta (llega volando del mapa).
 * - Si no: las frutas caen solas en la cesta con el scroll (móvil).
 * Con "reducir movimiento", la cesta se muestra llena.
 */
@Component({
  selector: 'app-basket',
  imports: [FruitIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  templateUrl: './basket.html',
  styles: `
    :host {
      display: block;
      position: relative;
      aspect-ratio: 1;
    }
    .basket-fruit {
      width: var(--fruit-size);
      aspect-ratio: 1;
      translate: -50% -50%;
      filter: drop-shadow(0 3px 3px rgb(20 42 32 / 0.25));
    }
    .basket-fruit ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
    .label {
      font-family: var(--font-brand, inherit);
      font-size: 15px;
      font-weight: 600;
      fill: #1e3b2f;
    }
  `,
})
export class BasketComponent {
  readonly managed = input(false);

  protected readonly basket = BASKET;
  protected readonly weave = WEAVE;
  protected readonly stakes = STAKES;
  protected readonly braid = BRAID;
  protected readonly fruitSize = `${FRUIT_SIZE}%`;
  protected readonly fruits = SLOTS.map((s) => ({ ...s, left: s.x / 2, top: s.y / 2 }));

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const zone = inject(NgZone);
    const scroll = inject(SmoothScrollService);
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (this.managed() || scroll.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          // Móvil: las frutas caen una por una mientras la cesta cruza la pantalla
          gsap.fromTo(
            '.basket-fruit',
            { autoAlpha: 0, y: -140 },
            {
              autoAlpha: 1,
              y: 0,
              ease: 'bounce.out',
              stagger: 0.15,
              scrollTrigger: {
                trigger: this.host,
                start: 'top 85%',
                end: 'bottom 55%',
                scrub: 0.8,
              },
            },
          );
        }, this.host);
      });
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }

  /** Estado inicial de la escena fija: cesta vacía. */
  prepare(): void {
    gsap.set(this.host.querySelectorAll('.basket-fruit'), { autoAlpha: 0 });
  }

  /** Fruta dentro de la cesta (destino del vuelo). */
  fruitEl(id: ProductId): HTMLElement {
    return this.host.querySelector<HTMLElement>(`.basket-fruit[data-id="${id}"]`)!;
  }
}
