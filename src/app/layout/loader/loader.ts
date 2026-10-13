import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { UiStateService } from '../../core/services/ui-state.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import {
  BUTTERFLY_BODY,
  SEED_CRACK,
  SEED_LEFT,
  SEED_RIGHT,
  WING_LEFT,
  WING_RIGHT,
} from './loader-art';

gsap.registerPlugin(MotionPathPlugin);

const SESSION_KEY = 'intro-seen';
const GLINTS = 10;

/**
 * Intro de marca (≈3,7 s, solo la primera visita de la sesión):
 * la semilla se asienta, se agrieta y se abre con luz; sale una mariposa que vuela
 * hasta el sol del logo en el header y se funde con él; luego entra la página.
 *
 * Todo es un único timeline de GSAP con pasos solapados (sin esperas muertas), solo
 * anima transform/opacity (GPU) y corre fuera de Angular. Botón "Saltar" siempre visible.
 * Con prefers-reduced-motion no se muestra.
 */
@Component({
  selector: 'app-loader',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class LoaderComponent {
  protected readonly visible = signal(false);
  protected readonly glints = Array.from({ length: GLINTS }, (_, i) => i);

  private readonly ui = inject(UiStateService);
  private readonly scroll = inject(SmoothScrollService);
  private tl?: gsap.core.Timeline;
  private flap?: gsap.core.Timeline;
  private ctx?: gsap.Context;
  private finished = false;

  constructor() {
    const zone = inject(NgZone);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* almacenamiento no disponible */
    }

    if (seen || this.scroll.reducedMotion()) {
      this.ui.introDone.set(true);
      return;
    }

    this.visible.set(true);
    afterNextRender(() => {
      this.scroll.stop();
      // Arte estático propio → innerHTML directo (Angular sanitizaría el SVG)
      const fill = (sel: string, html: string) => {
        const el = host.querySelector<SVGElement>(sel);
        if (el) el.innerHTML = html;
      };
      fill('.svg-seed-l', SEED_LEFT);
      fill('.svg-seed-r', SEED_RIGHT);
      fill('.svg-crack', SEED_CRACK);
      fill('.svg-wing-l', WING_LEFT); // ya viene reflejada
      fill('.svg-wing-r', WING_RIGHT);
      fill('.svg-body', BUTTERFLY_BODY);

      zone.runOutsideAngular(() => {
        this.ctx = gsap.context(() => (this.tl = this.build(host)), host);
      });
    });

    inject(DestroyRef).onDestroy(() => this.ctx?.revert());
  }

  /** Botón "Saltar": termina de inmediato y deja la página en su estado final. */
  protected skip(): void {
    this.finish(true);
  }

  private build(host: HTMLElement): gsap.core.Timeline {
    const q = gsap.utils.selector(host);
    const symbol = document.querySelector<HTMLElement>('[data-brand-symbol]');
    const headerBits = document.querySelectorAll<HTMLElement>('[data-intro-fade]');

    // Estado inicial: el logo del header espera a la mariposa
    gsap.set(headerBits, { autoAlpha: 0 });
    gsap.set(symbol, {
      autoAlpha: 0,
      scale: 0.6,
      filter: 'drop-shadow(0 0 0px rgba(242,163,58,0))',
    });
    gsap.set(q('.wing-r'), { rotationY: 84 });
    gsap.set(q('.wing-l'), { rotationY: -84 });
    gsap.set(q('.bf'), { autoAlpha: 0, scale: 0.3, y: 30 });

    // Aleteo continuo (se pausa/reanuda desde el timeline principal)
    const flap = (this.flap = gsap
      .timeline({ paused: true, repeat: -1 })
      .to(
        q('.wing-r'),
        { rotationY: 68, duration: 0.15, ease: 'sine.inOut', yoyo: true, repeat: 1 },
        0,
      )
      .to(
        q('.wing-l'),
        { rotationY: -68, duration: 0.15, ease: 'sine.inOut', yoyo: true, repeat: 1 },
        0,
      ));

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => this.finish(false),
    });

    // 1 · La semilla cae suave y se asienta (con su sombra)
    tl.fromTo(
      q('.seed'),
      { autoAlpha: 0, y: -24, scale: 0.92 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)' },
      0,
    )
      .fromTo(
        q('.shadow'),
        { autoAlpha: 0, scaleX: 0.5 },
        { autoAlpha: 1, scaleX: 1, duration: 0.7 },
        0,
      )

      // 2 · Late una vez y se agrieta
      .to(
        q('.seed'),
        { keyframes: { rotation: [0, -2.5, 2.5, -1, 0] }, duration: 0.5, ease: 'sine.inOut' },
        0.55,
      )
      .to(q('.crack-path'), { strokeDashoffset: 0, duration: 0.45, ease: 'power2.inOut' }, 0.6)

      // 3 · Se abre en dos mitades y sale luz
      .addLabel('open', 1.0)
      .to(q('.crack'), { autoAlpha: 0, duration: 0.15 }, 'open')
      .to(q('.half-l'), { x: -16, rotation: -18, duration: 0.8, ease: 'expo.out' }, 'open')
      .to(q('.half-r'), { x: 16, rotation: 18, duration: 0.8, ease: 'expo.out' }, 'open')
      .fromTo(
        q('.glow'),
        { autoAlpha: 0, scale: 0.5 },
        { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' },
        'open',
      )
      .add(() => this.burst(q('.glint')), 'open+=0.05')

      // 4 · Emerge la mariposa y despliega las alas
      .to(
        q('.bf'),
        { autoAlpha: 1, scale: 1, y: -110, duration: 0.75, ease: 'power3.out' },
        'open+=0.12',
      )
      .to(q('.wing-r'), { rotationY: 0, duration: 0.55, ease: 'back.out(1.7)' }, 'open+=0.4')
      .to(q('.wing-l'), { rotationY: 0, duration: 0.55, ease: 'back.out(1.7)' }, 'open+=0.4')
      .add(() => flap.play(), 'open+=0.9')
      .to(q('.glow'), { autoAlpha: 0.35, duration: 0.5, ease: 'sine.out' }, 'open+=0.6');

    // 5 · Vuela al sol del logo (curva cúbica) mientras el fondo se disuelve
    const target = this.target(symbol);
    tl.addLabel('fly', 'open+=0.85')
      .add(() => flap.timeScale(1.3), 'fly') // aletea más rápido al volar
      .to(
        q('.bf'),
        {
          duration: 1.2,
          ease: 'power2.inOut',
          motionPath: {
            path: [
              { x: 0, y: -110 },
              { x: Math.min(170, window.innerWidth * 0.28), y: -300 },
              { x: target.x * 0.55, y: target.y + 170 },
              { x: target.x, y: target.y },
            ],
            type: 'cubic',
          },
          scale: target.scale,
        },
        'fly',
      )
      // leve balanceo, como si corrigiera el rumbo
      .to(
        q('.bf-inner'),
        { keyframes: { rotation: [0, 14, -10, 6, 0] }, duration: 1.2, ease: 'sine.inOut' },
        'fly',
      )
      .to(
        [q('.seed'), q('.shadow'), q('.glow')],
        { autoAlpha: 0, duration: 0.5, ease: 'power1.out' },
        'fly+=0.1',
      )
      .to(q('.backdrop'), { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut' }, 'fly+=0.35');

    // 6 · Se posa: el sol del logo brilla y entra el resto del header
    tl.addLabel('land', 'fly+=1.2')
      .add(() => flap.pause(0), 'land')
      // la entrada del hero arranca cuando la mariposa se posa (no al final del loader)
      .add(() => this.ui.introDone.set(true), 'land')
      .to(q('.bf'), { autoAlpha: 0, duration: 0.25, ease: 'power1.in' }, 'land-=0.05')
      .to(
        symbol,
        {
          keyframes: [
            {
              autoAlpha: 1,
              scale: 1.08,
              filter: 'drop-shadow(0 0 12px rgba(242,163,58,.8))',
              duration: 0.35,
              ease: 'power2.out',
            },
            {
              scale: 1,
              filter: 'drop-shadow(0 0 0px rgba(242,163,58,0))',
              duration: 0.45,
              ease: 'power2.inOut',
            },
          ],
        },
        'land-=0.1',
      )
      .fromTo(
        headerBits,
        { autoAlpha: 0, y: -6 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 },
        'land+=0.05',
      )
      .to(q('.skip'), { autoAlpha: 0, duration: 0.3 }, 'land');

    return tl;
  }

  /** Desplazamiento (desde el centro de la pantalla) y escala para posarse en el símbolo. */
  private target(symbol: HTMLElement | null): { x: number; y: number; scale: number } {
    if (!symbol) return { x: 0, y: -window.innerHeight / 2, scale: 0.2 };
    const r = symbol.getBoundingClientRect();
    return {
      x: r.left + r.width * 0.5 - window.innerWidth / 2,
      y: r.top + r.height * 0.62 - window.innerHeight / 2,
      scale: Math.max(0.16, (r.height * 0.9) / 120),
    };
  }

  private burst(glints: Element[]): void {
    glints.forEach((g, i) => {
      const dx = gsap.utils.random(-70, 70);
      const dy = gsap.utils.random(-140, -50);
      gsap.fromTo(
        g,
        { autoAlpha: 0, x: 0, y: 0, scale: 0.4 },
        {
          keyframes: [
            {
              autoAlpha: 1,
              x: dx * 0.4,
              y: dy * 0.4,
              scale: 1,
              duration: 0.35,
              ease: 'power2.out',
            },
            {
              autoAlpha: 0,
              x: dx,
              y: dy,
              scale: 0.5,
              duration: gsap.utils.random(0.6, 1),
              ease: 'power1.out',
            },
          ],
          delay: i * 0.035,
        },
      );
    });
  }

  private finish(skipped: boolean): void {
    if (this.finished) return;
    this.finished = true;
    if (skipped) {
      this.tl?.kill();
      this.flap?.kill();
      gsap.set(
        [
          document.querySelector('[data-brand-symbol]'),
          ...document.querySelectorAll('[data-intro-fade]'),
        ],
        { autoAlpha: 1, y: 0, scale: 1, clearProps: 'filter' },
      );
    }
    this.visible.set(false);
    this.scroll.start();
    this.ui.introDone.set(true);
  }
}
