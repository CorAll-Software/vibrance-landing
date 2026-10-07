import { Injectable } from '@angular/core';

export interface QuoteRequest {
  name: string;
  company: string;
  country: string;
  email: string;
  product: string;
  message: string;
}

/**
 * Envío de la solicitud de cotización.
 * TODO: conectar con el backend o servicio de correo real (Formspree, EmailJS, API propia…).
 * Mientras tanto simula la llamada. Para probar el mensaje de error, abre la página con `?simular-error`.
 */
@Injectable({ providedIn: 'root' })
export class QuoteService {
  send(request: QuoteRequest): Promise<void> {
    const fail = typeof location !== 'undefined' && location.search.includes('simular-error');
    return new Promise((resolve, reject) =>
      setTimeout(() => (fail ? reject(new Error('network')) : resolve()), 900),
    );
  }
}
