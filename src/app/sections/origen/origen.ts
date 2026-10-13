import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { TranslocoDirective, TranslocoPipe, translateObjectSignal } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DESTINATIONS } from '../../data/destinos.data';
import { productsForMarket } from '../../data/mercados.data';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { MapPeruComponent } from '../../shared/components/map-peru/map-peru';
import { BasketComponent } from '../../shared/components/basket/basket';
import { ButterflyComponent } from '../../shared/components/butterfly/butterfly';
import { FruitIconComponent } from '../../shared/components/fruit-icon/fruit-icon';
import { UiStateService } from '../../core/services/ui-state.service';
import type { ProductId } from '../../data/productos.data';
import { MOMENT_DURATION, SCENE_MODE } from '../../core/config/scroll.config';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/** Escena fija solo en escritorio con altura suficiente y sin "reducir movimiento" (ver origen.css). */
const SCENE_MQ =
  '(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)';

/**
 * Ritmo de la parte fija (en unidades de la línea de tiempo):
 * cada momento tarda MOVE en ocurrir y luego la escena "descansa" HOLD sin cambios.
 */
const MOVE = 1;
const HOLD = SCENE_MODE === 'pausas' ? 0.7 : 0;

/**
 * Qué fruta aporta cada región a la cesta cuando se marca en el mapa
 * (cada región aporta al menos una; entre todas completan las 6).
 */
const DELIVERY: [string, ProductId[]][] = [
  ['piura', ['mango']],
  ['la_libertad', ['arandano', 'palta']],
  ['junin', ['kion']],
  ['ica', ['uva']],
  ['lima', ['mandarina']],
];
/** Duración del vuelo de cada fruta (en unidades de la línea de tiempo). */
const FLIGHT = 0.42;

/**
 * Recorridos de las mariposas viajeras (lienzo de 1440 × 900 que cubre la sección).
 * Entran y salen por los bordes, por fuera del contenido: entre el título y el mapa, arriba a
 * la derecha, abajo a la derecha y abajo a la izquierda.
 */
const TRAILS = [
  'M-40 250C110 205 300 196 470 200S700 190 760 120S800 40 820 -40',
  'M940 -40C980 120 1100 150 1220 160S1400 210 1480 250',
  'M1150 940C1220 858 1290 806 1370 770S1450 712 1490 700',
  'M-40 800C30 836 80 880 120 940',
];
/** Segundos que tarda cada viajera en cruzar y pausa antes de volver a salir. */
const TRAVEL = 9;
const TRAVEL_REST = 5;

/**
 * Origen ⭐ escena fija con 4 momentos (una frase por momento).
 * 1. (al entrar) Aparece el Perú y la mariposa llega volando con la cesta Vibrance vacía.
 * 2. Aparecen las frutas en sus regiones.
 * 3. De cada región sale su fruta y entra en la cesta.
 * 4. La mariposa se lleva la cesta y aparece "Dónde puede llegar" con los botones de acción.
 * Cómo avanza la parte fija se elige en core/config/scroll.config.ts (SCENE_MODE).
 */
