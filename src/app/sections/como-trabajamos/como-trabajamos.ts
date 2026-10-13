import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

/** Cómo trabajamos / preguntas frecuentes: Incoterms, volumen mínimo, pagos y puerto. */
@Component({
  selector: 'app-como-trabajamos',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="como"
      class="bg-white py-24 md:py-36"
      aria-labelledby="como-title"
      *transloco="let t; prefix: 'como'"
    >
      <div class="container-page">
        <div class="grid gap-6 md:grid-cols-12 md:items-end">
          <h2
            data-reveal
            id="como-title"
            class="text-4xl leading-[1.05] font-bold md:col-span-6 md:text-6xl"
          >
            {{ t('heading') }}
          </h2>
          <p data-reveal class="measure text-lg text-palta/75 md:col-span-5 md:col-start-8">
            {{ t('intro') }}
          </p>
        </div>

        <dl class="mt-14 grid gap-5 md:grid-cols-2">
          @for (k of items; track k) {
            <div data-reveal class="rounded-3xl border border-palta/15 bg-niebla p-8">
              <dt class="font-display text-2xl font-semibold text-hoja md:text-3xl">
                {{ t('items.' + k + '.q') }}
              </dt>
              <dd class="mt-3 text-lg text-palta/85">{{ t('items.' + k + '.a') }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>
  `,
})
export class ComoTrabajamosComponent {
  protected readonly items = ['incoterms', 'volume', 'payment', 'port'] as const;
}
