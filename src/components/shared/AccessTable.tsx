import { PRODUCTS } from '../../data/productos.data';
import { DESTINATIONS } from '../../data/destinos.data';
import { hasAccess } from '../../data/mercados.data';
import { useT } from '../../lib/i18n';

/**
 * Tabla de acceso fitosanitario: productos × mercados.
 * Muestra con honestidad dónde puede entrar cada producto (sin prometer mercados cerrados).
 */
export function AccessTable() {
  const t = useT();
  return (
    <div
      class="relative overflow-x-auto rounded-2xl border border-palta/15"
      tabIndex={0}
      role="region"
      aria-label={t('datos.accessTitle')}
    >
      <table class="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption class="sr-only">{t('datos.accessCaption')}</caption>
        <thead>
          <tr class="bg-palta/[0.04]">
            <th scope="col" class="sticky start-0 bg-niebla px-4 py-3 font-semibold">
              {t('datos.accessProduct')}
            </th>
            {DESTINATIONS.map((m) => (
              <th key={m.id} scope="col" class="px-3 py-3 text-center font-semibold whitespace-nowrap">
                {t('datos.destinos.' + m.id)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PRODUCTS.map((p) => (
            <tr key={p.id} class="border-t border-palta/10">
              <th scope="row" class="sticky start-0 bg-white px-4 py-3 font-semibold whitespace-nowrap">
                {t('productos.items.' + p.id + '.name')}
              </th>
              {DESTINATIONS.map((m) => (
                <td key={m.id} class="px-3 py-3 text-center">
                  {hasAccess(p.id, m.id) ? (
                    <>
                      <svg viewBox="0 0 20 20" width="20" height="20" class="mx-auto text-hoja" aria-hidden="true">
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
                      <span class="sr-only">{t('datos.accessYes')}</span>
                    </>
                  ) : (
                    <span class="text-xs text-palta/50">{t('datos.accessAsk')}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
