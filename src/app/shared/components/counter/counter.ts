import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageService } from '../../../core/services/language.service';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';

/**
 * Cifra grande que sube desde 0 al entrar en pantalla, solo la primera vez.
 * Con movimiento reducido muestra el valor final directamente.
 */
@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="sr-only">{{ finalText() }}</span>
    <span aria-hidden="true" class="inline-flex items-end gap-[0.12em]">
      <span #num class="inline-block origin-bottom tabular-nums"
        >{{ prefix() }}{{ formatted() }}{{ suffix() }}</span
      >
      <svg
        #check
        class="mb-[0.12em] h-[0.3em] w-[0.3em] shrink-0 text-mandarina"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        [style.opacity]="done() ? 1 : 0"
      >
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    </span>
  `,
})
export class CounterComponent {
  readonly value = input.required<number>();
  readonly prefix = input('');
  readonly suffix = input('');

  private readonly lang = inject(LanguageService);
  private readonly current = signal(0);
  protected readonly done = signal(false);
  private readonly num = viewChild.required<ElementRef<HTMLElement>>('num');
  private readonly check = viewChild.required<ElementRef<SVGElement>>('check');

  protected readonly formatted = computed(() =>
    new Intl.NumberFormat(this.lang.locale()).format(Math.round(this.current())),
  );
  protected readonly finalText = computed(
    () =>
      `${this.prefix()}${new Intl.NumberFormat(this.lang.locale()).format(this.value())}${this.suffix()}`,
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const scroll = inject(SmoothScrollService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      if (scroll.reducedMotion()) {
        this.current.set(this.value());
        this.done.set(true);
        return;
      }
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          const state = { n: 0 };
          ScrollTrigger.create({
            trigger: host,
            start: 'top 85%',
            once: true,
            onEnter: () =>
              gsap.to(state, {
                n: this.value(),
                duration: 1.6,
                ease: 'power2.out',
                onUpdate: () => this.current.set(state.n),
                onComplete: () => {
                  // Al llegar a la cifra: rebote de la cifra y check que aparece con pop
                  this.current.set(this.value());
                  gsap.fromTo(
                    this.num().nativeElement,
                    { scale: 1.22 },
                    { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)' },
                  );
                  gsap.fromTo(
                    this.check().nativeElement,
                    { scale: 0, rotate: -25, opacity: 1, transformOrigin: '50% 50%' },
                    { scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(3)', delay: 0.1 },
                  );
                  this.done.set(true);
                },
              }),
          });
        });
      });
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
