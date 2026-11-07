import './nosotros.css';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOMENT_DURATION } from '../../config/scroll.config';
import { t as translate, useT } from '../../lib/i18n';
import * as scroll from '../../lib/smooth-scroll';
import { Butterfly } from '../shared/Butterfly';

gsap.registerPlugin(ScrollTrigger);

/** Escena fija solo en escritorio con altura suficiente y sin "reducir movimiento". */
const SCENE_MQ =
  '(min-width: 1024px) and (min-height: 480px) and (prefers-reduced-motion: no-preference)';
/** Segundos que se ve la pantalla verde con su texto antes de abrirse el círculo. */
const INTRO_HOLD = 1;
/** Segundos que tarda la frase en salir por la izquierda antes de que entre Proceso. */
const SLIDE = 0.6;
/** El imán actúa cuando el scroll va más lento que esto (px/s): el usuario ya soltó la rueda. */
const MAGNET_MAX_SPEED = 250;
/** Breve espera con el scroll lento antes de acomodar la página. */
const MAGNET_IDLE_MS = 80;

/** La escena se reproduce una sola vez por visitante (como la intro de la mariposa). */
const SEEN_KEY = 'vibe-seen';
function sceneSeen(): boolean {
  if (typeof window === 'undefined') return true;
  // En desarrollo (astro dev) o con ?intro en la URL se muestra siempre (una vez por carga)
  if (import.meta.env.DEV || new URLSearchParams(location.search).has('intro')) return false;
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}
function markSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* almacenamiento no disponible */
  }
}

const PILLARS = ['contracts', 'insurance', 'credit'] as const;
const STORY = ['p1', 'p2', 'p3'] as const;

/**
 * La frase dividida en palabras (Intl.Segmenter también separa chino y japonés).
 * `i` es la posición de cada palabra; los espacios llevan -1.
 */
function splitWords(text: string) {
  let i = 0;
  const seg =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)]
      : text.split(/(\s+)/).map((segment) => ({ segment, isWordLike: /\S/.test(segment) }));
  // Los signos (punto, coma…) aparecen junto con la palabra anterior; los espacios no cuentan
  const parts = seg.map((s) => ({
    text: s.segment,
    i: s.isWordLike ? i++ : /\S/.test(s.segment) ? Math.max(0, i - 1) : -1,
  }));
  return { parts, count: i };
}

/**
 * Escena fija con imán: al acercarse, la página se acomoda sola en la escena y queda fija.
 * El scroll solo cambia de momento (cada uno se reproduce completo): verde → círculo → lateral.
 * Devuelve la función que limpia lo que dejó.
 */
