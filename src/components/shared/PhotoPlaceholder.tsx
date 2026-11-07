/**
 * Recuadro provisional "Foto aquí" para los lugares que esperan una foto real.
 * Rellena a su contenedor (que debe ser `relative`). `caption` es opcional (p. ej. el nombre de la persona).
 * TODO: reemplazar por la foto real y quitar el recuadro.
 */
export function PhotoPlaceholder({
  caption = '',
  label = 'Foto aquí',
}: {
  caption?: string;
  label?: string;
}) {
  return (
    <span class="absolute inset-0 block" role="img" aria-label={label}>
      <span class="m-3 flex h-[calc(100%-1.5rem)] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-palta/40 bg-arena/60 p-4 text-center text-palta/75 sm:m-4 sm:h-[calc(100%-2rem)]">
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <circle cx="9" cy="10.5" r="1.8" />
          <path d="M21 16l-5-5-8 8" />
        </svg>
        <span class="font-display text-lg font-semibold">Foto aquí</span>
        {caption && <span class="text-sm font-medium">{caption}</span>}
      </span>
    </span>
  );
}
