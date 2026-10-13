import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { BRAND_DESCRIPTOR, BRAND_NAME, LOGO } from '../../core/config/brand';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { LangSwitchComponent } from './lang-switch';

export const NAV_ITEMS = [
  'origen',
  'nosotros',
  'proceso',
  'productos',
  'datos',
  'como',
  'contacto',
] as const;

/** Menú transparente sobre el hero; fondo sólido al hacer scroll. */
@Component({
  selector: 'app-header',
  imports: [TranslocoDirective, TranslocoPipe, LangSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
})
export class HeaderComponent {
  protected readonly brand = BRAND_NAME;
  protected readonly descriptor = BRAND_DESCRIPTOR;
  protected readonly logo = LOGO;
  protected readonly items = NAV_ITEMS;
  protected readonly solid = signal(false);
  protected readonly menuOpen = signal(false);

  protected readonly ui = inject(UiStateService);
  private readonly scroll = inject(SmoothScrollService);

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      zone.runOutsideAngular(() => {
        const update = () => this.solid.set(window.scrollY > window.innerHeight * 0.75);
        update();
        window.addEventListener('scroll', update, { passive: true });
        destroyRef.onDestroy(() => window.removeEventListener('scroll', update));
      });
    });

    // Bloquea el scroll de fondo mientras el menú móvil está abierto
    let locked = false;
    effect(() => {
      const open = this.menuOpen();
      if (open && !locked) this.scroll.stop();
      if (!open && locked) this.scroll.start();
      locked = open;
    });
  }

  protected go(event: Event, id: string): void {
    event.preventDefault();
    this.menuOpen.set(false);
    this.scroll.scrollTo(`#${id}`);
  }

  protected quote(): void {
    this.menuOpen.set(false);
    this.ui.openQuote();
  }
}
