import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoDirective, translateSignal } from '@jsverse/transloco';
import { CONTACT } from '../../../core/config/brand';
import { UiStateService } from '../../../core/services/ui-state.service';

/**
 * Botón flotante de WhatsApp (abajo, al final de la línea: a la derecha, o a la izquierda en
 * árabe/hebreo). Abre el chat con un mensaje inicial en el idioma activo.
 * El número se cambia en core/config/brand.ts → CONTACT.whatsapp.
 */
@Component({
  selector: 'app-whatsapp-button',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ui.introDone()) {
      <a
        *transloco="let t; prefix: 'common'"
        [href]="href()"
        target="_blank"
        rel="noopener"
        class="wa fixed end-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgb(20_42_32/0.28)] transition-transform duration-200 hover:scale-105 focus-visible:scale-105 md:end-8 md:bottom-8"
        [attr.aria-label]="t('whatsapp')"
        [title]="t('whatsapp')"
      >
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <path
            d="M12 2.6a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.7-1.2A9.4 9.4 0 1 0 12 2.6z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <path
            fill="currentColor"
            d="M8.6 7.3c.2-.4.5-.5.8-.5h.6c.2 0 .4.1.5.4l.8 1.9c.1.2 0 .5-.1.7l-.5.6c-.1.2-.2.4 0 .6.7 1.1 1.6 2 2.7 2.6.2.1.4.1.6-.1l.6-.7c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.6v.5c0 .4-.2.8-.6 1-.6.3-1.2.4-1.9.3-3.2-.6-5.9-3.3-6.4-6.5 0-.6.1-1.1.4-1.5z"
          />
        </svg>
      </a>
    }
  `,
  styles: `
    .wa {
      animation: wa-in 500ms var(--ease-out-soft) both;
    }
    @keyframes wa-in {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.9);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .wa {
        animation: none;
      }
    }
  `,
})
export class WhatsappButtonComponent {
  protected readonly ui = inject(UiStateService);
  private readonly message = translateSignal('common.whatsappMessage');
  protected readonly href = computed(
    () =>
      `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(this.message())}`,
  );
}
