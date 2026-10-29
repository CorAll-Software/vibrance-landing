import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UiStateService } from '../../../core/services/ui-state.service';
import { LanguageService } from '../../../core/services/language.service';
import { PRIVACY } from '../../../data/privacy.data';
import { ModalComponent } from '../modal/modal';

/** Política de privacidad en un modal (la web es de una sola página, sin rutas). */
@Component({
  selector: 'app-privacy-modal',
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [open]="ui.privacyOpen()" labelledBy="privacy-title" (closed)="ui.closePrivacy()">
      <article class="p-6 sm:p-10" [attr.lang]="lang()">
        <h2 id="privacy-title" class="pr-12 text-3xl font-semibold sm:text-4xl">
          {{ policy().title }}
        </h2>
        <p class="mt-2 text-sm text-palta/60">{{ policy().updated }}</p>
        <ol class="mt-6 flex flex-col gap-4 text-palta/85">
          @for (s of policy().sections; track $index) {
            <li>
              <p>
                <strong class="font-semibold text-palta">{{ $index + 1 }}. {{ s.title }}.</strong>
                {{ s.text }}
              </p>
            </li>
          }
        </ol>
        <p class="mt-6 text-sm text-palta/70">{{ policy().legal }}</p>
      </article>
    </app-modal>
  `,
})
export class PrivacyModalComponent {
  protected readonly ui = inject(UiStateService);
  private readonly language = inject(LanguageService);

  /** Español para quien navega en español; el resto lee la versión en inglés. */
  protected readonly lang = computed(() => (this.language.current() === 'es' ? 'es' : 'en'));
  protected readonly policy = computed(() => PRIVACY[this.lang()]);
}
