import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
  isDevMode,
  viewChild,
} from '@angular/core';
import { TranslocoDirective, translateSignal } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { MOMENT_DURATION } from '../../core/config/scroll.config';
import { ButterflyComponent } from '../../shared/components/butterfly/butterfly';
import { PhotoPlaceholderComponent } from '../../shared/components/photo-placeholder/photo-placeholder';

gsap.registerPlugin(ScrollTrigger);

/** Escena fija solo en escritorio con altura suficiente y sin "reducir movimiento". */
const SCENE_MQ =
  '(min-width: 1024px) and (min-height: 480px) and (prefers-reduced-motion: no-preference)';
/** Segundos que se ve la pantalla verde con su texto antes de abrirse el círculo. */
const INTRO_HOLD = 1;
/** Segundos que tarda la frase en salir por la izquierda antes de que entre Proceso. */
const SLIDE = 0.6;

/** La escena se reproduce una sola vez por visitante (como la intro de la mariposa). */
const SEEN_KEY = 'vibe-seen';
function sceneSeen(): boolean {
  if (typeof window === 'undefined') return true;
  // En desarrollo (ng serve) o con ?intro en la URL se muestra siempre (una vez por carga)
  if (isDevMode() || new URLSearchParams(location.search).has('intro')) return false;
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

/**
 * Quiénes somos: la CEO, su trayectoria y el mensaje de respaldo legal y asegurado.
 * Cierra con la frase de la marca.
 * Escritorio: escena fija (imán). Al llegar, la vista es verde con un texto por un segundo y
 * luego, sola, un círculo crece desde el centro y "limpia" el verde mostrando la frase con la
 * mariposa. El siguiente scroll (momento) desliza la escena hasta "Del productor a tu almacén".
 * Móvil o movimiento reducido: las palabras pasan de tenues a plenas con el scroll y, al
 * completarse, aparece la mariposa amarilla.
 */
@Component({
  selector: 'app-nosotros',
  imports: [TranslocoDirective, PhotoPlaceholderComponent, ButterflyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="nosotros"
      class="bg-niebla py-24 md:py-36"
      [style.padding-bottom]="scene ? '0' : null"
      aria-labelledby="nosotros-title"
      *transloco="let t; prefix: 'nosotros'"
    >
      <div class="container-page grid gap-14 lg:grid-cols-12">
        <div class="lg:col-span-6">
          <p data-reveal class="text-sm font-semibold tracking-wide text-hoja uppercase">
            {{ t('kicker') }}
          </p>
          <h2
            data-reveal
            id="nosotros-title"
            class="mt-4 text-4xl leading-[1.05] font-bold md:text-5xl xl:text-6xl"
          >
            {{ t('heading') }}
          </h2>
          <p data-reveal class="measure mt-8 text-lg text-palta/80">{{ t('bio') }}</p>
          <blockquote data-reveal class="mt-8 border-s-4 border-mandarina ps-5">
            <p class="font-display text-xl leading-snug font-semibold text-palta md:text-2xl">
              “{{ t('ceoQuote') }}”
            </p>
            <footer class="mt-4 font-display text-lg font-semibold text-palta">
              {{ ceoName }}
              <span class="block text-base font-medium text-palta/70">{{ t('role') }}</span>
            </footer>
          </blockquote>

          <ul data-reveal class="mt-10 grid gap-4">
            @for (k of pillars; track k) {
              <li class="flex gap-4 border-t border-palta/15 pt-4">
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
                <span class="text-palta/85">{{ t('pillars.' + k) }}</span>
              </li>
            }
          </ul>
        </div>

        <div class="lg:col-span-5 lg:col-start-8">
          <!-- TODO: foto real de la CEO -->
          <div
            data-reveal
            class="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-arena"
          >
            <app-photo-placeholder [caption]="ceoName" />
          </div>
          <div data-reveal class="mt-8 grid gap-5 text-palta/80">
            <h3 class="text-2xl font-semibold text-palta md:text-3xl">{{ t('storyTitle') }}</h3>
            @for (k of story; track k) {
              <p>{{ t('story.' + k) }}</p>
            }
          </div>
        </div>
      </div>

      @if (scene) {
        <!-- Escena fija: verde → círculo que limpia y muestra la frase → desliza a Proceso -->
        <div #vibe class="vibe" [style.--n]="words().count">
          <div class="vibe-track" dir="ltr">
            <div class="vibe-panel">
              <div class="vibe-green" aria-hidden="true">
                <p class="vibe-intro font-display font-bold">{{ t('vibeIntro') }}</p>
              </div>
              <div class="vibe-reveal">
                <p class="vibe-quote font-display font-bold" [attr.aria-label]="t('quote')">
                  @for (w of words().parts; track $index) {
                    <span
                      class="qw"
                      [class.qw--space]="w.i < 0"
                      [style.--i]="w.i"
                      aria-hidden="true"
                      >{{ w.text }}</span
                    >
                  }
                </p>
                <app-butterfly class="vibe-bf" aria-hidden="true" />
              </div>
            </div>
            <!-- Mismo verde que Proceso: al terminar de deslizar, Proceso entra por la derecha -->
            <div class="vibe-panel vibe-next" aria-hidden="true"></div>
          </div>
        </div>
      } @else {
        <!-- Frase de la marca: cada palabra se llena con el scroll -->
        <figure class="quote-band container-page" #band [style.--n]="words().count">
          <blockquote>
            <p class="quote-text font-display font-bold" [attr.aria-label]="t('quote')">
              @for (w of words().parts; track $index) {
                <span class="qw" [class.qw--space]="w.i < 0" [style.--i]="w.i" aria-hidden="true">{{
                  w.text
                }}</span>
              }
            </p>
          </blockquote>
          <app-butterfly class="quote-bf" />
        </figure>
      }
    </section>
  `,
  styles: `
    /* ---------- Escena fija (escritorio) ---------- */
    .vibe {
      --p: 1; /* avance de llenado de la frase; completa mientras la escena se reproduce */
      position: relative;
      height: 100vh;
      height: 100svh;
      margin-top: 7rem;
      overflow: hidden;
    }
    .vibe-track {
      display: flex;
      width: 200%;
      height: 100%;
      will-change: transform;
    }
    .vibe-panel {
      position: relative;
      display: grid;
      place-items: center;
      width: 50%;
      height: 100%;
      overflow: hidden;
    }
    .vibe-green,
    .vibe-reveal {
      position: absolute;
      inset: 0;
    }
    .vibe-green {
      display: grid;
      place-items: center;
      background: var(--color-palta);
    }
    .vibe-intro {
      padding-inline: 1.5rem;
      text-align: center;
      font-size: clamp(1.75rem, min(4vw, 8svh), 3.5rem);
      line-height: 1.1;
      color: var(--color-niebla);
    }
    /* El círculo que crece deja ver, "limpiando" el verde, la frase sobre fondo claro */
    .vibe-reveal {
      display: grid;
      place-content: center;
      justify-items: center;
      background: var(--color-niebla);
      clip-path: circle(0% at 50% 50%);
    }
    .vibe-quote {
      max-width: 20ch;
      padding-inline: 1.5rem;
      text-align: center;
      font-size: clamp(2rem, min(6vw, 11svh), 5.25rem);
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: var(--color-palta);
    }
    .vibe-bf {
      display: block;
      width: clamp(2.25rem, 7svh, 3.25rem);
      margin-top: clamp(1rem, 3svh, 2rem);
    }
    .vibe-next {
      background: var(--color-palta);
      color: var(--color-niebla);
    }
    /* Ya reproducida: un bloque normal con la frase, como la banda original */
    .vibe.is-done {
      height: auto;
      margin-top: 5rem;
      padding-block: 3.5rem 4.5rem;
      border-top: 1px solid rgb(30 59 47 / 0.15);
    }
    .is-done .vibe-track {
      display: block;
      width: 100%;
    }
    .is-done .vibe-panel {
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .is-done .vibe-green,
    .is-done .vibe-next {
      display: none;
    }
    .is-done .vibe-reveal {
      position: static;
      clip-path: none;
      background: none;
    }
    /* Ya reproducida: la mariposa llega cuando la frase está completa (como en .quote-bf) */
    .is-done .vibe-bf {
      opacity: clamp(0, calc(var(--p) * 5 - 3), 1);
      transform: translateY(calc((1 - clamp(0, calc(var(--p) * 5 - 3), 1)) * -2.5rem))
        rotate(calc((1 - clamp(0, calc(var(--p) * 5 - 3), 1)) * 25deg));
    }

    .quote-band {
      position: relative;
      margin-top: 7rem;
      padding-top: 4.5rem;
      border-top: 1px solid rgb(30 59 47 / 0.15);
      text-align: center;
      --p: 1; /* avance del scroll (0–1); sin animación queda completa */
    }
    .quote-text {
      max-width: 20ch;
      margin-inline: auto;
      font-size: clamp(2.4rem, 6vw, 5.25rem);
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: var(--color-palta);
    }
    /* Cada palabra pasa de tenue a plena según el avance (n = palabras, i = posición) */
    .qw {
      opacity: clamp(0.14, calc(var(--p) * (var(--n) + 3) - var(--i)), 1);
      transition: opacity 0.15s linear;
    }
    .qw--space {
      opacity: 1;
    }
    /* La mariposa llega cuando la frase está completa */
    .quote-bf {
      display: block;
      width: 3.25rem;
      margin: 2rem auto 0;
      opacity: clamp(0, calc(var(--p) * 5 - 3), 1);
      transform: translateY(calc((1 - clamp(0, calc(var(--p) * 5 - 3), 1)) * -2.5rem))
        rotate(calc((1 - clamp(0, calc(var(--p) * 5 - 3), 1)) * 25deg));
    }
  `,
})
export class NosotrosComponent {
  protected readonly ceoName = 'Melanie Calderón Vega';
  protected readonly pillars = ['contracts', 'insurance', 'credit'] as const;
  protected readonly story = ['p1', 'p2', 'p3'] as const;

  private readonly quote = translateSignal('nosotros.quote');
  /**
   * La frase dividida en palabras (Intl.Segmenter también separa chino y japonés).
   * `i` es la posición de cada palabra; los espacios llevan -1.
   */
  protected readonly words = computed(() => {
    const text = this.quote();
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
  });

  /** true si se usa la escena fija (se decide al cargar; si ya se vio, va la frase simple). */
  protected readonly scene =
    typeof window !== 'undefined' && window.matchMedia(SCENE_MQ).matches && !sceneSeen();

  /** Llenado palabra por palabra de la frase una vez reproducida la escena. */
  private fill?: ScrollTrigger;
  private offNav?: () => void;
  private readonly band = viewChild<ElementRef<HTMLElement>>('band');
  private readonly vibe = viewChild<ElementRef<HTMLElement>>('vibe');

  constructor() {
    const zone = inject(NgZone);
    const scroll = inject(SmoothScrollService);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let st: ScrollTrigger | undefined;
    let ctx: gsap.Context | undefined;
    afterNextRender(() => {
      if (scroll.reducedMotion()) return;
      const vibe = this.vibe()?.nativeElement;
      if (vibe) {
        zone.runOutsideAngular(() => {
          ctx = gsap.context(() => this.buildScene(vibe, scroll), host);
        });
        return;
      }
      const band = this.band()?.nativeElement;
      if (!band) return;
      zone.runOutsideAngular(() => {
        band.style.setProperty('--p', '0');
        st = ScrollTrigger.create({
          trigger: band,
          start: 'top 80%',
          end: 'bottom 55%',
          scrub: 0.4,
          onUpdate: (self) => band.style.setProperty('--p', self.progress.toFixed(3)),
        });
      });
    });
    inject(DestroyRef).onDestroy(() => {
      st?.kill();
      this.fill?.kill();
      this.offNav?.();
      ctx?.revert();
    });
  }

  /**
   * Escena fija con imán: al acercarse, la página se acomoda sola en la escena y queda fija.
   * El scroll solo cambia de momento (cada uno se reproduce completo): verde → círculo → lateral.
   */
  private buildScene(vibe: HTMLElement, scroll: SmoothScrollService): void {
    const q = gsap.utils.selector(vibe);
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
      !!scroll.navTarget && !vibe.closest('section')?.contains(scroll.navTarget);
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
     * Entrada a la escena (bajando o subiendo desde Proceso): siempre la misma secuencia, verde
     * con "Lo que nos mueve" y luego el círculo que abre "Vibrance es una empresa…". Solo si la
     * escena está a la vista (con medidas desfasadas el aviso puede llegar antes de tiempo).
     */
    const start = () => {
      if (!inView()) return;
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
      if (!proceso || !pin || scroll.autoScrolling) return unlock();
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
      tl.kill();
      // Queda como al inicio: la frase con poco aire arriba y abajo (ver .vibe.is-done)
      gsap.set(q('.vibe-track, .vibe-reveal, .vibe-intro, .vibe-quote, .vibe-bf'), {
        clearProps: 'all',
      });
      vibe.classList.add('is-done');
      vibe.style.setProperty('--p', '0');
      this.fill = ScrollTrigger.create({
        trigger: vibe,
        start: 'top 80%',
        end: 'bottom 55%',
        scrub: 0.4,
        onUpdate: (self) => vibe.style.setProperty('--p', self.progress.toFixed(3)),
      });
      ScrollTrigger.refresh();
      vibe.style.setProperty('--p', this.fill.progress.toFixed(3));
    };
    let lastY = window.scrollY;
    const st = ScrollTrigger.create({
      trigger: vibe,
      start: 'top top',
      end: () => `+=${window.innerHeight}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Al llegar: verde con texto, y el círculo se abre solo (sin scroll)
      onEnter: () => !passing() && start(),
      // Si se vuelve sin haberla visto, empieza igual que al bajar
      onEnterBack: () => !passing() && start(),
      // Al salir por arriba se reinicia, para que la próxima vez vuelva a empezar en verde
      onLeaveBack: () => !passing() && go(0),
      // El siguiente scroll (momento) desliza hasta Proceso
      onUpdate: (self) => {
        // Se decide por lo que realmente se movió la página: un recálculo de posiciones (al
        // liberar el scroll) no cuenta como bajar y no debe llevar solo a Proceso
        const dy = window.scrollY - lastY;
        lastY = window.scrollY;
        if (passing() || !inView() || dy === 0) return;
        go(dy > 0 && self.progress >= 0.35 ? 2 : 1);
      },
    });

    // Imán: al acercarse a la escena bajando, la página se acomoda sola en ella
    const magnet = ScrollTrigger.create({
      trigger: vibe,
      start: 'top 75%',
      end: 'top top',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (scroll.autoScrolling || self.direction < 0) return;
        if (self.progress < 0.05 || self.progress > 0.97) return;
        scroll.scrollToY(st.start, MOMENT_DURATION);
      },
    });

    // Si se llega por el menú a una sección posterior, la escena cuenta como ya reproducida:
    // al subir solo se ve su forma estática (se aplica con la pantalla tapada por el fundido)
    this.offNav = scroll.onNavigate((el) => {
      const section = vibe.closest('section');
      if (
        section &&
        !section.contains(el) &&
        vibe.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        release();
      }
    });
  }
}
