import './modal.css';
import { useEffect, useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useT } from '../../lib/i18n';
import * as scroll from '../../lib/smooth-scroll';

interface ModalProps {
  open: boolean;
  labelledBy?: string;
  size?: 'default' | 'wide';
  onClose: () => void;
  children?: ComponentChildren;
}

/**
 * Modal accesible reutilizable basado en <dialog> nativo:
 * - showModal() vuelve inerte el resto de la página → el foco queda atrapado.
 * - Esc cierra (evento `cancel`).
 * - Al cerrar, el foco vuelve al elemento que abrió el modal.
 */
export function Modal({ open, labelledBy, size = 'default', onClose, children }: ModalProps) {
  const t = useT('common');
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      returnFocusTo.current = document.activeElement as HTMLElement | null;
      el.showModal();
      scroll.stop();
    } else if (!open && el.open) {
      el.close();
      scroll.start();
      // Devuelve el foco al disparador (p. ej. la card)
      returnFocusTo.current?.focus({ preventScroll: true });
      returnFocusTo.current = null;
    }
  }, [open]);

  return (
    <dialog
      ref={dialog}
      class={`app-modal ${size === 'wide' ? 'app-modal--wide' : ''}`}
      aria-labelledby={labelledBy}
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault(); // el estado lo controla el padre
        onClose();
      }}
      onClick={(e) => {
        // Un clic directo sobre <dialog> (no sobre su contenido) es un clic en el backdrop
        if (e.target === dialog.current) onClose();
      }}
    >
      <div class="app-modal__panel">
        <button type="button" class="app-modal__close" aria-label={t('close')} onClick={onClose}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </dialog>
  );
}
