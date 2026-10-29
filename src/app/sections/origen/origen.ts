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
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective, TranslocoPipe, translateObjectSignal } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { MapPeruComponent } from '../../shared/components/map-peru/map-peru';
import { BasketComponent } from '../../shared/components/basket/basket';
import { ButterflyComponent } from '../../shared/components/butterfly/butterfly';
import { FruitIconComponent } from '../../shared/components/fruit-icon/fruit-icon';
import { UiStateService } from '../../core/services/ui-state.service';
import { CONTACT } from '../../core/config/brand';
import type { ProductId } from '../../data/productos.data';
import { ORIGEN } from '../../core/config/media.config';
import { MOMENT_DURATION, SCENE_MODE } from '../../core/config/scroll.config';

/**
 * Modo de Origen (sigue a SCENE_MODE de scroll.config.ts):
 * - 'pausas': el paso de la parte 1 al mapa sigue al scroll normal (sin desplazarse solo).
 * - 'momentos': ese paso se recorre solo, completo, al empezar a bajar o subir.
 * - 'libre': sin partes fijas.
 */
const ORIGEN_MODE: 'libre' | 'momentos' | 'pausas' = SCENE_MODE;

/**
 * Cómo avanza la escena fija del mapa:
 * - 'pausas': sigue al scroll (amortiguado) y se detiene un tramo después de cada momento.
 * - 'momentos': al cruzar cada tercio, el momento se reproduce completo solo.
 */
const MAP_MODE: 'pausas' | 'momentos' = 'pausas';
/** Modo 'pausas': tramo de descanso tras cada momento (en unidades de la línea de tiempo). */
const HOLD = MAP_MODE === 'pausas' ? 0.6 : 0;

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/** Escena fija solo en escritorio con altura suficiente y sin "reducir movimiento" (ver origen.css). */
const SCENE_MQ =
  '(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)';

/**
 * Ritmo de la parte fija (en unidades de la línea de tiempo):
 * cada momento tarda MOVE en ocurrir.
 */
const MOVE = 1;
/** Largo de la parte 1 fija, en pantallas (relevo de párrafos, volteo y vuelo de la mariposa). */
const INTRO_PIN = 1.1;

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
 * Van por los márgenes, sin cruzar el título ni el contenido: por el borde izquierdo, por el
 * borde derecho, abajo a la derecha y abajo a la izquierda.
 */
