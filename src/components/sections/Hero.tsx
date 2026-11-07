import './hero.css';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO, type HeroVideo } from '../../config/media.config';
import { MOMENT_DURATION, SCENE_MODE } from '../../config/scroll.config';
import { asset } from '../../lib/assets';
import { t as translate, useT } from '../../lib/i18n';
import * as scroll from '../../lib/smooth-scroll';
import { introDone, introFlight, openQuote } from '../../lib/ui';

/** Reintento si el video del hero todavía no está en la página al momento de arrancar. */
const VIDEO_RETRY_MS = 100;

/**
 * Altura del video según los píxeles reales que el fondo ocupa en la pantalla: no se
 * descarga ni decodifica más de lo que se puede ver. Laptop Full HD → 1080p; 1440p y 4K
 * quedan para monitores grandes. Celulares y tablets: máximo 1080p (en vertical la fórmula
 * pediría 4K por la densidad de la pantalla, y decodificarlo traba el scroll en Android).
 */
function pickVideoHeight(): number {
  if (typeof window === 'undefined') return 1080;
  // Una versión anterior guardaba aquí un tope de calidad: se borra para no quedar en 720p
  try {
    localStorage.removeItem('hero-video-cap');
  } catch {
    /* almacenamiento no disponible */
  }
  // El fondo es 16:9 recortado a la pantalla y está ampliado un 10 % (scale-110)
  const width = Math.max(window.innerWidth, (window.innerHeight * 16) / 9) * 1.1;
  const needed = (width * (window.devicePixelRatio || 1) * 9) / 16;
  const height = needed <= 820 ? 720 : needed <= 1250 ? 1080 : needed <= 1700 ? 1440 : 2160;
  const handheld = Math.min(window.screen.width, window.screen.height) < 768;
  return handheld ? Math.min(height, 1080) : height;
}

/** Con `local`, apunta al archivo de la calidad elegida. */
function resolveVideo(v: HeroVideo, height: number): HeroVideo {
  return v.local ? { mp4: `${v.local}-${height}.mp4`, seconds: v.seconds } : v;
}

