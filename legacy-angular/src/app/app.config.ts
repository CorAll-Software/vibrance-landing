import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { TranslocoService, provideTransloco } from '@jsverse/transloco';
import { LanguageService } from './core/services/language.service';
import { TranslocoHttpLoader } from './core/services/transloco-loader';
import { AVAILABLE_LANGS, DEFAULT_LANG } from './core/config/brand';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideTransloco({
      config: {
        availableLangs: [...AVAILABLE_LANGS],
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { useFallbackTranslation: true },
      },
      loader: TranslocoHttpLoader,
    }),
    // Precarga el idioma inicial: las secciones se renderizan ya traducidas,
    // así GSAP encuentra el DOM completo en afterNextRender y no hay parpadeo de claves.
    provideAppInitializer(() => {
      inject(LanguageService);
      const transloco = inject(TranslocoService);
      return firstValueFrom(transloco.load(transloco.getActiveLang()));
    }),
  ],
};
