import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { UiStateService } from '../../core/services/ui-state.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

/** Cierre: eslogan muy grande + llamada a cotizar. */
@Component({
  selector: 'app-contacto',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="contacto"
      class="overflow-hidden bg-palta py-28 text-niebla md:py-44"
      aria-labelledby="contacto-title"
      *transloco="let t; prefix: 'contacto'"
    >
      <div class="container-page flex flex-col items-center text-center">
        <h2
          id="contacto-title"
          class="slogan max-w-[16ch] text-[clamp(3rem,8.5vw,8.75rem)] leading-[0.95] font-bold"
        >
          {{ t('slogan') }}
        </h2>
        <p class="measure mt-8 max-w-[48ch] text-lg text-niebla/80">{{ t('text') }}</p>
        <button type="button" class="btn-primary mt-10 !px-8 text-lg" (click)="ui.openQuote()">
          {{ t('cta') }}
        </button>
      </div>
    </section>
  `,
})
export class ContactoComponent {
  protected readonly ui = inject(UiStateService);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const scroll = inject(SmoothScrollService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      if (scroll.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          // El eslogan se "acerca" ligeramente mientras entra: cierre con peso, sin repetir el fade-up
          gsap.fromTo(
            '.slogan',
            { scale: 0.86, opacity: 0.3 },
            {
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: { trigger: host, start: 'top 85%', end: 'top 30%', scrub: 0.5 },
            },
          );
        }, host);
      });
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
