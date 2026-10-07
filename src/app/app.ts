import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { SmoothScrollService } from './core/services/smooth-scroll.service';
import { LoaderComponent } from './layout/loader/loader';
import { HeaderComponent } from './layout/header/header';
import { FooterComponent } from './layout/footer/footer';
import { HeroComponent } from './sections/hero/hero';
import { OrigenComponent } from './sections/origen/origen';
import { ProcesoComponent } from './sections/proceso/proceso';
import { ProductosComponent } from './sections/productos/productos';
import { DatosComponent } from './sections/datos/datos';
import { ContactoComponent } from './sections/contacto/contacto';
import { QuoteModalComponent } from './sections/contacto/quote-modal';

@Component({
  selector: 'app-root',
  imports: [
    LoaderComponent,
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    OrigenComponent,
    ProcesoComponent,
    ProductosComponent,
    DatosComponent,
    ContactoComponent,
    QuoteModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    const scroll = inject(SmoothScrollService);
    afterNextRender(() => scroll.init());
  }
}
