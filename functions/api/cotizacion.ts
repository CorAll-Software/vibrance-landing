/**
 * Cloudflare Pages Function: POST /api/cotizacion
 * Recibe el formulario de cotización y lo envía por correo con Resend.
 *
 * Variables de entorno (Cloudflare → Pages → Settings → Variables and Secrets):
 * - RESEND_API_KEY   (secreta) clave de Resend.
 * - MAIL_FROM        remitente en un dominio verificado en Resend,
 *                    p. ej. "Web Vibrance <no-reply@vibranceincaharvest.com>".
 * - MAIL_TO          destino de las cotizaciones (ventas@vibranceincaharvest.com).
 * - TURNSTILE_SECRET (opcional, secreta) si existe, se exige el token de Cloudflare Turnstile.
 *
 * Ver docs/envio-cotizaciones.md para el paso a paso.
 */

interface Env {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_TO?: string;
  TURNSTILE_SECRET?: string;
}

/** Tipos mínimos de Pages Functions (así no hace falta instalar @cloudflare/workers-types). */
interface Context {
  request: Request;
  env: Env;
}

/** Etiquetas del correo, en el orden en que se muestran. */
const FIELDS: [key: string, label: string, max: number][] = [
  ['name', 'Nombre', 80],
  ['company', 'Empresa', 120],
  ['country', 'País de destino', 60],
  ['email', 'Correo', 120],
  ['phone', 'Teléfono / WhatsApp', 40],
  ['product', 'Producto de interés', 40],
  ['volume', 'Volumen', 80],
  ['incoterm', 'Incoterm', 10],
  ['destPort', 'Puerto de destino', 80],
  ['shipDate', 'Fecha estimada de embarque', 20],
  ['message', 'Mensaje', 2000],
];
const REQUIRED = ['name', 'company', 'country', 'email', 'product'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function turnstileOk(secret: string, token: unknown, request: Request): Promise<boolean> {
  if (typeof token !== 'string' || !token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return !!data?.success;
}

export const onRequestPost = async ({ request, env }: Context): Promise<Response> => {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) {
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  // Campo trampa: las personas no lo ven ni lo llenan. Se responde "ok" para no dar pistas.
  if (typeof input['website'] === 'string' && input['website'] !== '') {
    return json({ ok: true });
  }

  if (env.TURNSTILE_SECRET && !(await turnstileOk(env.TURNSTILE_SECRET, input['turnstileToken'], request))) {
    return json({ ok: false, error: 'captcha' }, 403);
  }

  const values: Record<string, string> = {};
  for (const [key, , max] of FIELDS) {
    const raw = input[key];
    values[key] = typeof raw === 'string' ? raw.trim().slice(0, max) : '';
  }
  if (REQUIRED.some((k) => !values[k]) || !EMAIL.test(values['email'])) {
    return json({ ok: false, error: 'invalid_fields' }, 400);
  }
  if (input['privacy'] !== true) {
    return json({ ok: false, error: 'privacy' }, 400);
  }

  const dash = (v: string): string => v || '—';
  const rows = FIELDS.map(([key, label]) => [label, dash(values[key])] as const);
  rows.push(['Aceptó la política de privacidad', 'Sí']);

  const html =
    '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    rows
      .map(
        ([label, value]) =>
          `<tr><td style="color:#555;vertical-align:top;white-space:nowrap"><b>${escapeHtml(label)}</b></td>` +
          `<td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
      )
      .join('') +
    '</table>';
  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [env.MAIL_TO],
      // Al pulsar "Responder", la respuesta va directo al comprador
      reply_to: values['email'],
      subject: `Nueva cotización: ${values['company']} (${values['country']})`,
      html,
      text,
    }),
  });

  if (!res.ok) return json({ ok: false, error: 'mail_failed' }, 502);
  return json({ ok: true });
};

/** Cualquier otro método devuelve 405. */
export const onRequest = (): Response => json({ ok: false, error: 'method_not_allowed' }, 405);