@Component({
  selector: 'app-origen',
  imports: [
    TranslocoDirective,
    TranslocoPipe,
    MapPeruComponent,
    BasketComponent,
    ButterflyComponent,
    FruitIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './origen.html',
  styleUrl: './origen.css',
})
export class OrigenComponent {
  /** Mercados con cuántos productos tienen acceso (panel "Dónde puede llegar"). */
  protected readonly markets = DESTINATIONS.map((d) => ({
    id: d.id,
    products: productsForMarket(d.id).length,
  })).filter((m) => m.products > 0);
  protected readonly lines = translateObjectSignal('origen.lines') as unknown as () => string[];
  protected readonly scroll = inject(SmoothScrollService);
  protected readonly ui = inject(UiStateService);
  protected readonly flyers = DELIVERY.flatMap(([, fruits]) => fruits);
  protected readonly trails = TRAILS;
  /** true si se usa la escena fija (se decide al cargar). */
  protected readonly scene = typeof window !== 'undefined' && window.matchMedia(SCENE_MQ).matches;

  private readonly map = viewChild.required(MapPeruComponent);
  private readonly basket = viewChild.required(BasketComponent);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      if (this.scroll.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          if (!this.scene) {
            // Móvil: cada línea de la historia pasa de tenue a plena con el scroll
            gsap.fromTo(
              '.story-line',
              { opacity: 0.15 },
              {
                opacity: 1,
                ease: 'none',
                stagger: 0.5,
                scrollTrigger: {
                  trigger: '.story',
                  start: 'top 75%',
                  end: 'bottom 45%',
                  scrub: 0.6,
                },
              },
            );
            return;
          }
          this.buildScene(host);
          this.buildTravelers(host);
        }, host);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      ctx?.revert();
    });
  }

  protected goToProducts(event: Event): void {
    event.preventDefault();
    this.scroll.scrollTo('#productos');
  }

  /**
   * Devuelve una función que agrega a la línea de tiempo el vuelo de una fruta: sale del
   * marcador de su región en el mapa, hace un arco y entra en la cesta, donde se queda.
   * Las posiciones se calculan al reproducirse (sirven aunque cambie el tamaño de pantalla).
   */
  private flightFactory(host: HTMLElement) {
    const map = this.map();
    const basket = this.basket();
    const stage = host.querySelector<HTMLElement>('.origen-stage')!;
    const center = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      return { x: r.left + r.width / 2 - s.left, y: r.top + r.height / 2 - s.top, w: r.width };
    };
    return (tl: gsap.core.Timeline, zone: string, fruit: ProductId, at: number) => {
      const el = host.querySelector<HTMLElement>(`.flyer[data-id="${fruit}"]`)!;
      const target = basket.fruitEl(fruit);
      const from = () => center(map.markerEl(zone));
      const to = () => center(target);
      const size = () => to().w;
      tl.set(
        el,
        {
          autoAlpha: 1,
          width: size,
          height: size,
          x: () => from().x - size() / 2,
          y: () => from().y - size() / 2,
          scale: 0.55,
          rotation: 0,
        },
        at,
      )
        .to(el, { x: () => to().x - size() / 2, duration: FLIGHT, ease: 'power1.inOut' }, at)
        .to(
          el,
          {
            y: () => Math.min(from().y, to().y) - 110 - size() / 2,
            duration: FLIGHT * 0.45,
            ease: 'power2.out',
          },
          at,
        )
        .to(el, { y: () => to().y - size() / 2, duration: FLIGHT * 0.55, ease: 'power2.in' }, '>')
        .to(el, { scale: 1, rotation: 360, duration: FLIGHT, ease: 'power1.out' }, at)
        // Al llegar, la fruta queda dentro de la cesta (detrás del borde delantero)
        .set(el, { autoAlpha: 0 }, at + FLIGHT)
        .set(target, { autoAlpha: 1 }, at + FLIGHT);
    };
  }

  /**
   * Mariposas viajeras: cada una cruza la escena por su recorrido dejando una estela punteada
   * que luego se desvanece, y vuelve a salir tras una pausa. Solo se mueven con la sección a la vista.
   */
  private buildTravelers(host: HTMLElement): void {
    const q = gsap.utils.selector(host);
    const trails = Array.from(host.querySelectorAll<SVGPathElement>('.trail'));
    const reveals = q('.trail-reveal');
    const travelers = q('.traveler');
    const all = gsap.timeline({ paused: true });
    trails.forEach((trail, i) => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: TRAVEL_REST + i, delay: 1.5 + i * 3.2 });
      tl.set(travelers[i], { autoAlpha: 1 })
        .to(
          travelers[i],
          {
            motionPath: {
              path: trail,
              align: trail,
              alignOrigin: [0.5, 0.5],
              autoRotate: 90,
            },
            duration: TRAVEL,
            ease: 'sine.inOut',
          },
          0,
        )
        .to(reveals[i], { strokeDashoffset: 0, duration: TRAVEL, ease: 'sine.inOut' }, 0)
        .set(travelers[i], { autoAlpha: 0 })
        .to(trail, { opacity: 0, duration: 1.6, ease: 'power1.in' }, '+=0.6')
        .set(reveals[i], { strokeDashoffset: 1 })
        .set(trail, { opacity: 1 });
      all.add(tl, 0);
    });
    ScrollTrigger.create({
      trigger: host,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? all.play() : all.pause()),
    });
  }

  /** Arma la escena fija. */
  private buildScene(host: HTMLElement): void {
    const map = this.map();
    const basket = this.basket();
    const q = gsap.utils.selector(host);
    const lines = q('.story-line');
    const fills = q('.beat-fill');

    map.prepare();
    basket.prepare();
    gsap.set(lines, { autoAlpha: 0, y: 16 });
    gsap.set(fills, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(q('.markets'), { autoAlpha: 0, y: 24 });
    gsap.set(q('.market, .origen-cta'), { autoAlpha: 0, y: 10 });

    /** Cambia la frase visible y llena la barrita del momento. */
    const showLine = (tl: gsap.core.Timeline, i: number, at: number | string) => {
      if (i > 0) tl.to(lines[i - 1], { autoAlpha: 0, y: -16, duration: 0.15 }, at);
      tl.to(lines[i], { autoAlpha: 1, y: 0, duration: 0.2 }, i > 0 ? '>-0.05' : at).to(
        fills[i],
        { scaleX: 1, duration: 0.2 },
        '<',
      );
    };

    // Momento 1: al entrar aparece el Perú y llega la mariposa con la cesta vacía (una sola vez)
    const intro = gsap.timeline({
      scrollTrigger: {
        trigger: host,
        start: SCENE_MODE === 'libre' ? 'top 85%' : 'top 60%',
        once: true,
      },
    });
    // En modo libre la primera frase la muestra la escena misma (sigue al scroll)
    if (SCENE_MODE !== 'libre') showLine(intro, 0, 0);
    intro
      .add(map.phase(0), 0)
      .fromTo(
        q('.carrier'),
        { x: () => window.innerWidth * 0.55, y: () => -window.innerHeight * 0.45, rotation: -10 },
        { x: 0, y: 0, rotation: 0, duration: 1.8, ease: 'power3.out' },
        0.2,
      );

    // Momentos 2–4: la sección se fija y el scroll avanza la historia
    const fly = this.flightFactory(host);
    const scene = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    scene.addLabel('m0', 0);
    let cursor = SCENE_MODE === 'libre' ? 0.3 : HOLD * 0.6;
    if (SCENE_MODE === 'libre') showLine(scene, 0, 0);
    for (const n of [1, 2, 3]) {
      const at = cursor;
      showLine(scene, n, at);
      let end = at + MOVE;
      if (n === 1) {
        // Momento 2: aparecen las frutas en sus regiones (norte → sur)
        scene
          .add(map.phase(1).duration(MOVE * 0.6), at + 0.1)
          .add(map.phase(2).duration(MOVE * 0.25), at + 0.7);
      } else if (n === 2) {
        // Momento 3: de cada región sale su fruta y entra en la cesta
        let t = at + 0.1;
        for (const [zone, fruits] of DELIVERY) {
          for (const fruit of fruits) {
            fly(scene, zone, fruit, t);
            end = Math.max(end, t + FLIGHT);
            t += 0.14;
          }
        }
      } else {
        // Momento 4: la mariposa se lleva la cesta y aparece a dónde puede llegar
        scene
          .to(
            q('.carrier'),
            {
              x: () => window.innerWidth * 0.5,
              y: () => -window.innerHeight * 0.55,
              rotation: 8,
              duration: 0.5,
              ease: 'power2.in',
            },
            at + 0.05,
          )
          .to(q('.markets'), { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, at + 0.45)
          .to(q('.market'), { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.04 }, at + 0.55)
          .to(q('.origen-cta'), { autoAlpha: 1, y: 0, duration: 0.2 }, at + 0.85);
        end = Math.max(end, at + 1.05);
      }
      scene.addLabel(`m${n}`, end);
      cursor = end + HOLD;
    }
    // Pausa final con el último momento completo
    if (HOLD) scene.to({}, { duration: HOLD }, '>');

    const pin = q('.origen-pin')[0];
    const last = scene.labels['m3'];

    if (SCENE_MODE === 'libre') {
      // Sin parte fija: la historia avanza mientras la sección cruza la pantalla y, al
      // completarse, queda en su estado final (no retrocede al subir).
      const st = ScrollTrigger.create({
        trigger: host,
        start: 'top 70%',
        end: 'top 5%',
        animation: scene,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress < 0.995) return;
          scene.progress(1);
          st.kill(false, true); // deja la escena donde quedó (no la elimina)
        },
      });
      return;
    }

    /*
     * La historia se cuenta una sola vez: al completarse queda fija en el último momento
     * (mapa con las frutas y "Dónde puede llegar") y no retrocede. Cuando el usuario sigue
     * bajando, se suelta la parte fija para que al volver a subir la sección se vea completa
     * sin tener que recorrerla otra vez.
     */
    let done = false;
    let left = false;
    let released = false;
    const finish = () => {
      done = true;
      if (left) release();
    };
    const release = () => {
      if (released) return;
      released = true;
      const distance = st.end - st.start;
      st.kill();
      this.scroll.shiftBy(-distance);
      ScrollTrigger.refresh();
    };

    let current = 0;
    const st = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: SCENE_MODE === 'pausas' ? '+=420%' : '+=240%',
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Si cambia el tamaño de la ventana, se recalculan las posiciones de vuelo
      onRefresh: () => {
        if (!released) scene.invalidate().time(scene.time());
      },
      onLeave: () => {
        left = true;
        if (done) release();
      },
      onEnterBack: () => (left = false),
      onUpdate: (self) => {
        if (done) return;
        if (SCENE_MODE === 'pausas') {
          // La escena avanza con el scroll (amortiguado) y descansa tras cada momento
          gsap.to(scene, {
            time: self.progress * scene.duration(),
            duration: 1.4,
            ease: 'power2.out',
            overwrite: true,
            onComplete: () => scene.progress() > 0.999 && finish(),
          });
          return;
        }
        // 'momentos': al cruzar cada tercio de la parte fija se reproduce el momento completo
        const target = Math.round(self.progress * 3);
        if (target === current) return;
        current = target;
        const to = scene.labels[`m${target}`];
        scene.tweenTo(`m${target}`, {
          duration: Math.abs(to - scene.time()) * MOMENT_DURATION,
          ease: 'power1.inOut',
          overwrite: true,
          onComplete: () => target === 3 && scene.time() >= last - 0.001 && finish(),
        });
      },
    });
  }
}