export function Hero() {
  const t = useT('hero');
  const host = useRef<HTMLElement>(null);

  /** Máximo 4 videos con fuente válida, en la calidad que corresponde a esta pantalla. */
  const videos = useMemo(() => {
    const height = pickVideoHeight();
    return HERO.videos
      .filter((v) => v.local || v.mp4 || v.webm)
      .slice(0, 4)
      .map((v) => resolveVideo(v, height));
  }, []);

  /** El titular se divide en palabras para la entrada palabra por palabra. */
  const title = translate('hero.title');
  const spaced = title.includes(' ');
  // Japonés no usa espacios: se anima por carácter para que el titular pueda partirse en líneas
  const words = spaced ? title.split(' ') : Array.from(title);

  /** Si se muestra el video de fondo (si no, queda la imagen). */
  const [showVideo, setShowVideo] = useState(false);
  /** Video activo de la cadena. */
  const [current, setCurrent] = useState(0);
  /** Video que está saliendo: se mantiene visible debajo mientras entra el nuevo. */
  const [previous, setPrevious] = useState(-1);
  /** true cuando el primer video ya muestra su primer cuadro (reemplaza a la imagen, sin fundido). */
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  // Estado imperativo (espejo de los signals del componente original)
  const cur = useRef(0);
  const switching = useRef(false);
  /** El primer video no se reproduce hasta que pasa la espera inicial. */
  const started = useRef(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const played = useRef(false);
  const kicked = useRef(false);
  const ctxRef = useRef<gsap.Context | undefined>(undefined);
  const showVideoRef = useRef(false);

  const videoEl = (i: number) =>
    host.current?.querySelectorAll<HTMLVideoElement>('.hero-video')[i];

  const startVideo = () => {
    const v = videoEl(0);
    if (!v) {
      // El <video> aún no está en la página (recién se activó showVideo): reintenta
      if (showVideoRef.current) startTimer.current = setTimeout(startVideo, VIDEO_RETRY_MS);
      return;
    }
    started.current = true;
    if (v.currentTime !== 0) v.currentTime = 0;
    v.play().catch(() => {});
  };

  // Montaje (equivale a afterNextRender)
  useEffect(() => {
    const el = host.current!;
    // Video en todos los tamaños, salvo con "reducir movimiento" o modo ahorro de datos
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    const show = videos.length > 0 && !scroll.reducedMotion.value && !saveData;
    showVideoRef.current = show;
    setShowVideo(show);
    // Pausa los videos cuando el hero no está a la vista (ahorra batería y CPU)
    const io = new IntersectionObserver(([e]) => {
      const v = videoEl(cur.current);
      if (!v || !started.current) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(el);
    setReady(true);
    if (!scroll.reducedMotion.value && !introDone.value) {
      // Estado inicial oculto mientras dura el loader
      gsap.set(el.querySelectorAll('.word, .hero-fade'), { opacity: 0 });
    }
    if (scroll.reducedMotion.value) document.documentElement.removeAttribute('data-hero-prep');
    return () => {
      io.disconnect();
      ctxRef.current?.revert();
      clearTimeout(fadeTimer.current);
      clearTimeout(startTimer.current);
    };
  }, []);

  // El video arranca cuando la mariposa despega de la semilla: al disolverse el loader ya
  // se ve el campo en movimiento. Sin loader (o al saltarlo), arranca con la entrada del hero.
  const flight = introFlight.value;
  const done = introDone.value;
  useEffect(() => {
    if (kicked.current || !ready || !(flight || done)) return;
    kicked.current = true;
    startVideo();
  }, [ready, flight, done]);

  // Entrada del hero: espera a que termine el loader (una sola vez)
  useEffect(() => {
    const el = host.current;
    if (!done || played.current || !ready || !el) return;
    played.current = true;
    if (scroll.reducedMotion.value) return;
    ctxRef.current = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .fromTo(
          '.word',
          { yPercent: 105, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
        )
        .fromTo(
          '.hero-fade',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          '-=0.45',
        );
      // Parallax leve del fondo al salir del hero
      gsap.to('.hero-bg', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, el);
    // gsap ya dejó el estado inicial inline: se retira el ocultamiento previo (CSS)
    document.documentElement.removeAttribute('data-hero-prep');
    linkToNextSection(el);
  }, [done, ready]);

  /**
   * Transición hero ↔ Origen (modo 'momentos'): al empezar a bajar desde el hero, la página
   * se desliza sola, completa, hasta el inicio de Origen; al empezar a subir desde ahí,
   * vuelve sola arriba. Scroll lineal (sin superponer secciones).
   */
  const linkToNextSection = (el: HTMLElement) => {
    const next = el.nextElementSibling?.querySelector<HTMLElement>('section') ?? null;
    if (SCENE_MODE !== 'momentos' || !next) return;
    const nextTop = () => next.getBoundingClientRect().top + window.scrollY;
    const go = (y: number) => scroll.scrollToY(y, MOMENT_DURATION);
    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${nextTop()}`,
      onUpdate: (self) => {
        if (scroll.state.autoScrolling) return;
        const p = self.progress;
        if (self.direction > 0 && p > 0.03 && p < 0.97) go(nextTop());
        else if (self.direction < 0 && p < 0.97 && p > 0.03) go(0);
      },
    });
  };

  /**
   * El primer video se muestra quieto, en su primer cuadro, apenas carga: es idéntico a la
   * imagen de fondo, así que el cambio no se ve y al darle play la imagen empieza a moverse.
   * Sin fundido: mezclar un video en movimiento con la imagen quieta deja una imagen doble.
   */
  const onFirstFrame = (i: number) => {
    if (i === 0 && cur.current === 0) setVisible(true);
  };

  const onPlaying = (i: number) => {
    // Al entrar con fundido, `playing` llega antes de que `current` cambie: la precarga no
    // depende de esa condición
    if (i === cur.current) setVisible(true);
    // Mientras se ve el actual, se precargan los dos siguientes (un video corto no da
    // tiempo a que cargue el que viene después)
    for (const step of [1, 2]) {
      const el = videoEl((i + step) % videos.length);
      if (el && el !== videoEl(i) && el.preload !== 'auto') {
        el.preload = 'auto';
        el.load();
      }
    }
  };

  /** Arranca el siguiente un poco antes de que termine el actual, para el fundido cruzado. */
  const onTime = (i: number) => {
    if (videos.length < 2 || i !== cur.current || switching.current) return;
    const v = videoEl(i)!;
    const limit = videos[i].seconds ?? v.duration;
    if (Number.isFinite(limit) && v.currentTime >= limit - HERO.fade) next(i);
  };

  const next = (i: number) => {
    if (videos.length < 2 || i !== cur.current || switching.current) return;
    switching.current = true;
    const n = (i + 1) % videos.length;
    const curEl = videoEl(i)!;
    const nextEl = videoEl(n)!;
    let finished = false;
    const start = () =>
      nextEl.play().then(
        () => finish(true),
        () => finish(false),
      );
    const finish = (ok: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      nextEl.removeEventListener('canplaythrough', start);
      if (!ok) {
        // El siguiente no cargó (link caído o red lenta): se repite el actual
        nextEl.pause();
        curEl.currentTime = 0;
        curEl.play().catch(() => {});
        switching.current = false;
        return;
      }
      setPrevious(i);
      cur.current = n;
      setCurrent(n);
      // Cuando termina el fundido, el anterior se oculta y se detiene
      clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => {
        setPrevious(-1);
        curEl.pause();
        switching.current = false;
      }, HERO.fade * 1000);
    };
    const guard = setTimeout(() => finish(false), 5000);
    nextEl.currentTime = 0;
    // Solo arranca cuando ya tiene cargado lo suficiente para no trabarse en el fundido
    if (nextEl.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) start();
    else nextEl.addEventListener('canplaythrough', start, { once: true });
  };

  return (
    <section
      ref={host}
      id="inicio"
      class="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-palta text-niebla"
      aria-labelledby="hero-title"
    >
      {/* Fondo: cadena de hasta 4 videos con fundido (config/media.config.ts) */}
      <div class="hero-bg absolute inset-0 -z-10 scale-110">
        <img
          src={asset(HERO.poster)}
          alt=""
          fetchpriority="high"
          sizes="100vw"
          class="absolute inset-0 h-full w-full object-cover"
        />
        {showVideo &&
          videos.map((v, i) => (
            <video
              key={i}
              class={`hero-video absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out will-change-[opacity] ${
                !(i === current && visible) && i !== previous ? 'opacity-0' : ''
              }`}
              style={{
                transitionDuration: `${previous === -1 ? 0 : HERO.fade}s`,
                zIndex: i === current ? 2 : 1,
              }}
              muted
              playsInline
              loop={videos.length === 1}
              preload={i === 0 ? 'auto' : 'none'}
              disablePictureInPicture
              aria-hidden="true"
              onLoadedData={() => onFirstFrame(i)}
              onPlaying={() => onPlaying(i)}
              onTimeUpdate={() => onTime(i)}
              onEnded={() => next(i)}
            >
              {v.webm && <source src={v.webm} type="video/webm" />}
              {v.mp4 && <source src={v.mp4} type="video/mp4" />}
            </video>
          ))}
      </div>
      {/* Capa oscura para legibilidad */}
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-palta-deep/70 via-palta/55 to-palta-deep/85"></div>

      <div class="container-page flex flex-col items-center pt-24 pb-32 text-center [@media(max-height:720px)]:pt-20 [@media(max-height:720px)]:pb-28">
        {/* Extrabold y una sombra suave: sobre el video el titular no se pierde */}
        <h1
          id="hero-title"
          class="max-w-[14ch] text-hero leading-[0.92] font-extrabold [@media(max-height:720px)]:text-[clamp(2.5rem,min(9.6vw,13svh),9.5rem)]"
        >
          <span class="sr-only">{t('title')}</span>
          <span aria-hidden="true">
            {words.map((w, i) => (
              /* el espacio entre palabras va como margen repartido a ambos lados (japonés no lleva
                 espacios): así la última palabra de cada línea no arrastra un margen sobrante y
                 las líneas quedan centradas de verdad. La máscara deja aire arriba y abajo para
                 tildes y descendentes (p, g, comas) y lo compensa con margen negativo */
              <span
                key={i}
                class="-mt-[0.06em] -mb-[0.08em] inline-block overflow-hidden pt-[0.06em] pb-[0.16em] align-bottom"
                style={{ marginInline: spaced ? '0.12em' : '0' }}
              >
                <span class="word inline-block">{w}</span>
              </span>
            ))}
          </span>
        </h1>
        <p class="hero-fade mt-8 max-w-[40rem] text-lg text-balance text-niebla/85">
          {t('subtitle')}
        </p>
        <div class="hero-fade mt-10 flex flex-col gap-3 sm:flex-row">
          <button type="button" class="btn-primary" onClick={() => openQuote()}>
            {t('ctaQuote')}
          </button>
          <a
            href="#productos"
            class="btn-ghost hover:!bg-white/10"
            onClick={(e) => {
              e.preventDefault();
              scroll.scrollTo('#productos');
            }}
          >
            {t('ctaProducts')}
          </a>
        </div>
      </div>

      {/* Indicador de scroll */}
      <button
        type="button"
        class="hero-fade absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-sm text-niebla/80"
        onClick={() => scroll.scrollTo('#origen')}
      >
        {t('scroll')}
        <span class="scroll-cue relative block h-12 w-px overflow-hidden bg-niebla/25" aria-hidden="true">
          <span class="absolute inset-0 bg-niebla"></span>
        </span>
      </button>
    </section>
  );
}
