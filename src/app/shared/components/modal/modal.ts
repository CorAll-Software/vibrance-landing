import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';

/**
 * Modal accesible reutilizable basado en <dialog> nativo:
 * - showModal() vuelve inerte el resto de la página → el foco queda atrapado.
 * - Esc cierra (evento `cancel`).
 * - Al cerrar, el foco vuelve al elemento que abrió el modal.
 */
@Component({
  selector: 'app-modal',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="modal"
      [class.modal--wide]="size() === 'wide'"
      [attr.aria-labelledby]="labelledBy()"
      data-lenis-prevent
      (cancel)="onCancel($event)"
      (click)="onBackdropClick($event)"
    >
      <div class="modal__panel">
        <button
          type="button"
          class="modal__close"
          [attr.aria-label]="'common.close' | transloco"
          (click)="closed.emit()"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <ng-content />
      </div>
    </dialog>
  `,
  styles: `
    .modal {
      margin: auto;
      width: min(100% - 2rem, 40rem);
      max-height: min(100dvh - 2rem, 54rem);
      padding: 0;
      border: 0;
      border-radius: 1.5rem;
      background: var(--color-niebla);
      color: var(--color-palta);
      overflow: auto;
      overscroll-behavior: contain;
      opacity: 0;
      transform: translateY(16px) scale(0.98);
      transition:
        opacity 240ms ease,
        transform 300ms var(--ease-out-soft),
        overlay 300ms allow-discrete,
        display 300ms allow-discrete;
    }
    .modal--wide {
      width: min(100% - 2rem, 64rem);
    }
    .modal[open] {
      opacity: 1;
      transform: none;
    }
    @starting-style {
      .modal[open] {
        opacity: 0;
        transform: translateY(16px) scale(0.98);
      }
    }
    .modal::backdrop {
      transition:
        opacity 240ms ease,
        overlay 300ms allow-discrete,
        display 300ms allow-discrete;
      opacity: 0;
    }
    .modal[open]::backdrop {
      opacity: 1;
    }
    @starting-style {
      .modal[open]::backdrop {
        opacity: 0;
      }
    }
    .modal__panel {
      position: relative;
    }
    .modal__close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 2;
      display: grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 999px;
      background: rgb(255 255 255 / 0.9);
      color: var(--color-palta);
      box-shadow: 0 1px 4px rgb(0 0 0 / 0.12);
      transition: transform 200ms var(--ease-out-soft);
    }
    .modal__close:hover {
      transform: rotate(90deg);
    }
  `,
})
export class ModalComponent {
  readonly open = input.required<boolean>();
  readonly labelledBy = input<string>();
  readonly size = input<'default' | 'wide'>('default');
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly document = inject(DOCUMENT);
  private readonly scroll = inject(SmoothScrollService);
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.open() && !el.open) {
        this.returnFocusTo = this.document.activeElement as HTMLElement | null;
        el.showModal();
        this.scroll.stop();
      } else if (!this.open() && el.open) {
        el.close();
        this.scroll.start();
        // Devuelve el foco al disparador (p. ej. la card)
        this.returnFocusTo?.focus({ preventScroll: true });
        this.returnFocusTo = null;
      }
    });
  }

  protected onCancel(event: Event): void {
    event.preventDefault(); // el estado lo controla el padre
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    // Un clic directo sobre <dialog> (no sobre su contenido) es un clic en el backdrop
    if (event.target === this.dialog().nativeElement) this.closed.emit();
  }
}
