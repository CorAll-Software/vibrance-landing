import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Entradas en cascada: todo elemento con el atributo `data-reveal` aparece (sube y se aclara)
 * cuando llega cerca del borde inferior de la pantalla. Los que entran juntos lo hacen en
 * cascada. Se reproduce una sola vez. Con "reducir movimiento" no se anima nada.
 */
export function initReveals(reducedMotion: boolean): () => void {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (reducedMotion || !els.length) return () => {};
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const distance = mobile ? 24 : 48;

  gsap.set(els, { autoAlpha: 0, y: distance });
  const triggers = ScrollTrigger.batch(els, {
    // En celular el scroll con el dedo es rápido: la entrada empieza un poco antes de que el
    // bloque aparezca, para no mostrar huecos vacíos que parecen "cargando"
    start: mobile ? 'top bottom+=80' : 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: mobile ? 0.45 : 0.9,
        ease: 'power3.out',
        stagger: mobile ? 0.06 : 0.1,
        overwrite: true,
        clearProps: 'transform',
      }),
  });
  return () => {
    triggers.forEach((t) => t.kill());
    gsap.set(els, { clearProps: 'all' });
  };
}
