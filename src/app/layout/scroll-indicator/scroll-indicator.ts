import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActiveSectionService, SECTION_IDS } from '../../core/services/active-section.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

/**
 * Indicador de scroll propio (reemplaza la barra nativa): una línea vertical con un punto por
 * sección. Se ve tenue en reposo, completo mientras se hace scroll o al pasar el cursor, y cada
 * punto lleva a su sección. Con movimiento reducido no se muestra (queda la barra nativa).
 */
@Component({
  selector: 'app-scroll-indicator',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="si"
      [class.si--on]="section.scrolling()"
      *transloco="let t; prefix: 'nav'"
      [attr.aria-label]="t('sections')"
    >
      <div class="si__rail" aria-hidden="true">
        <div class="si__fill" [style.transform]="'scaleY(' + section.progress() + ')'"></div>
      </div>
      <ul class="si__list">
        @for (id of ids; track id) {
          <li>
            <button
              type="button"
              class="si__dot"
              [class.si__dot--active]="section.active() === id"
              [attr.aria-label]="t(id === 'inicio' ? 'home' : id)"
              [attr.aria-current]="section.active() === id ? 'location' : null"
              (click)="go(id)"
            >
              <span class="si__label" aria-hidden="true">{{
                t(id === 'inicio' ? 'home' : id)
              }}</span>
            </button>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `
    .si {
      position: fixed;
      inset-inline-end: 0.75rem;
      top: 50%;
      z-index: 40;
      display: none;
      height: min(20rem, 56svh);
      padding: 0.6rem 0.35rem;
      border-radius: 999px;
      /* Sin backdrop-filter: fijo sobre el video del hero, obliga a re-desenfocar cada cuadro */
      background: rgb(247 248 245 / 0.92);
      border: 1px solid rgb(30 59 47 / 0.1);
      transform: translateY(-50%);
      opacity: 0.3;
      transition: opacity 400ms var(--ease-out-soft);
    }
    .si--on,
    .si:hover,
    .si:focus-within {
      opacity: 1;
    }
    @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
      .si {
        display: block;
      }
    }
    .si__rail {
      position: absolute;
      inset-block: 0.9rem;
      inset-inline-start: 50%;
      width: 2px;
      margin-inline-start: -1px;
      border-radius: 2px;
      background: rgb(30 59 47 / 0.14);
      overflow: hidden;
    }
    .si__fill {
      width: 100%;
      height: 100%;
      background: var(--color-hoja);
      transform-origin: top;
      transition: transform 150ms linear;
    }
    .si__list {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .si__dot {
      position: relative;
      display: grid;
      place-items: center;
      width: 1.25rem;
      height: 1.25rem;
      border: 0;
      background: transparent;
      cursor: pointer;
    }
    .si__dot::before {
      content: '';
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 999px;
      background: #fff;
      border: 2px solid rgb(30 59 47 / 0.4);
      transition:
        transform 300ms var(--ease-out-soft),
        background-color 200ms,
        border-color 200ms;
    }
    .si__dot:hover::before {
      border-color: var(--color-palta);
      transform: scale(1.25);
    }
    .si__dot--active::before {
      background: var(--color-mandarina);
      border-color: var(--color-mandarina);
      transform: scale(1.4);
    }
    .si__dot:focus-visible {
      outline: 2px solid var(--color-mandarina);
      outline-offset: 2px;
      border-radius: 999px;
    }
    .si__label {
      position: absolute;
      inset-inline-end: calc(100% + 0.6rem);
      top: 50%;
      padding: 0.25rem 0.6rem;
      border-radius: 0.5rem;
      background: var(--color-palta);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transform: translateY(-50%) translateX(4px);
      transition:
        opacity 200ms,
        transform 200ms var(--ease-out-soft);
    }
    .si__dot:hover .si__label,
    .si__dot:focus-visible .si__label {
      opacity: 1;
      transform: translateY(-50%);
    }
  `,
})
export class ScrollIndicatorComponent {
  protected readonly section = inject(ActiveSectionService);
  private readonly scroll = inject(SmoothScrollService);
  protected readonly ids = SECTION_IDS;

  protected go(id: string): void {
    this.scroll.scrollTo(`#${id}`);
  }
}
