import { tList, useT } from '../../lib/i18n';

/** Barra de 12 meses que marca los meses de cosecha/disponibilidad. */
export function AvailabilityCalendar({ months }: { months: number[] }) {
  const t = useT('productos');
  const labels = tList('productos.months');
  const names = tList('productos.monthsLong');
  const availableList = [...months]
    .sort((a, b) => a - b)
    .map((m) => names[m - 1])
    .join(', ');
  const isOn = (month: number) => months.includes(month);

  return (
    <>
      <p class="sr-only">{t('availableIn', { months: availableList })}</p>
      <ol class="grid grid-cols-12 gap-1" aria-hidden="true">
        {labels.map((m, i) => (
          <li key={i} class="flex flex-col items-center gap-1.5">
            <span class={`block h-3 w-full rounded-full ${isOn(i + 1) ? 'bg-hoja' : 'bg-palta/10'}`} />
            <span class={`text-[0.7rem] font-medium sm:text-xs ${isOn(i + 1) ? '' : 'opacity-50'}`}>
              {m}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
