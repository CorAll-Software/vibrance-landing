import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '../../core/services/language.service';

/** Selector ES / EN (cambio en tiempo real, sin recargar). */
@Component({
  selector: 'app-lang-switch',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center rounded-full border border-current/30 p-0.5 text-sm font-semibold"
      role="group"
      [attr.aria-label]="'footer.language' | transloco"
    >
      @for (l of lang.langs; track l) {
        <button
          type="button"
          class="min-h-9 min-w-11 rounded-full px-2.5 uppercase transition-colors duration-200"
          [class]="lang.current() === l ? 'bg-current/15' : 'opacity-70 hover:opacity-100'"
          [attr.aria-pressed]="lang.current() === l"
          [attr.lang]="l"
          (click)="lang.set(l)"
        >
          {{ l }}
        </button>
      }
    </div>
  `,
})
export class LangSwitchComponent {
  protected readonly lang = inject(LanguageService);
}