const TRAILS = [
  'M-40 720C70 610 30 440 130 320S230 110 110 -40',
  'M1480 140C1370 240 1430 400 1340 520S1300 760 1410 940',
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
 * 4. La mariposa se lleva la cesta y aparece el cierre con los botones de acción.
 * La parte fija del mapa avanza con pausas (ver MAP_MODE); el paso al mapa sigue a ORIGEN_MODE.
 */
@Component({
  selector: 'app-origen',
  imports: [
    NgOptimizedImage,
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
  protected readonly lines = translateObjectSignal('origen.lines') as unknown as () => string[];
  protected readonly scroll = inject(SmoothScrollService);
  protected readonly ui = inject(UiStateService);
  protected readonly partnersEmail = CONTACT.partnersEmail;
  protected readonly flyers = DELIVERY.flatMap(([, fruits]) => fruits);
  protected readonly trails = TRAILS;
  /** Foto / video de la parte "Nace en el desierto que florece" (core/config/media.config.ts). */
  protected readonly media = ORIGEN;
  /** Los 4 momentos de la escena del mapa (uno por barrita de avance). */
  protected readonly moments = [0, 1, 2, 3];
  /** true si se usa la escena fija (se decide al cargar). */
  protected readonly scene = typeof window !== 'undefined' && window.matchMedia(SCENE_MQ).matches;

  private travelersIo?: IntersectionObserver;
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
          // Escritorio: las dos partes son escenas fijas (el orden importa: el de la página)
          if (this.scene) {
            this.buildIntro(host);
            this.buildScene(host);
            this.buildTravelers(host);
            return;
          }
          // Parte 1 ("Nace en el desierto que florece"): cada párrafo pasa de tenue a pleno
          gsap.fromTo(
            '.intro-line',
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: 'none',
              stagger: 0.5,
              scrollTrigger: {
                trigger: '.intro-lines',
                start: 'top 80%',
                end: 'bottom 50%',
                scrub: 0.6,
              },
            },
          );
          // La tarjeta se voltea al cruzar el centro de la pantalla
          gsap.fromTo(
            '.flip-card',
            { rotateY: 0 },
            {
              rotateY: 180,
              ease: 'power1.inOut',
              scrollTrigger: {
                trigger: '.origen-frame',
                start: 'center 65%',
                end: 'center 35%',
                scrub: 0.6,
              },
            },
          );
          // Móvil: el mapa y la cesta se animan solos (map-peru y basket tienen su propio scroll)
        }, host);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.travelersIo?.disconnect();
      ctx?.revert();
    });
  }

  /**
   * Parte 1: un scroll fijo y luego una salida lineal. Mientras está fija, los párrafos se relevan,
   * la tarjeta se voltea mostrando su otra cara, las montañas se mueven apenas y una mariposa
   * grande cruza de izquierda a derecha. Al soltarse
   * sigue el scroll normal: el texto sale primero y la foto después (cascada inversa), y la
   * parte 2 llega por debajo sin taparla.
   */
  private buildIntro(host: HTMLElement): void {
    const intro = host.querySelector<HTMLElement>('.origen-intro');
    const lines = gsap.utils.toArray<HTMLElement>('.intro-line', host);
    const step = 1 / lines.length;
    gsap.set(lines.slice(1), { opacity: 0, y: 28 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: intro,
        start: 'top top',
        end: () => `+=${window.innerHeight * INTRO_PIN}`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    // Montañas: se desplazan apenas (siguen a la vista durante toda la escena)
    tl.fromTo(
      '.origen-mountains',
      { y: 0, scale: 1 },
      { y: () => -window.innerHeight * 0.06, scale: 1.03, duration: 1 },
      0,
    );
    // La tarjeta se voltea justo cuando el primer párrafo empieza a irse
    tl.to('.flip-card', { rotateY: 180, duration: 0.3, ease: 'power2.inOut' }, 0.3).to(
      '.flip-card',
      { keyframes: { scale: [1, 0.94, 1] }, duration: 0.3, ease: 'none' },
      0.3,
    );
    // La mariposa grande cruza de izquierda a derecha (sale por la derecha a buscar la cesta)
    const bf = host.querySelector<HTMLElement>('.intro-bf');
    if (bf) {
      const W = () => window.innerWidth;
      const H = () => window.innerHeight;
      // Curva cúbica (proporcional a la pantalla): entra por la izquierda, ondula y sale arriba a la derecha
      const curve = (t: number) => {
        const p = [
          [-0.15 * W(), 0.84 * H()],
          [0.3 * W(), 0.62 * H()],
          [0.62 * W(), 1.02 * H()],
          [1.12 * W(), 0.32 * H()],
        ];
        const u = 1 - t;
        const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
        const d = [-3 * u * u, 3 * u * u - 6 * u * t, 6 * u * t - 3 * t * t, 3 * t * t];
        const pt = (w: number[], i: number) => w.reduce((acc, c, j) => acc + c * p[j][i], 0);
        return { x: pt(k, 0), y: pt(k, 1), angle: Math.atan2(pt(d, 1), pt(d, 0)) };
      };
      const flight = { t: 0 };
      const place = () => {
        const c = curve(flight.t);
        // El dibujo mira hacia arriba: +90° para que apunte en la dirección del vuelo
        gsap.set(bf, { x: c.x, y: c.y, rotation: (c.angle * 180) / Math.PI + 90 });
      };
      tl.set(bf, { autoAlpha: 1 }, 0.04)
        .fromTo(
          flight,
          { t: 0 },
          { t: 1, duration: 0.9, ease: 'sine.inOut', onUpdate: place, onStart: place },
          0.04,
        )
        .set(bf, { autoAlpha: 0 }, 0.95);
    }
    // Relevo de párrafos: el actual sale hacia arriba mientras entra el siguiente
    lines.forEach((line, i) => {
      if (i === 0) return;
      const at = i * step - step * 0.2;
      tl.to(lines[i - 1], { opacity: 0, y: -28, duration: step * 0.2 }, at);
      tl.to(line, { opacity: 1, y: 0, duration: step * 0.2 }, at + step * 0.1);
    });

    // Salida en cascada inversa: con el scroll normal, primero se va el texto y luego la foto
    const exit = (target: string, to: gsap.TweenVars, start: string, end: string) =>
      gsap.to(target, {
        ...to,
        ease: 'none',
        scrollTrigger: { trigger: intro, start, end, scrub: true, invalidateOnRefresh: true },
      });
    exit('.intro-text', { y: -90, opacity: 0 }, 'bottom 92%', 'bottom 52%');
    exit('.origen-frame', { y: -150, opacity: 0 }, 'bottom 78%', 'bottom 18%');

    /*
     * Transición por momentos (como hero → Origen): el tramo entre el fin de la parte fija y el
     * inicio del mapa se recorre solo. Al empezar a bajar en ese tramo la página se desliza,
     * completa, hasta el mapa; al empezar a subir, vuelve sola al final de la parte 1.
     */
    const card = host.querySelector<HTMLElement>('.origen-pin');
    if (ORIGEN_MODE !== 'momentos' || !intro || !card) return;
    // El tope de un bloque fijo se mide en su contenedor `.pin-spacer`: no cambia al fijarse
    const top = (el: HTMLElement) =>
      (el.closest<HTMLElement>('.pin-spacer') ?? el).getBoundingClientRect().top + window.scrollY;
    const zoneStart = () => top(intro) + window.innerHeight * INTRO_PIN;
    const zoneEnd = () => top(card);
    const go = (y: number) => this.scroll.scrollToY(y, MOMENT_DURATION * 1.2);
    ScrollTrigger.create({
      start: zoneStart,
      end: zoneEnd,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (this.scroll.autoScrolling) return;
        const p = self.progress;
        if (p <= 0.03 || p >= 0.97) return;
        go(self.direction > 0 ? zoneEnd() : zoneStart());
      },
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
    const reveals = Array.from(host.querySelectorAll<SVGPathElement>('.trail-reveal'));
    const travelers = q('.traveler');
    const all = gsap.timeline({ paused: true });
    // La línea se "dibuja" con la mariposa: la máscara se despeja a lo largo de la longitud real
    const lengths = reveals.map((r) => r.getTotalLength());
    reveals.forEach((r, i) =>
      gsap.set(r, { strokeDasharray: lengths[i], strokeDashoffset: lengths[i] }),
    );
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
        .set(reveals[i], { strokeDashoffset: lengths[i] })
        .set(trail, { opacity: 1 });
      all.add(tl, 0);
    });
    // Se mueven mientras Origen está a la vista. Se observa la sección completa (no el bloque
    // fijo: mientras está fijo, el navegador puede darlo por fuera de pantalla y las dejaba quietas)
    this.travelersIo?.disconnect();
    this.travelersIo = new IntersectionObserver(([e]) =>
      e.isIntersecting ? all.play() : all.pause(),
    );
    this.travelersIo.observe(host);
  }

  /** Arma la escena fija. */
  private buildScene(host: HTMLElement): void {
    const map = this.map();
    const basket = this.basket();
    const q = gsap.utils.selector(host);
    const pinEl = q('.origen-pin')[0];
    const fills = q('.beat-fill');

    map.prepare();
    basket.prepare();
    gsap.set(fills, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(q('.markets'), { autoAlpha: 0, y: 24 });
    gsap.set(q('.origen-cta'), { autoAlpha: 0, y: 10 });

    /** Llena la barrita del momento. */
    const fillBeat = (tl: gsap.core.Timeline, i: number, at: number) => {
      tl.to(fills[i], { scaleX: 1, duration: 0.2 }, at);
    };

    // Momento 1: al entrar aparece el Perú y llega la mariposa con la cesta vacía (una sola vez)
    const intro = gsap.timeline({
      scrollTrigger: {
        trigger: pinEl,
        start: ORIGEN_MODE === 'libre' ? 'top 85%' : 'top 60%',
        once: true,
      },
    });
    // En modo libre la primera barrita la llena la escena misma (sigue al scroll)
    if (ORIGEN_MODE !== 'libre') fillBeat(intro, 0, 0);
    intro.add(map.phase(0), 0).fromTo(
      q('.carrier'),
      // La mariposa vuelve desde la derecha trayendo la cesta Vibrance
      { x: () => window.innerWidth * 0.6, y: () => -window.innerHeight * 0.08, rotation: -8 },
      { x: 0, y: 0, rotation: 0, duration: 1.8, ease: 'power3.out' },
      0.2,
    );

    // Momentos 2–4: la sección se fija y el scroll avanza la historia
    const fly = this.flightFactory(host);
    const scene = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    scene.addLabel('m0', 0);
    let cursor = ORIGEN_MODE === 'libre' ? 0.3 : 0;
    if (ORIGEN_MODE === 'libre') fillBeat(scene, 0, 0);
    for (const n of [1, 2, 3]) {
      const at = cursor;
      fillBeat(scene, n, at);
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
        // Momento 4: la mariposa se lleva la cesta y aparece el cierre con los botones
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
          .to(q('.origen-cta'), { autoAlpha: 1, y: 0, duration: 0.2 }, at + 0.65);
        end = Math.max(end, at + 0.85);
      }
      scene.addLabel(`m${n}`, end);
      cursor = end + HOLD;
    }
    // Pausa final con el último momento completo
    if (HOLD) scene.to({}, { duration: HOLD }, '>');

    const pin = q('.origen-pin')[0];
    const last = scene.labels['m3'];

    if (ORIGEN_MODE === 'libre') {
      // Sin parte fija: la historia avanza mientras la sección cruza la pantalla y, al
      // completarse, queda en su estado final (no retrocede al subir).
      const st = ScrollTrigger.create({
        trigger: pinEl,
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
      end: MAP_MODE === 'pausas' ? '+=320%' : '+=120%',
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
        if (MAP_MODE === 'pausas') {
          // Sigue al scroll con un leve retraso; los descansos están en la línea de tiempo
          gsap.to(scene, {
            time: self.progress * scene.duration(),
            duration: 1.2,
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
