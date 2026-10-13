import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '../../core/services/language.service';
import { Lang, LANG_META } from '../../core/config/brand';

/**
 * Selector de idioma desplegable (8 idiomas, cambio en tiempo real sin recargar).
 * Accesible: Esc cierra, flechas arriba/abajo recorren la lista, clic fuera cierra,
 * el foco vuelve al botón al elegir.
 */
@Component({
  selector: 'app-lang-switch',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-block',
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'close(true)',
  },
  template: `
    <button
      #trigger
      type="button"
      class="flex min-h-10 items-center gap-1.5 rounded-full border border-current/30 px-3 text-sm font-semibold transition-colors duration-200 hover:bg-current/10"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="('footer.language' | transloco) + ': ' + meta[lang.current()].label"
      (click)="toggle()"
      (keydown.arrowdown)="openAndFocus($event)"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"
        />
      </svg>
      <span>{{ meta[lang.current()].short }}</span>
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        aria-hidden="true"
        class="transition-transform duration-200"
        [class.rotate-180]="open() !== dropUp()"
      >
        <path
          d="M6 9l6 6 6-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    @if (open()) {
      <ul
        #list
        role="listbox"
        [attr.aria-label]="'footer.language' | transloco"
        class="menu absolute z-50 min-w-44 overflow-hidden rounded-2xl border border-palta/10 bg-white p-1.5 text-palta shadow-xl"
        [class]="dropUp() ? 'bottom-full mb-2 start-0' : 'top-full mt-2 end-0'"
        (keydown.arrowdown)="move($event, 1)"
        (keydown.arrowup)="move($event, -1)"
      >
        @for (l of lang.langs; track l) {
          <li role="option" [attr.aria-selected]="lang.current() === l">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-start text-sm transition-colors hover:bg-palta/5 focus-visible:bg-palta/5"
              [class.font-semibold]="lang.current() === l"
              [attr.lang]="l"
              [attr.dir]="meta[l].dir"
              (click)="choose(l)"
            >
              <span>{{ meta[l].label }}</span>
              <span class="text-xs text-palta/50" dir="ltr">{{ meta[l].short }}</span>
            </button>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .menu {
      animation: menu-in 160ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes menu-in {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
      }
    }
  `,
})
export class LangSwitchComponent {
  /** Abre hacia arriba (para el footer). */
  readonly dropUp = input(false);

  protected readonly lang = inject(LanguageService);
  protected readonly meta = LANG_META;
  protected readonly open = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected toggle(): void {
    this.open.update((o) => !o);
  }

  protected openAndFocus(event: Event): void {
    event.preventDefault();
    this.open.set(true);
    setTimeout(() => this.options()[0]?.focus());
  }

  protected choose(l: Lang): void {
    this.lang.set(l);
    this.close(true);
  }

  protected close(returnFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (returnFocus) this.trigger().nativeElement.focus();
  }

  protected move(event: Event, step: number): void {
    event.preventDefault();
    const items = this.options();
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(i + step + items.length) % items.length]?.focus();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.contains(event.target as Node)) this.close();
  }

  private options(): HTMLButtonElement[] {
    return Array.from(this.host.querySelectorAll<HTMLButtonElement>('[role="option"] button'));
  }
}
