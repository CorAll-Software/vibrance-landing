import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
} from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { UiStateService } from '../../core/services/ui-state.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { CONTACT } from '../../core/config/brand';
import {
  WhatsappIconComponent,
  injectWhatsappHref,
} from '../../shared/components/whatsapp-button/whatsapp-button';

/**
 * Cierre: eslogan muy grande + llamada a cotizar, y debajo el correo y WhatsApp
 * (sin números escritos, pedido de la clienta).
 */
@Component({
  selector: 'app-contacto',
  imports: [TranslocoDirective, TranslocoPipe, WhatsappIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="contacto"
      class="overflow-hidden bg-palta pt-28 pb-28 text-niebla md:pt-40 md:pb-44"
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
        <p data-reveal class="measure mt-8 max-w-[48ch] text-lg text-niebla/80">{{ t('text') }}</p>
        <button
          data-reveal
          type="button"
          class="btn-primary mt-10 !px-8 text-lg"
          (click)="ui.openQuote()"
        >
          {{ t('cta') }}
        </button>
        <div
          data-reveal
          class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-niebla/80"
        >
          <p class="text-start">
            <span class="block text-sm text-niebla/60">{{ 'common.buyers' | transloco }}</span>
            <a [href]="'mailto:' + email" class="hover:text-niebla hover:underline"
              ><bdi dir="ltr">{{ email }}</bdi></a
            >
          </p>
          <p class="text-start">
            <span class="block text-sm text-niebla/60">{{ 'common.partners' | transloco }}</span>
            <a [href]="'mailto:' + partnersEmail" class="hover:text-niebla hover:underline"
              ><bdi dir="ltr">{{ partnersEmail }}</bdi></a
            >
          </p>
          <a
            [href]="whatsappHref()"
            target="_blank"
            rel="noopener"
            [attr.aria-label]="'common.whatsapp' | transloco"
            class="grid size-12 place-items-center rounded-full border border-niebla/30 text-niebla transition-colors hover:bg-niebla hover:text-palta"
          >
            <app-whatsapp-icon class="size-6" />
          </a>
        </div>
      </div>
    </section>
  `,
})
export class ContactoComponent {
  protected readonly ui = inject(UiStateService);
  protected readonly email = CONTACT.email;
  protected readonly partnersEmail = CONTACT.partnersEmail;
  protected readonly whatsappHref = injectWhatsappHref();

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
