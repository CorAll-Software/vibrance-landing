import { Injectable } from '@angular/core';
import { QUOTE_ENDPOINT } from '../config/brand';

export interface QuoteRequest {
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  product: string;
  volume: string;
  incoterm: string;
  destPort: string;
  shipDate: string;
  message: string;
  /** Aceptó la política de privacidad (casilla obligatoria). */
  privacy: boolean;
}

/**
 * Envío de la solicitud de cotización a Formspree (el destino, ventas@, se configura en su panel).
 * El endpoint está en brand.ts → QUOTE_ENDPOINT. Mientras esté vacío simula la llamada.
 * Para probar el mensaje de error, abre la página con `?simular-error`.
 */
@Injectable({ providedIn: 'root' })
export class QuoteService {
  async send(request: QuoteRequest): Promise<void> {
    const fail = typeof location !== 'undefined' && location.search.includes('simular-error');
    if (!QUOTE_ENDPOINT) {
      return new Promise((resolve, reject) =>
        setTimeout(() => (fail ? reject(new Error('network')) : resolve()), 900),
      );
    }
    if (fail) throw new Error('network');

    const dash = (v: string) => v.trim() || '—';
    const res = await fetch(QUOTE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `Nueva cotización: ${request.company} (${request.country})`,
        _replyto: request.email,
        Nombre: request.name,
        Empresa: request.company,
        'País de destino': request.country,
        Correo: request.email,
        'Teléfono / WhatsApp': dash(request.phone),
        'Producto de interés': request.product,
        Volumen: dash(request.volume),
        Incoterm: dash(request.incoterm),
        'Puerto de destino': dash(request.destPort),
        'Fecha estimada de embarque': dash(request.shipDate),
        Mensaje: dash(request.message),
        'Aceptó la política de privacidad': request.privacy ? 'Sí' : 'No',
      }),
    });
    if (!res.ok) throw new Error(`quote ${res.status}`);
  }
}
