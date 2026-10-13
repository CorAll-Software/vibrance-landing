/**
 * Cómo avanzan las escenas fijas (Origen y Proceso) en escritorio.
 *
 * - 'momentos': al cruzar cierto punto del scroll, cada momento se reproduce completo,
 *   con su propia duración (no depende de cuánto se scrollee).
 * - 'pausas': la escena avanza junto con el scroll (con un leve retraso) y se detiene
 *   un tramo después de cada momento.
 */
export const SCENE_MODE: 'momentos' | 'pausas' = 'momentos';

/** Modo 'momentos': segundos que tarda cada momento en reproducirse. */
export const MOMENT_DURATION = 1.3;