function buildScene(vibe: HTMLElement): () => void {
  const q = gsap.utils.selector(vibe);
  let fill: ScrollTrigger | undefined;
  // Línea de tiempo en segundos reales
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.addLabel('m0', 0)
    // 1 · (solo, al llegar) el verde con su texto se ve un momento...
    .from(q('.vibe-intro'), { y: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0)
    .to(
      q('.vibe-intro'),
      { autoAlpha: 0, scale: 0.96, duration: 0.3, ease: 'power1.in' },
      INTRO_HOLD,
    )
    // ...y un círculo crece desde el centro, limpia el verde y muestra la frase con la mariposa
    .to(
      q('.vibe-reveal'),
      { clipPath: 'circle(75% at 50% 50%)', duration: MOMENT_DURATION, ease: 'power2.inOut' },
      INTRO_HOLD + 0.2,
    )
    .from(
      q('.vibe-quote'),
      { y: 30, autoAlpha: 0, duration: 0.6, ease: 'power2.out' },
      INTRO_HOLD + 0.8,
    )
    .from(
      q('.vibe-bf'),
      { y: -40, rotation: 25, autoAlpha: 0, duration: 0.6, ease: 'power2.out' },
      INTRO_HOLD + 1.2,
    )
    .addLabel('m1', INTRO_HOLD + 1.8)
    // 2 · (con scroll) la escena arranca hacia la izquierda acelerando (la frase y la mariposa
    // un poco más rápido, como en capas); Proceso continúa el mismo movimiento frenando
    .to(q('.vibe-track'), { xPercent: -50, duration: SLIDE, ease: 'power2.in' }, 'm1')
    .to(q('.vibe-quote, .vibe-bf'), { x: -120, duration: SLIDE, ease: 'power2.in' }, 'm1')
    .addLabel('m2', '>');

  let current = 0;
  /** Navegando por el menú a otra sección: la escena que queda de paso no se reproduce. */
  const passing = () =>
    !!scroll.state.navTarget && !vibe.closest('section')?.contains(scroll.state.navTarget);
  const inView = () => Math.abs(vibe.getBoundingClientRect().top) < window.innerHeight * 0.6;
  /**
   * Durante la transición a Proceso (deslizamiento + entrada) el scroll queda bloqueado: si no,
   * un scroll rápido seguiría moviendo la página y el carril de Proceso, y la animación se
   * deformaría. Se libera cuando Proceso termina de entrar.
   */
  let locked = false;
  const lock = () => {
    if (locked) return;
    locked = true;
    scroll.stop();
    // Salvaguarda: pase lo que pase, el scroll se libera en unos segundos
    setTimeout(unlock, 4000);
    // Si un scroll rápido ya pasó el final de la escena, se vuelve a ella antes de deslizar
    const beyond = window.scrollY - (st.end - 2);
    if (beyond > 0) scroll.jumpBy(-beyond);
  };
  const unlock = () => {
    if (!locked) return;
    locked = false;
    scroll.start();
  };
  /**
   * Entrada a la escena: verde con "Lo que nos mueve" y luego el círculo que abre "Vibrance es
   * una empresa…". Una sola vez: si la frase ya se mostró, al volver se queda en la frase (repetir
   * el verde al pasar de nuevo se veía como un destello de "Lo que nos mueve"). Solo si la escena
   * está a la vista (con medidas desfasadas el aviso puede llegar antes de tiempo).
   */
  const start = () => {
    if (!inView() || current !== 0) return;
    tl.pause(0);
    current = 0;
    go(1);
  };
  const go = (i: number) => {
    if (i === current) return;
    current = i;
    if (i === 2) lock();
    tl.tweenTo(`m${i}`, {
      // hacia atrás va más rápido
      duration:
        Math.abs(tl.labels[`m${i}`] - tl.time()) * (tl.labels[`m${i}`] < tl.time() ? 0.5 : 1),
      overwrite: true,
      // Al terminar de deslizar, se pasa directo a Proceso, que entra por la derecha
      onComplete: () => i === 2 && toProceso(),
    });
  };
  /**
   * Continúa el movimiento lateral: la página salta (sin que se note, todo es verde) al inicio de Proceso y su contenido entra
   * desde la derecha con la misma velocidad con la que salió la frase.
   */
  const toProceso = () => {
    const proceso = document.querySelector<HTMLElement>('#proceso');
    const pin = proceso?.querySelector<HTMLElement>('.pin');
    if (!proceso || !pin || scroll.state.autoScrolling) return unlock();
    release();
    // Salta justo al inicio de Proceso (también si un scroll rápido ya lo había pasado un poco)
    const top = (pin.closest<HTMLElement>('.pin-spacer') ?? pin).getBoundingClientRect().top;
    scroll.jumpBy(top);
    gsap.fromTo(
      proceso,
      { '--enter': `${window.innerWidth}px`, '--enter-o': 0.3 },
      {
        '--enter': '0px',
        '--enter-o': 1,
        duration: 1.1,
        ease: 'power3.out',
        overwrite: true,
        onComplete: unlock,
      },
    );
  };
  /**
   * Una sola vez: tras reproducirse (o saltarse por el menú), la escena deja de estar fija y
   * queda como un bloque con la frase (al volver a subir se llena palabra por palabra con el
   * scroll). También se recuerda para las próximas visitas, igual que la intro de la mariposa.
   */
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    markSeen();
    unlock();
    st.kill();
    magnet.kill();
    cancelMagnet();
    tl.kill();
    // Queda como al inicio: la frase con poco aire arriba y abajo (ver .vibe.is-done)
    gsap.set(q('.vibe-track, .vibe-reveal, .vibe-intro, .vibe-quote, .vibe-bf'), {
      clearProps: 'all',
    });
    vibe.classList.add('is-done');
    vibe.style.setProperty('--p', '0');
    fill = ScrollTrigger.create({
      trigger: vibe,
      start: 'top 80%',
      end: 'bottom 55%',
      scrub: 0.4,
      onUpdate: (self) => vibe.style.setProperty('--p', self.progress.toFixed(3)),
    });
    ScrollTrigger.refresh();
    vibe.style.setProperty('--p', fill.progress.toFixed(3));
  };
  let lastY = window.scrollY;
  const st = ScrollTrigger.create({
    trigger: vibe,
    start: 'top top',
    end: () => `+=${window.innerHeight}`,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    refreshPriority: 2,
    // Al llegar: verde con texto, y el círculo se abre solo (sin scroll)
    onEnter: () => !passing() && start(),
    // Si se vuelve sin haberla visto, empieza igual que al bajar
    onEnterBack: () => !passing() && start(),
    // Al salir por arriba no se rebobina: se queda en la frase (ver start)
    // El siguiente scroll (momento) desliza hasta Proceso
    onUpdate: (self) => {
      // Se decide por lo que realmente se movió la página: un recálculo de posiciones (al
      // liberar el scroll) no cuenta como bajar y no debe llevar solo a Proceso
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      // El desplazamiento del imán (autoScrolling) no cuenta: solo el scroll del usuario avanza
      if (passing() || !inView() || dy === 0 || scroll.state.autoScrolling) return;
      // Con la frase ya en pantalla, cualquier scroll hacia abajo pasa a Proceso (antes había
      // que recorrer un 35 % y un scroll corto no hacía nada). Mientras se abre la frase, solo
      // un scroll largo la salta.
      const quoteShown = tl.time() >= tl.labels['m1'] - 0.05;
      go(dy > 0 && (quoteShown || self.progress >= 0.35) ? 2 : 1);
    },
  });

  // Imán suave: al acercarse a la escena bajando, cuando el scroll ya va lento (el usuario soltó
  // la rueda), la página termina de llegar sola con una curva suave. No corta un scroll rápido
  // en curso y el usuario lo puede interrumpir con su propio scroll.
  let magnetTimer: ReturnType<typeof setTimeout> | undefined;
  const cancelMagnet = () => {
    clearTimeout(magnetTimer);
    magnetTimer = undefined;
  };
  const magnet = ScrollTrigger.create({
    trigger: vibe,
    start: 'top 75%',
    end: 'top top',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (scroll.state.autoScrolling) return;
      const outside = self.progress < 0.05 || self.progress > 0.97;
      if (self.direction < 0 || outside || Math.abs(self.getVelocity()) > MAGNET_MAX_SPEED) {
        return cancelMagnet();
      }
      magnetTimer ??= setTimeout(() => {
        magnetTimer = undefined;
        if (!magnet.isActive || scroll.state.autoScrolling) return;
        // Un poco adentro del inicio: justo en el borde la escena no se activa y queda verde vacía
        const y = st.start + 2;
        // Tramos cortos, rápido; tramos largos, sin pasar de MOMENT_DURATION
        const duration = gsap.utils.clamp(0.7, MOMENT_DURATION, Math.abs(y - window.scrollY) / 500);
        scroll.scrollToY(y, duration, { soft: true });
      }, MAGNET_IDLE_MS);
    },
  });

  // Si se llega por el menú a una sección posterior, la escena cuenta como ya reproducida:
  // al subir solo se ve su forma estática (se aplica con la pantalla tapada por el fundido)
  const offNav = scroll.onNavigate((el) => {
    const section = vibe.closest('section');
    if (
      section &&
      !section.contains(el) &&
      vibe.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      release();
    }
  });

  return () => {
    fill?.kill();
    offNav();
  };
}

