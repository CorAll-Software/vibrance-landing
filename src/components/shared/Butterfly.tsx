import './butterfly.css';
import { useMemo } from 'preact/hooks';
import { BUTTERFLY_BODY, WING_LEFT, WING_RIGHT } from '../layout/loader-art';

let seq = 0;

/**
 * La mariposa de la intro, en amarillo, aleteando. Decorativa.
 * Su tamaño lo da el ancho del elemento (alto = 75 % del ancho).
 */
export function Butterfly({ class: cls = '' }: { class?: string }) {
  const art = useMemo(() => {
    const prefix = `bf${++seq}-`;
    /** Recolorea a amarillo y usa ids propios (para no chocar con los del loader). */
    const yellow = (svg: string) =>
      svg
        .replaceAll('ld-', prefix)
        .replaceAll('#C2611A', '#D9A21F')
        .replaceAll('#E5862B', '#EDBB2E')
        .replaceAll('#F2A33A', '#F7D046')
        .replaceAll('#F8C676', '#FCE79A');
    return { wl: yellow(WING_LEFT), wr: yellow(WING_RIGHT), bd: yellow(BUTTERFLY_BODY) };
  }, []);

  return (
    <div class={`butterfly ${cls}`} aria-hidden="true">
      <div class="bf-inner">
        <div class="wing wing--l">
          <svg viewBox="-80 -60 80 120" dangerouslySetInnerHTML={{ __html: art.wl }} />
        </div>
        <div class="wing wing--r">
          <svg viewBox="0 -60 80 120" dangerouslySetInnerHTML={{ __html: art.wr }} />
        </div>
        <div class="body">
          <svg viewBox="-10 -36 20 72" dangerouslySetInnerHTML={{ __html: art.bd }} />
        </div>
      </div>
    </div>
  );
}
