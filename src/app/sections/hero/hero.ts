import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective, translateSignal } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO } from '../../core/config/media.config';
import { MOMENT_DURATION, SCENE_MODE } from '../../core/config/scroll.config';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { UiStateService } from '../../core/services/ui-state.service';

/** Espera antes de arrancar el video del hero (la página ya muestra la imagen). */
const VIDEO_DELAY_MS = 100;

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styles: `
    .scroll-cue span {
      animation: cue 1.8s var(--ease-out-soft) infinite;
    }
    @keyframes cue {
      0% {
        transform: translateY(-100%);
      }
      60%,
      100% {
        transform: translateY(100%);
      }
    }
  `,
})
export class HeroComponent {
  protected readonly media = HERO;
  /** Máximo 3 videos con fuente válida. */
  protected readonly videos = HERO.videos.filter((v) => v.mp4 || v.webm).slice(0, 4);
  protected readonly ui = inject(UiStateService);
  private readonly scroll = inject(SmoothScrollService);

  /** El titular se divide en palabras para la entrada palabra por palabra. */
  private readonly title = translateSignal('hero.title');
  protected readonly spaced = computed(() => this.title().includes(' '));
  protected readonly words = computed(() => {
    const title = this.title();
    // Japonés no usa espacios: se anima por carácter para que el titular pueda partirse en líneas
    return title.includes(' ') ? title.split(' ') : Array.from(title);
  });

  /** Si se muestra el video de fondo (si no, queda la imagen). */
  protected readonly showVideo = signal(false);
  /** Video activo de la cadena. */
  protected readonly current = signal(0);
  /** Video que está saliendo: se mantiene visible debajo mientras entra el nuevo. */
  protected readonly previous = signal(-1);
  /** true cuando el primer video ya se reproduce (entra con fundido sobre la imagen). */
  protected readonly visible = signal(false);
  private host!: HTMLElement;
  private switching = false;
  /** El primer video no se reproduce hasta que pasa la espera inicial. */
  private started = false;
  private startTimer?: ReturnType<typeof setTimeout>;
  private fadeTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.host = host;
    const zone = inject(NgZone);
    let ctx: gsap.Context | undefined;
    let io: IntersectionObserver | undefined;
    const ready = signal(false);
    let played = false;

    afterNextRender(() => {
      // Video en todos los tamaños, salvo con "reducir movimiento" o modo ahorro de datos
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData;
      this.showVideo.set(this.videos.length > 0 && !this.scroll.reducedMotion() && !saveData);
      // Pausa los videos cuando el hero no está a la vista (ahorra batería y CPU)
      io = new IntersectionObserver(([e]) => {
        const v = this.videoEl(this.current());
        if (!v || !this.started) return;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      });
      io.observe(host);
      ready.set(true);
      if (!this.scroll.reducedMotion() && !this.ui.introDone()) {
        // Estado inicial oculto mientras dura el loader
        gsap.set(host.querySelectorAll('.word, .hero-fade'), { opacity: 0 });
      }
    });

    // Entrada del hero: espera a que termine el loader (una sola vez)
    effect(() => {
      if (!this.ui.introDone() || played || !ready()) return;
      played = true;
      // El video arranca 1 s después de mostrarse la página, desde el inicio,
      // para que no se vea "empezado" cuando aparece sobre la imagen
      this.startTimer = setTimeout(() => this.startVideo(), VIDEO_DELAY_MS);
      if (this.scroll.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
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
            scrollTrigger: { trigger: host, start: 'top top', end: 'bottom top', scrub: true },
          });
        }, host);
        this.linkToNextSection(host);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      ctx?.revert();
      io?.disconnect();
      clearTimeout(this.fadeTimer);
      clearTimeout(this.startTimer);
    });
  }

  private startVideo(): void {
    const v = this.videoEl(0);
    if (!v) return;
    this.started = true;
    v.currentTime = 0;
    v.play().catch(() => {});
  }

  /**
   * Transición hero ↔ Origen (modo 'momentos'): al empezar a bajar desde el hero, la página
   * se desliza sola, completa, hasta el inicio de Origen; al empezar a subir desde ahí,
   * vuelve sola arriba. Scroll lineal (sin superponer secciones).
   */
  private linkToNextSection(host: HTMLElement): void {
    const next = host.nextElementSibling?.querySelector<HTMLElement>('section') ?? null;
    if (SCENE_MODE !== 'momentos' || !next) return;
    const nextTop = () => next.getBoundingClientRect().top + window.scrollY;
    const go = (y: number) => this.scroll.scrollToY(y, MOMENT_DURATION);
    ScrollTrigger.create({
      trigger: host,
      start: 'top top',
      end: () => `+=${nextTop()}`,
      onUpdate: (self) => {
        if (this.scroll.autoScrolling) return;
        const p = self.progress;
        if (self.direction > 0 && p > 0.03 && p < 0.97) go(nextTop());
        else if (self.direction < 0 && p < 0.97 && p > 0.03) go(0);
      },
    });
  }

  private videoEl(i: number): HTMLVideoElement | undefined {
    return this.host.querySelectorAll<HTMLVideoElement>('.hero-video')[i];
  }

  protected onPlaying(i: number): void {
    if (i !== this.current()) return;
    this.visible.set(true);
    // Mientras se ve el actual, se precarga el siguiente
    const nextEl = this.videoEl((i + 1) % this.videos.length);
    if (nextEl && nextEl !== this.videoEl(i) && nextEl.preload !== 'auto') {
      nextEl.preload = 'auto';
      nextEl.load();
    }
  }

  /** Arranca el siguiente un poco antes de que termine el actual, para el fundido cruzado. */
  protected onTime(i: number): void {
    if (this.videos.length < 2 || i !== this.current() || this.switching) return;
    const v = this.videoEl(i)!;
    const limit = this.videos[i].seconds ?? v.duration;
    if (Number.isFinite(limit) && v.currentTime >= limit - this.media.fade) this.next(i);
  }

  protected next(i: number): void {
    if (this.videos.length < 2 || i !== this.current() || this.switching) return;
    this.switching = true;
    const n = (i + 1) % this.videos.length;
    const curEl = this.videoEl(i)!;
    const nextEl = this.videoEl(n)!;
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(guard);
      if (!ok) {
        // El siguiente no cargó (link caído o red lenta): se repite el actual
        nextEl.pause();
        curEl.currentTime = 0;
        curEl.play().catch(() => {});
        this.switching = false;
        return;
      }
      this.previous.set(i);
      this.current.set(n);
      // Cuando termina el fundido, el anterior se oculta y se detiene
      clearTimeout(this.fadeTimer);
      this.fadeTimer = setTimeout(() => {
        this.previous.set(-1);
        curEl.pause();
        this.switching = false;
      }, this.media.fade * 1000);
    };
    const guard = setTimeout(() => finish(false), 5000);
    nextEl.currentTime = 0;
    nextEl.play().then(
      () => finish(true),
      () => finish(false),
    );
  }

  protected goToProducts(event: Event): void {
    event.preventDefault();
    this.scroll.scrollTo('#productos');
  }

  protected goNext(): void {
    this.scroll.scrollTo('#origen');
  }
}
