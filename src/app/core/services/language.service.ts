import { Injectable, computed, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, filter, switchMap } from 'rxjs';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AVAILABLE_LANGS, BRAND_NAME, DEFAULT_LANG, LANG_META, Lang } from '../config/brand';

const STORAGE_KEY = 'lang';

/** Cambio de idioma en tiempo real (9 idiomas, incluidos RTL) + título, metas, lang y dir del documento. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly langs = AVAILABLE_LANGS;
  readonly current = toSignal(this.transloco.langChanges$ as Observable<Lang>, {
    initialValue: this.transloco.getActiveLang() as Lang,
  });
  readonly info = computed(() => LANG_META[this.current()] ?? LANG_META[DEFAULT_LANG]);
  /** Locale para Intl (formato de números en contadores). */
  readonly locale = computed(() => this.info().locale);
  /** Dirección del texto: 'rtl' para árabe y hebreo. */
  readonly dir = computed(() => this.info().dir);

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

  private initialLang(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && AVAILABLE_LANGS.includes(saved)) return saved;
    } catch {
      /* almacenamiento no disponible */
    }
    // Primer idioma del navegador que tengamos disponible
    const prefs = this.document.defaultView?.navigator.languages ?? [];
    for (const pref of prefs) {
      const code = pref.slice(0, 2).toLowerCase() as Lang;
      if (AVAILABLE_LANGS.includes(code)) return code;
    }
    return DEFAULT_LANG;
  }

  private updateHead(): void {
    const lang = this.transloco.getActiveLang() as Lang;
    const meta = LANG_META[lang] ?? LANG_META[DEFAULT_LANG];
    const pageTitle = this.transloco.translate('seo.title', { brand: BRAND_NAME });
    const description = this.transloco.translate('seo.description');
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = meta.dir;
    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:locale', content: meta.ogLocale });
    // Los textos cambian de largo (y de dirección): recalcula las animaciones por scroll
    this.document.defaultView?.requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}
