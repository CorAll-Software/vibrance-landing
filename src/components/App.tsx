import { useEffect } from 'preact/hooks';
import { initActiveSection } from '../lib/active-section';
import type { Lang } from '../config/brand';
import { initLang, seedLang, type Dict } from '../lib/i18n';
import { initReveals } from '../lib/reveal';
import * as scroll from '../lib/smooth-scroll';
import { Footer } from './layout/Footer';
import { Header } from './layout/Header';
import { Loader } from './layout/Loader';
import { ScrollIndicator } from './layout/ScrollIndicator';
import { WhatsappButton } from './layout/WhatsappButton';
import { ComoTrabajamos } from './sections/ComoTrabajamos';
import { Contacto } from './sections/Contacto';
import { Datos } from './sections/Datos';
import { Hero } from './sections/Hero';
import { Nosotros } from './sections/Nosotros';
import { Origen } from './sections/Origen';
import { Proceso } from './sections/Proceso';
import { Productos } from './sections/Productos';
import { QuoteModal } from './sections/QuoteModal';
import { PrivacyModal } from './shared/PrivacyModal';
import { ProductDetail } from './shared/ProductDetail';

interface Props {
  /** Idioma de la página (cada idioma es un HTML estático: /, /en/, /zh/…). */
  lang: Lang;
  /** Diccionario del idioma; solo hace falta si no es el idioma por defecto (ese ya va en el bundle). */
  dict?: Dict;
}

/** Raíz de la página: una sola isla de Preact (se pre-renderiza en el build y se hidrata en el cliente). */
export function App({ lang, dict }: Props) {
  // Antes de pintar a los hijos: así el HTML del build y la hidratación salen en el mismo idioma
  seedLang(lang, dict);

  useEffect(() => {
    scroll.initMotionPreference();
    initActiveSection();
    void initLang();
    scroll.initSmoothScroll();
    // Los hijos ya montaron (sus efectos corren antes que el de la raíz): el DOM está completo
    const cleanup = initReveals(scroll.reducedMotion.value);
    return cleanup;
  }, []);

  return (
    <>
      <Loader />
      <Header />
      <ScrollIndicator />

      <main id="contenido">
        <Hero />
        <Origen />
        <Nosotros />
        <Proceso />
        <Productos />
        <Datos />
        <ComoTrabajamos />
        <Contacto />
      </main>

      <Footer />
      <ProductDetail />
      <QuoteModal />
      <PrivacyModal />
      <WhatsappButton />
    </>
  );
}
