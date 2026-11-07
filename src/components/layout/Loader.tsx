import './loader.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useT } from '../../lib/i18n';
import * as scroll from '../../lib/smooth-scroll';
import { introDone, introFlight } from '../../lib/ui';
import {
  BUTTERFLY_BODY,
  SEED_CRACK,
  SEED_LEFT,
  SEED_RIGHT,
  WING_LEFT,
  WING_RIGHT,
} from './loader-art';

gsap.registerPlugin(MotionPathPlugin);

const SEEN_KEY = 'intro-seen';
const GLINTS = Array.from({ length: 10 }, (_, i) => i);

/** Desplazamiento (desde el centro de la pantalla) y escala para posarse en el símbolo. */
function target(symbol: HTMLElement | null): { x: number; y: number; scale: number } {
  if (!symbol) return { x: 0, y: -window.innerHeight / 2, scale: 0.2 };
  const r = symbol.getBoundingClientRect();
  // centro visible del sol dentro del logo (sol + mundo, 400×270)
  return {
    x: r.left + r.width * 0.48 - window.innerWidth / 2,
    y: r.top + r.height * 0.56 - window.innerHeight / 2,
    scale: Math.max(0.16, (r.height * 0.9) / 120),
  };
}

function burst(glints: Element[]): void {
  glints.forEach((g, i) => {
    const dx = gsap.utils.random(-70, 70);
    const dy = gsap.utils.random(-140, -50);
    gsap.fromTo(
      g,
      { autoAlpha: 0, x: 0, y: 0, scale: 0.4 },
      {
        keyframes: [
          { autoAlpha: 1, x: dx * 0.4, y: dy * 0.4, scale: 1, duration: 0.35, ease: 'power2.out' },
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

/**
 * Intro de marca (≈3,7 s, solo la primera vez que se visita la web):
 * la semilla se asienta, se agrieta y se abre con luz; sale una mariposa que vuela
 * hasta el sol del logo en el header y se funde con él; luego entra la página.
 *
 * Todo es un único timeline de GSAP con pasos solapados (sin esperas muertas), solo
 * anima transform/opacity (GPU). Botón "Saltar" siempre visible.
 * Con prefers-reduced-motion no se muestra.
 */
export function Loader() {
  const t = useT('common');
  const [visible, setVisible] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | undefined>(undefined);
  const flapTl = useRef<gsap.core.Timeline | undefined>(undefined);
  const finished = useRef(false);
  const ctxRef = useRef<gsap.Context | undefined>(undefined);

  // Decide si se muestra (solo en el cliente, tras hidratar)
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1';
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* almacenamiento no disponible */
    }
    // En desarrollo (astro dev) o con ?intro en la URL se muestra siempre, aunque ya se haya visto
    const force = import.meta.env.DEV || new URLSearchParams(location.search).has('intro');

    if ((seen && !force) || scroll.reducedMotion.value) {
      introDone.value = true;
      document.documentElement.removeAttribute('data-intro');
      return;
    }
    setVisible(true);
  }, []);

  const finish = (skipped: boolean) => {
    if (finished.current) return;
    finished.current = true;
    if (skipped) {
      tl.current?.kill();
      flapTl.current?.kill();
      gsap.set(
        [
          document.querySelector('[data-brand-symbol]'),
          ...document.querySelectorAll('[data-intro-fade]'),
        ],
        { autoAlpha: 1, y: 0, scale: 1, clearProps: 'filter' },
      );
    }
    setVisible(false);
    scroll.start();
    introDone.value = true;
  };

  useEffect(() => {
    const el = host.current;
    if (!visible || !el) return;
    // El velo de pre-carga (CSS en <html data-intro>) ya no hace falta: el loader lo reemplaza
    document.documentElement.removeAttribute('data-intro');
    scroll.stop();

    ctxRef.current = gsap.context(() => {
      const q = gsap.utils.selector(el);
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
      const flap = (flapTl.current = gsap
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

      const main = (tl.current = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => finish(false),
      }));

      // 1 · La semilla cae suave y se asienta (con su sombra)
      main
        .fromTo(
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
        .add(() => burst(q('.glint')), 'open+=0.05')

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
      const dest = target(symbol);
      main
        .addLabel('fly', 'open+=0.85')
        .add(() => (introFlight.value = true), 'fly') // el video del hero arranca al despegar
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
                { x: dest.x * 0.55, y: dest.y + 170 },
                { x: dest.x, y: dest.y },
              ],
              type: 'cubic',
            },
            scale: dest.scale,
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
      main
        .addLabel('land', 'fly+=1.2')
        .add(() => flap.pause(0), 'land')
        // la entrada del hero arranca cuando la mariposa se posa (no al final del loader)
        .add(() => (introDone.value = true), 'land')
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
    }, el);
  }, [visible]);

  // Solo al desmontar (como al destruir el componente): revierte los estilos de GSAP
  useEffect(() => () => ctxRef.current?.revert(), []);

  if (!visible) return null;

  return (
    <div ref={host} class="loader" role="status" aria-label={t('loading')}>
      {/* Fondo propio: se disuelve mientras la mariposa vuela y deja ver la página */}
      <div class="backdrop" aria-hidden="true" />

      <div class="seed" aria-hidden="true">
        <div class="shadow" />
        <div class="glow" />
        <div class="half half-l">
          <svg class="svg-seed-l" viewBox="-80 -100 160 200" dangerouslySetInnerHTML={{ __html: SEED_LEFT }} />
        </div>
        <div class="half half-r">
          <svg class="svg-seed-r" viewBox="-80 -100 160 200" dangerouslySetInnerHTML={{ __html: SEED_RIGHT }} />
        </div>
        <div class="crack">
          <svg class="svg-crack" viewBox="-80 -100 160 200" dangerouslySetInnerHTML={{ __html: SEED_CRACK }} />
        </div>
        {GLINTS.map((g) => (
          <span key={g} class="glint" />
        ))}
      </div>

      <div class="bf" aria-hidden="true">
        <div class="bf-inner">
          <div class="wing wing-l">
            <svg class="svg-wing-l" viewBox="-80 -60 80 120" dangerouslySetInnerHTML={{ __html: WING_LEFT }} />
          </div>
          <div class="wing wing-r">
            <svg class="svg-wing-r" viewBox="0 -60 80 120" dangerouslySetInnerHTML={{ __html: WING_RIGHT }} />
          </div>
          <div class="bf-body">
            <svg class="svg-body" viewBox="-10 -36 20 72" dangerouslySetInnerHTML={{ __html: BUTTERFLY_BODY }} />
          </div>
        </div>
      </div>

      <button type="button" class="skip" onClick={() => finish(true)}>
        {t('skip_intro')}
      </button>
    </div>
  );
}
