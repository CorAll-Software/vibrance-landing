import { Injectable } from '@angular/core';
import { QUOTE_ACCESS_KEY, QUOTE_ENDPOINT } from '../config/brand';

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
  /** Campo trampa anti-spam: las personas lo dejan vacío. */
  website?: string;
}

/**
 * Envío de la solicitud de cotización a Web3Forms (el destino, ventas@, va ligado a la clave
 * QUOTE_ACCESS_KEY de brand.ts). Si la clave está vacía simula la llamada.
 * Para probar el mensaje de error, abre la página con `?simular-error`.
 */
@Injectable({ providedIn: 'root' })
export class QuoteService {
  async send(request: QuoteRequest): Promise<void> {
    const fail = typeof location !== 'undefined' && location.search.includes('simular-error');
    if (!QUOTE_ACCESS_KEY) {
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
        access_key: QUOTE_ACCESS_KEY,
        subject: `Nueva cotización: ${request.company} (${request.country})`,
        from_name: 'Web Vibrance',
        replyto: request.email,
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
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    if (!res.ok || !data?.success) throw new Error(`quote ${res.status}`);
  }
}
