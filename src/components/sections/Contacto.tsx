import { useEffect, useRef } from 'preact/hooks';
import { gsap } from 'gsap';
import { useT } from '../../lib/i18n';
import { reducedMotion } from '../../lib/smooth-scroll';
import { openQuote } from '../../lib/ui';

/**
 * Cierre: eslogan muy grande + llamada a cotizar. Los correos y WhatsApp no se repiten aquí:
 * están en el footer y en el botón flotante.
 */
export function Contacto() {
  const t = useT('contacto');
  const host = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || reducedMotion.value) return;
    const ctx = gsap.context(() => {
      // El eslogan se "acerca" ligeramente mientras entra: cierre con peso, sin repetir el fade-up
      gsap.fromTo(
        '.slogan',
        { scale: 0.86, opacity: 0.3 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 30%', scrub: 0.5 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={host}
      id="contacto"
      class="overflow-hidden bg-palta pt-28 pb-28 text-niebla md:pt-40 md:pb-44"
      aria-labelledby="contacto-title"
    >
      <div class="container-page flex flex-col items-center text-center">
        <h2
          id="contacto-title"
          class="slogan max-w-[16ch] text-[clamp(3rem,8.5vw,8.75rem)] leading-[0.95] font-bold"
        >
          {t('slogan')}
        </h2>
        <p data-reveal class="measure mt-8 max-w-[48ch] text-lg text-niebla/80">
          {t('text')}
        </p>
        <button
          data-reveal
          type="button"
          class="btn-primary mt-10 !px-8 text-lg"
          onClick={() => openQuote()}
        >
          {t('cta')}
        </button>
      </div>
    </section>
  );
}
