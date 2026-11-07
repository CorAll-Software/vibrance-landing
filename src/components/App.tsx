import { useEffect } from 'preact/hooks';
import { initActiveSection } from '../lib/active-section';
import { initLang } from '../lib/i18n';
import { initReveals } from '../lib/reveal';
import * as scroll from '../lib/smooth-scroll';
import { Footer } from './layout/Footer';
import { Header } from './layout/Header';
import { Loader } from './layout/Loader';
import { ScrollIndicator } from './layout/ScrollIndicator';
import { WhatsappButton } from './layout/WhatsappButton';

/** Raíz de la página: una sola isla de Preact (se pre-renderiza en el build y se hidrata en el cliente). */
export function App() {
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

      <main id="contenido"></main>

      <Footer />
      <WhatsappButton />
    </>
  );
}
