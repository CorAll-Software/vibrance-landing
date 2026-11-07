import './scroll-indicator.css';
import { SECTION_IDS, active, progress, scrolling } from '../../lib/active-section';
import { useT } from '../../lib/i18n';
import * as scroll from '../../lib/smooth-scroll';

/**
 * Indicador de scroll propio (reemplaza la barra nativa): una línea vertical con un punto por
 * sección. Se ve tenue en reposo, completo mientras se hace scroll o al pasar el cursor, y cada
 * punto lleva a su sección. Con movimiento reducido no se muestra (queda la barra nativa).
 */
export function ScrollIndicator() {
  const t = useT('nav');
  const current = active.value;
  return (
    <nav class={`si ${scrolling.value ? 'si--on' : ''}`} aria-label={t('sections')}>
      <div class="si__rail" aria-hidden="true">
        <div class="si__fill" style={{ transform: `scaleY(${progress.value})` }} />
      </div>
      <ul class="si__list">
        {SECTION_IDS.map((id) => {
          const label = t(id === 'inicio' ? 'home' : id);
          return (
            <li key={id}>
              <button
                type="button"
                class={`si__dot ${current === id ? 'si__dot--active' : ''}`}
                aria-label={label}
                aria-current={current === id ? 'location' : undefined}
                onClick={() => scroll.scrollTo(`#${id}`)}
              >
                <span class="si__label" aria-hidden="true">
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
