import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { translateObjectSignal, TranslocoDirective } from '@jsverse/transloco';

/** Barra de 12 meses que marca los meses de cosecha/disponibilidad. */
@Component({
  selector: 'app-availability-calendar',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *transloco="let t; prefix: 'productos'">
      <p class="sr-only">{{ t('availableIn', { months: availableList() }) }}</p>
      <ol class="grid grid-cols-12 gap-1" aria-hidden="true">
        @for (m of monthLabels(); track $index) {
          <li class="flex flex-col items-center gap-1.5">
            <span
              class="block h-3 w-full rounded-full"
              [class]="isOn($index + 1) ? 'bg-hoja' : 'bg-palta/10'"
            ></span>
            <span
              class="text-[0.7rem] font-medium sm:text-xs"
              [class.opacity-50]="!isOn($index + 1)"
            >
              {{ m }}
            </span>
          </li>
        }
      </ol>
    </ng-container>
  `,
})
export class AvailabilityCalendarComponent {
  /** Meses disponibles: 1 = enero … 12 = diciembre. */
  readonly months = input.required<number[]>();

  protected readonly monthLabels = translateObjectSignal(
    'productos.months',
  ) as unknown as () => string[];
  private readonly monthsLong = translateObjectSignal(
    'productos.monthsLong',
  ) as unknown as () => string[];

  protected readonly availableList = computed(() => {
    const names = this.monthsLong() ?? [];
    return [...this.months()]
      .sort((a, b) => a - b)
      .map((m) => names[m - 1])
      .join(', ');
  });

  protected isOn(month: number): boolean {
    return this.months().includes(month);
  }
}
