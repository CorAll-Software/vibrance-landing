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
    <span aria-hidden="true" class="tabular-nums"
      >{{ prefix() }}{{ formatted() }}{{ suffix() }}</span
    >
  `,
})
export class CounterComponent {
  readonly value = input.required<number>();
  readonly prefix = input('');
  readonly suffix = input('');

  private readonly lang = inject(LanguageService);
  private readonly current = signal(0);

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
              }),
          });
        });
      });
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
