import './proceso.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCENE_MODE } from '../../config/scroll.config';
import { PROCESS_STEPS } from '../../data/proceso.data';
import { asset } from '../../lib/assets';
import { dir, useT } from '../../lib/i18n';
import * as scroll from '../../lib/smooth-scroll';

/** Debe coincidir con la media query de proceso.css */
const HORIZONTAL_MQ = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
/** Segundos que tarda el carril en llegar a una etapa. */
const STEP_DURATION = 0.7;

/** Recorrido horizontal con parte fija (no se usa en el modo 'libre'). */
const horizontal = SCENE_MODE !== 'libre';
const steps = PROCESS_STEPS;

/**
 * Proceso ⭐ momento memorable.
 * Escritorio: la sección se fija (pin) y el scroll vertical desplaza las etapas en horizontal.
 * Avanza por momentos: cada etapa se desliza completa al cruzar un punto del scroll, y las
 * pestañas de arriba llevan directo a cualquier etapa. Con SCENE_MODE 'libre'
 * (config/scroll.config.ts) no hay parte fija: las etapas van en vertical.
 * Móvil o movimiento reducido: línea de tiempo vertical, sin pin.
 */
export function Proceso() {
  const t = useT('proceso');
  const host = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  /** Celular: usa la versión liviana de los videos (`video.mobile`). */
  const [handheld, setHandheld] = useState(false);
  /** Lleva el carril a una etapa (lo define la escena fija; sin ella las pestañas no actúan). */
  const goToStep = useRef<((i: number) => void) | undefined>(undefined);
  const dirValue = dir.value;
  const reduced = scroll.reducedMotion.value;

  const setActiveIndex = (i: number) => {
    activeRef.current = i;
    setActive(i);
  };

  useEffect(() => {
    const el = host.current!;
    setHandheld(Math.min(window.screen.width, window.screen.height) < 768);

    // Videos de las etapas: solo se descargan y reproducen cuando están a la vista
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.35 },
    );
    const observeVideos = () =>
      el.querySelectorAll<HTMLVideoElement>('.step-video').forEach((v) => io.observe(v));
    observeVideos();

    let mm: gsap.MatchMedia | undefined;
    if (horizontal) {
      mm = gsap.matchMedia(el);
      mm.add(HORIZONTAL_MQ, () => {
        const track = el.querySelector<HTMLElement>('.track')!;
        const distance = () => track.scrollWidth - track.clientWidth;
        const last = steps.length - 1;

        const update = () => {
          const f = Math.min(1, -Number(gsap.getProperty(track, 'x')) / (distance() || 1));
          gsap.set('.progress-fill', { scaleX: f });
          const i = Math.min(last, Math.round(f * last));
          if (i !== activeRef.current) setActiveIndex(i);
        };

        // Por momentos: al cruzar cada tramo de la parte fija, el carril se desliza completo
        // a la etapa. Las pestañas de arriba llevan directo a cualquier etapa.
        let current = 0;
        const goTo = (i: number, duration = STEP_DURATION) =>
          gsap.to(track, {
            x: -distance() * (i / last),
            duration,
            ease: 'power3.out', // arranca al instante y frena suave
            overwrite: true,
            onUpdate: update,
          });
        /**
         * Una sola vez, como en Origen y Nosotros: tras pasar "Documentación y envío" la parte
         * fija se suelta. Al volver a subir, la sección queda quieta en la última etapa y solo
         * las pestañas mueven el carril.
         */
        let released = false;
        const release = () => {
          if (released) return;
          released = true;
          const dist = st.end - st.start;
          st.kill();
          // Se quita el tramo fijo sin que se note el salto
          scroll.shiftBy(-dist);
          ScrollTrigger.refresh();
        };
        const st = ScrollTrigger.create({
          trigger: el.querySelector('.pin'),
          start: 'top top',
          end: () => `+=${window.innerHeight * 0.75 * last}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
          onRefresh: () => goTo(current, 0),
          // Al pasar la última etapa hacia abajo, la sección se suelta (ver release)
          onLeave: () => release(),
          onUpdate: (self) => {
            // Mientras una pestaña lleva a su etapa, el scroll no cambia de momento
            if (scroll.state.autoScrolling) return;
            // Basta con entrar un poco (20 %) en el tramo siguiente para cambiar de etapa
            const f = self.progress * last;
            const target =
              self.direction > 0
                ? Math.min(last, Math.floor(f + 0.8))
                : Math.max(0, Math.ceil(f - 0.8));
            if (target === current) return;
            current = target;
            goTo(target);
          },
        });
        goToStep.current = (i: number) => {
          if (i === current) return;
          current = i;
          goTo(i);
          // Mientras está fija, la página se acomoda en el tramo de esa etapa
          // (la última queda justo antes del final: solo el scroll del usuario suelta la sección)
          if (!released) {
            const y = st.start + (st.end - st.start) * (i / last);
            scroll.scrollToY(Math.min(y, st.end - 4), STEP_DURATION);
          }
        };
        return () => {
          goToStep.current = undefined;
        };
      });
    }
    return () => {
      mm?.revert();
      io.disconnect();
    };
  }, []);

  // Si "reducir movimiento" se activa después de montar, los videos desaparecen: nada que observar

  return (
    <section
      ref={host}
      id="proceso"
      class={`proceso-section bg-palta text-niebla ${horizontal ? 'proceso-h' : ''}`}
      aria-labelledby="proceso-title"
    >
      <div class="pin flex flex-col py-24 lg:py-0">
        <div class="head container-page grid gap-6 md:grid-cols-12 md:items-end">
          <h2
            data-reveal
            id="proceso-title"
            class="text-4xl leading-[1.05] font-bold md:col-span-6 md:text-6xl"
          >
            {t('heading')}
          </h2>
          <p data-reveal class="measure text-lg text-niebla/75 md:col-span-5 md:col-start-8">
            {t('intro')}
          </p>

          {/* Progreso con pestañas (solo en modo horizontal): cada una lleva a su etapa */}
          <div class="progress md:col-span-12" dir="ltr">
            <div class="relative h-0.5 w-full bg-niebla/15" aria-hidden="true">
              <div class="progress-fill absolute inset-0 origin-left scale-x-0 bg-hoja"></div>
            </div>
            <ol class="mt-2 grid grid-cols-5 text-sm">
              {steps.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    class={`step-tab ${i <= active ? 'is-done' : ''} ${i === active ? 'is-active' : ''}`}
                    aria-current={i === active ? 'step' : undefined}
                    onClick={() => goToStep.current?.(i)}
                  >
                    <span class="tabular-nums">0{i + 1}</span>
                    <span class="ms-2 font-medium" dir={dirValue}>
                      {t('steps.' + s.id + '.title')}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* El recorrido horizontal es siempre LTR (también en árabe/hebreo); el texto conserva su dirección */}
        <ol class="track" dir="ltr">
          {steps.map((s, i) => (
            <li
              key={s.id}
              class={`step ${i === active ? 'is-active' : ''}`}
              data-reveal={horizontal ? undefined : ''}
            >
              <div class="step__media relative overflow-hidden rounded-[1.75rem] bg-palta-deep">
                <img
                  src={asset(s.image)}
                  alt={t('steps.' + s.id + '.alt')}
                  loading="lazy"
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  class="absolute inset-0 h-full w-full object-cover"
                />
                {/* Video opcional de la etapa: se reproduce solo mientras está a la vista. Sin
                    fundido: la imagen es su primer cuadro, así que simplemente empieza a moverse */}
                {s.video && !reduced && (
                  <video
                    class="step-video absolute inset-0 h-full w-full object-cover opacity-0"
                    muted
                    loop
                    playsInline
                    preload="none"
                    disablePictureInPicture
                    aria-hidden="true"
                    onPlaying={(e) => (e.currentTarget as HTMLVideoElement).classList.remove('opacity-0')}
                  >
                    {s.video.webm && <source src={s.video.webm} type="video/webm" />}
                    {s.video.mp4 && (
                      <source
                        src={handheld && s.video.mobile ? s.video.mobile : s.video.mp4}
                        type="video/mp4"
                      />
                    )}
                  </video>
                )}
              </div>
              <div class="step__body" dir={dirValue}>
                <span class="step__num font-display font-bold tabular-nums" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3 class="text-2xl font-semibold md:text-4xl">
                  <span class="sr-only">{i + 1}. </span>
                  {t('steps.' + s.id + '.title')}
                </h3>
                <p class="mt-3 max-w-[38ch] text-lg text-niebla/75">{t('steps.' + s.id + '.text')}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
