import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { UiStateService } from '../../core/services/ui-state.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { BRAND_NAME } from '../../core/config/brand';

const SESSION_KEY = 'intro-seen';

/**
 * Loader de entrada (≤ 1.5 s): una palta que se dibuja en SVG.
 * Solo en la primera carga de la sesión; con movimiento reducido no se muestra.
 */
@Component({
  selector: 'app-loader',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="loader fixed inset-0 z-[100] grid place-items-center bg-palta text-niebla"
        role="status"
        [attr.aria-label]="'common.loading' | transloco"
      >
        <div class="flex flex-col items-center gap-5">
          <svg viewBox="0 0 80 100" width="88" height="110" aria-hidden="true">
            <path
              class="draw"
              d="M40 6c-13 0-18 15-20 30-2 13-12 20-12 36 0 15 13 24 32 24s32-9 32-24c0-16-10-23-12-36C58 21 53 6 40 6z"
              fill="none"
              stroke="#F7F8F5"
              stroke-width="3"
              stroke-linejoin="round"
              pathLength="1"
            />
            <circle class="seed" cx="40" cy="66" r="12" fill="#D8C49B" />
          </svg>
          <span class="brand font-display text-2xl font-semibold tracking-tight">{{ brand }}</span>
        </div>
      </div>
    }
  `,
})
export class LoaderComponent {
  protected readonly brand = BRAND_NAME;
  protected readonly visible = signal(false);

  constructor() {
    const ui = inject(UiStateService);
    const scroll = inject(SmoothScrollService);
    const zone = inject(NgZone);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* almacenamiento no disponible */
    }

    if (seen || scroll.reducedMotion()) {
      ui.introDone.set(true);
      return;
    }

    this.visible.set(true);
    afterNextRender(() => {
      scroll.stop();
      zone.runOutsideAngular(() => {
        gsap.context(
          () =>
            gsap
              .timeline({
                onComplete: () => {
                  this.visible.set(false);
                  scroll.start();
                  ui.introDone.set(true);
                },
              })
              .fromTo(
                '.draw',
                { strokeDasharray: '0 1' },
                { strokeDasharray: '1 0', duration: 0.75, ease: 'power2.inOut' },
              )
              .from(
                '.seed',
                { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(2.5)' },
                '-=0.15',
              )
              .from('.brand', { opacity: 0, y: 8, duration: 0.3 }, '<')
              .to(
                host.querySelector('.loader'),
                { yPercent: -100, duration: 0.45, ease: 'power3.inOut' },
                '+=0.1',
              ),
          host,
        );
      });
    });
  }
}
