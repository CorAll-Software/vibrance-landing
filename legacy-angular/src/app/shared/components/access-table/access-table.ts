import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { PRODUCTS } from '../../../data/productos.data';
import { DESTINATIONS } from '../../../data/destinos.data';
import { hasAccess } from '../../../data/mercados.data';

/**
 * Tabla de acceso fitosanitario: productos × mercados.
 * Muestra con honestidad dónde puede entrar cada producto (sin prometer mercados cerrados).
 */
@Component({
  selector: 'app-access-table',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative overflow-x-auto rounded-2xl border border-palta/15"
      tabindex="0"
      role="region"
      *transloco="let t"
      [attr.aria-label]="t('datos.accessTitle')"
    >
      <table class="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption class="sr-only">
          {{
            t('datos.accessCaption')
          }}
        </caption>
        <thead>
          <tr class="bg-palta/[0.04]">
            <th scope="col" class="sticky start-0 bg-niebla px-4 py-3 font-semibold">
              {{ t('datos.accessProduct') }}
            </th>
            @for (m of markets; track m.id) {
              <th scope="col" class="px-3 py-3 text-center font-semibold whitespace-nowrap">
                {{ t('datos.destinos.' + m.id) }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (p of products; track p.id) {
            <tr class="border-t border-palta/10">
              <th
                scope="row"
                class="sticky start-0 bg-white px-4 py-3 font-semibold whitespace-nowrap"
              >
                {{ t('productos.items.' + p.id + '.name') }}
              </th>
              @for (m of markets; track m.id) {
                <td class="px-3 py-3 text-center">
                  @if (has(p.id, m.id)) {
                    <svg
                      viewBox="0 0 20 20"
                      width="20"
                      height="20"
                      class="mx-auto text-hoja"
                      aria-hidden="true"
                    >
                      <circle cx="10" cy="10" r="9" fill="currentColor" fill-opacity="0.15" />
                      <path
                        d="M6 10.5l2.5 2.5L14 7.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span class="sr-only">{{ t('datos.accessYes') }}</span>
                  } @else {
                    <span class="text-xs text-palta/50">{{ t('datos.accessAsk') }}</span>
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AccessTableComponent {
  protected readonly products = PRODUCTS;
  protected readonly markets = DESTINATIONS;
  protected readonly has = hasAccess;
}
