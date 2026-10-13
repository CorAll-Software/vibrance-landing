import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { PhotoPlaceholderComponent } from '../../shared/components/photo-placeholder/photo-placeholder';

/** Quiénes somos: la CEO, su trayectoria y el mensaje de respaldo legal y asegurado. */
@Component({
  selector: 'app-nosotros',
  imports: [TranslocoDirective, PhotoPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="nosotros"
      class="bg-niebla py-24 md:py-36"
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
            class="mt-4 text-4xl leading-[1.05] font-bold md:text-6xl"
          >
            {{ t('heading') }}
          </h2>
          <p data-reveal class="measure mt-8 text-lg text-palta/80">{{ t('bio') }}</p>
          <p data-reveal class="mt-6 font-display text-xl font-semibold text-palta">
            {{ ceoName }}
            <span class="block text-base font-medium text-palta/70">{{ t('role') }}</span>
          </p>

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
          <blockquote data-reveal class="rounded-3xl bg-palta p-8 text-niebla md:p-10">
            <p class="font-display text-2xl leading-snug font-semibold md:text-3xl">
              {{ t('quote') }}
            </p>
          </blockquote>
          <div data-reveal class="mt-8 grid gap-5 text-palta/80">
            <h3 class="text-2xl font-semibold text-palta md:text-3xl">{{ t('storyTitle') }}</h3>
            @for (k of story; track k) {
              <p>{{ t('story.' + k) }}</p>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class NosotrosComponent {
  protected readonly ceoName = 'Melanie Calderon';
  protected readonly pillars = ['contracts', 'insurance', 'credit'] as const;
  protected readonly story = ['p1', 'p2', 'p3'] as const;
}
