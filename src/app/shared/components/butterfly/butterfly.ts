import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { BUTTERFLY_BODY, WING_LEFT, WING_RIGHT } from '../../../layout/loader/loader-art';

let seq = 0;

/**
 * La mariposa de la intro, en amarillo, aleteando. Decorativa.
 * Su tamaño lo da el ancho del elemento (alto = 75 % del ancho).
 */
@Component({
  selector: 'app-butterfly',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="bf-inner">
      <div class="wing wing--l"><svg class="wl" viewBox="-80 -60 80 120"></svg></div>
      <div class="wing wing--r"><svg class="wr" viewBox="0 -60 80 120"></svg></div>
      <div class="body"><svg class="bd" viewBox="-10 -36 20 72"></svg></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      aspect-ratio: 4 / 3;
    }
    .bf-inner {
      position: absolute;
      inset: 0;
      perspective: 600px;
    }
    .wing {
      position: absolute;
      top: 0;
      width: 50%;
      height: 100%;
    }
    .wing--r {
      left: 50%;
      transform-origin: 0 50%;
      animation: flap-r 0.22s ease-in-out infinite alternate;
    }
    .wing--l {
      right: 50%;
      transform-origin: 100% 50%;
      animation: flap-l 0.22s ease-in-out infinite alternate;
    }
    @keyframes flap-r {
      to {
        transform: rotateY(64deg);
      }
    }
    @keyframes flap-l {
      to {
        transform: rotateY(-64deg);
      }
    }
    .body {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 12.5%;
      height: 60%;
      transform: translate(-50%, -50%);
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    @media (prefers-reduced-motion: reduce) {
      .wing {
        animation: none;
      }
    }
  `,
})
export class ButterflyComponent {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const prefix = `bf${++seq}-`;
    /** Recolorea a amarillo y usa ids propios (para no chocar con los del loader). */
    const yellow = (svg: string) =>
      svg
        .replaceAll('ld-', prefix)
        .replaceAll('#C2611A', '#D9A21F')
        .replaceAll('#E5862B', '#EDBB2E')
        .replaceAll('#F2A33A', '#F7D046')
        .replaceAll('#F8C676', '#FCE79A');
    afterNextRender(() => {
      // Arte SVG estático propio (no viene del usuario)
      host.querySelector('.wl')!.innerHTML = yellow(WING_LEFT);
      host.querySelector('.wr')!.innerHTML = yellow(WING_RIGHT);
      host.querySelector('.bd')!.innerHTML = yellow(BUTTERFLY_BODY);
    });
  }
}