/**
 * Quiénes somos: el equipo (sin datos personales, pedido de la clienta) y el mensaje de
 * respaldo legal y asegurado, con la ilustración del árbol de la marca.
 * Cierra con la frase de la marca.
 * Escritorio: escena fija (imán). Al llegar, la vista es verde con un texto por un segundo y
 * luego, sola, un círculo crece desde el centro y "limpia" el verde mostrando la frase con la
 * mariposa. El siguiente scroll (momento) desliza la escena hasta "Del productor a tu almacén".
 * Móvil o movimiento reducido: las palabras pasan de tenues a plenas con el scroll y, al
 * completarse, aparece la mariposa amarilla.
 */
export function Nosotros() {
  const t = useT('nosotros');
  const words = useMemo(() => splitWords(translate('nosotros.quote')), [translate('nosotros.quote')]);
  const host = useRef<HTMLElement>(null);
  const vibe = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLElement>(null);
  /**
   * true si se usa la escena fija (se decide al cargar en el cliente; si ya se vio, va la frase
   * simple). En el HTML estático empieza en false para que la hidratación coincida.
   */
  const [scene, setScene] = useState(false);

  useEffect(() => {
    setScene(window.matchMedia(SCENE_MQ).matches && !sceneSeen());
  }, []);

  // Se arma tras decidir el modo (y con el DOM de ese modo ya pintado)
  useEffect(() => {
    if (scroll.reducedMotion.value) return;
    const el = host.current!;
    let cleanup: (() => void) | undefined;
    let ctx: gsap.Context | undefined;
    let st: ScrollTrigger | undefined;
    if (scene && vibe.current) {
      const v = vibe.current;
      ctx = gsap.context(() => {
        cleanup = buildScene(v);
      }, el);
    } else if (!scene && band.current) {
      const b = band.current;
      b.style.setProperty('--p', '0');
      st = ScrollTrigger.create({
        trigger: b,
        start: 'top 80%',
        end: 'bottom 55%',
        scrub: 0.4,
        onUpdate: (self) => b.style.setProperty('--p', self.progress.toFixed(3)),
      });
    }
    // El modo cambia la altura de la sección: recalcula posiciones
    ScrollTrigger.refresh();
    return () => {
      st?.kill();
      cleanup?.();
      ctx?.revert();
    };
  }, [scene]);

  const parts = words.parts.map((w, idx) => (
    <span key={idx} class={`qw ${w.i < 0 ? 'qw--space' : ''}`} style={{ '--i': w.i }} aria-hidden="true">
      {w.text}
    </span>
  ));

  return (
    <section
      ref={host}
      id="nosotros"
      class="nosotros-section bg-niebla py-24 md:py-36"
      style={scene ? { paddingBottom: '0' } : undefined}
      aria-labelledby="nosotros-title"
    >
      <div class="container-page grid gap-14 lg:grid-cols-12">
        <div class="lg:col-span-6">
          <p data-reveal class="text-sm font-semibold tracking-wide text-hoja uppercase">
            {t('kicker')}
          </p>
          <h2
            data-reveal
            id="nosotros-title"
            class="mt-4 text-4xl leading-[1.05] font-bold md:text-5xl xl:text-6xl"
          >
            {t('heading')}
          </h2>
          <p data-reveal class="measure mt-8 text-lg text-palta/80">
            {t('bio')}
          </p>
          <blockquote data-reveal class="mt-8 border-s-4 border-mandarina ps-5">
            <p class="font-display text-xl leading-snug font-semibold text-palta md:text-2xl">
              “{t('ceoQuote')}”
            </p>
            <footer class="mt-4 font-display text-lg font-semibold text-palta">{t('signature')}</footer>
          </blockquote>

          <ul data-reveal class="mt-10 grid gap-4">
            {PILLARS.map((k) => (
              <li key={k} class="flex gap-4 border-t border-palta/15 pt-4">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  aria-hidden="true"
                  class="mt-0.5 shrink-0 text-hoja"
                >
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="text-palta/85">{t('pillars.' + k)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div class="lg:col-span-5 lg:col-start-8">
          {/* Ilustración del árbol (versión HD de la clienta, sin fondo: branding/nosotros/).
              Dos tamaños: el celular baja el de 600 px */}
          <img
            data-reveal
            src="/media/nosotros/arbol-vibrance-1100.webp"
            srcset="/media/nosotros/arbol-vibrance-600.webp 600w, /media/nosotros/arbol-vibrance-1100.webp 1100w"
            sizes="(min-width: 640px) 34rem, calc(100vw - 2.5rem)"
            alt={t('illustrationAlt')}
            width={1100}
            height={961}
            loading="lazy"
            decoding="async"
            class="mx-auto mb-8 block h-auto w-full max-w-[34rem]"
          />
          <div data-reveal class="mt-8 grid gap-5 text-palta/80">
            <h3 class="text-2xl font-semibold text-palta md:text-3xl">{t('storyTitle')}</h3>
            {STORY.map((k) => (
              <p key={k}>{t('story.' + k)}</p>
            ))}
          </div>
        </div>
      </div>

      {scene ? (
        /* Escena fija: verde → círculo que limpia y muestra la frase → desliza a Proceso */
        <div ref={vibe} class="vibe" style={{ '--n': words.count }}>
          <div class="vibe-track" dir="ltr">
            <div class="vibe-panel">
              <div class="vibe-green" aria-hidden="true">
                <p class="vibe-intro font-display font-bold">{t('vibeIntro')}</p>
              </div>
              <div class="vibe-reveal">
                <p class="vibe-quote font-display font-bold" aria-label={t('quote')}>
                  {parts}
                </p>
                <Butterfly class="vibe-bf" />
              </div>
            </div>
            {/* Mismo verde que Proceso: al terminar de deslizar, Proceso entra por la derecha */}
            <div class="vibe-panel vibe-next" aria-hidden="true"></div>
          </div>
        </div>
      ) : (
        /* Frase de la marca: cada palabra se llena con el scroll */
        <figure ref={band} class="quote-band container-page" style={{ '--n': words.count }}>
          <blockquote>
            <p class="quote-text font-display font-bold" aria-label={t('quote')}>
              {parts}
            </p>
          </blockquote>
          <Butterfly class="quote-bf" />
        </figure>
      )}
    </section>
  );
}
