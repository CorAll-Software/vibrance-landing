import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { App } from './app';
import es from '../../public/i18n/es.json';

describe('App', () => {
  beforeEach(async () => {
    localStorage.setItem('lang', 'es');
    await TestBed.configureTestingModule({
      imports: [
        App,
        TranslocoTestingModule.forRoot({
          langs: { es },
          translocoConfig: { availableLangs: ['es', 'en'], defaultLang: 'es' },
          preloadLangs: true,
        }),
      ],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a single h1 with the hero title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('h1').length).toBe(1);
    expect(compiled.querySelector('h1')?.textContent).toContain('Fruta peruana');
  }, 20000); // la página completa (árbol con cientos de hojas SVG) tarda más en el entorno de pruebas
});
