import { Injectable, computed, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { filter, switchMap } from 'rxjs';
import { AVAILABLE_LANGS, BRAND_NAME, DEFAULT_LANG, Lang } from '../config/brand';

const STORAGE_KEY = 'lang';

/** Cambio ES/EN en tiempo real + título, meta descripción y Open Graph por idioma. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly langs = AVAILABLE_LANGS;
  readonly current = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });
  /** Locale para Intl (formato de números en contadores). */
  readonly locale = computed(() => (this.current() === 'en' ? 'en-US' : 'es-PE'));

  constructor() {
    this.transloco.setActiveLang(this.initialLang());

    // Actualiza <html lang>, título y metas cuando el idioma termina de cargar
    this.transloco.langChanges$
      .pipe(
        switchMap((lang) => this.transloco.selectTranslation(lang)),
        filter((t) => !!t && Object.keys(t).length > 0),
      )
      .subscribe(() => this.updateHead());
  }

  set(lang: Lang): void {
    this.transloco.setActiveLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  toggle(): void {
    this.set(this.current() === 'es' ? 'en' : 'es');
  }

  private initialLang(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && AVAILABLE_LANGS.includes(saved)) return saved;
    } catch {
      /* almacenamiento no disponible */
    }
    const nav = this.document.defaultView?.navigator.language?.slice(0, 2);
    return nav === 'en' ? 'en' : DEFAULT_LANG;
  }

  private updateHead(): void {
    const lang = this.transloco.getActiveLang();
    const pageTitle = this.transloco.translate('seo.title', { brand: BRAND_NAME });
    const description = this.transloco.translate('seo.description');
    this.document.documentElement.lang = lang;
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'en' ? 'en_US' : 'es_PE' });
  }
}
