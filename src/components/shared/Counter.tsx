import { useEffect, useRef, useState } from 'preact/hooks';
import { gsap } from 'gsap';
import { locale } from '../../lib/i18n';
import { reducedMotion } from '../../lib/smooth-scroll';

/**
 * Cifra grande que sube desde 0 al entrar en pantalla, solo la primera vez.
 * Con movimiento reducido muestra el valor final directamente.
 */
export function Counter({
  value,
  prefix = '',
  suffix = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const host = useRef<HTMLSpanElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const check = useRef<SVGSVGElement>(null);
  const loc = locale.value;

  const fmt = (n: number) => new Intl.NumberFormat(loc).format(n);
  const finalText = `${prefix}${fmt(value)}${suffix}`;

  useEffect(() => {
    if (reducedMotion.value) {
      setCurrent(value);
      setDone(true);
      return;
    }
    let observer: IntersectionObserver | undefined;
    const ctx = gsap.context(() => {
      const state = { n: 0 };
      // IntersectionObserver en vez de ScrollTrigger: no depende de posiciones calculadas
      // antes de que las secciones fijas de arriba terminen de medirse (disparaba demasiado pronto)
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer?.disconnect();
          gsap.to(state, {
            n: value,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => setCurrent(state.n),
            onComplete: () => {
              // Al llegar a la cifra: rebote de la cifra y check que aparece con pop
              setCurrent(value);
              gsap.fromTo(
                num.current,
                { scale: 1.22 },
                { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)' },
              );
              gsap.fromTo(
                check.current,
                { scale: 0, rotate: -25, opacity: 1, transformOrigin: '50% 50%' },
                { scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(3)', delay: 0.1 },
              );
              setDone(true);
            },
          });
        },
        { rootMargin: '0px 0px -15% 0px' },
      );
      if (host.current) observer.observe(host.current);
    });
    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <span ref={host}>
      {/* Valor final para lectores de pantalla. Queda justo encima de la cifra que cuenta y en
          Safari (iOS) el recorte de sr-only puede fallar un instante mientras el bloque entra
          animado: se veían dos números encimados. opacity-0 lo oculta igual (y se sigue leyendo). */}
      <span class="sr-only opacity-0 select-none">{finalText}</span>
      <span aria-hidden="true" class="inline-flex items-end gap-[0.12em]">
        <span ref={num} class="inline-block origin-bottom tabular-nums">
          {prefix}
          {fmt(Math.round(current))}
          {suffix}
        </span>
        <svg
          ref={check}
          class="mb-[0.12em] h-[0.3em] w-[0.3em] shrink-0 text-mandarina"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          style={{ opacity: done ? 1 : 0 }}
        >
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
      </span>
    </span>
  );
}
