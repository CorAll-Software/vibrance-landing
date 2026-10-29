# Envío de cotizaciones (Cloudflare Pages + Resend)

El formulario de cotización se envía a `POST /api/cotizacion`, una Pages Function
(`functions/api/cotizacion.ts`) que manda el correo con [Resend](https://resend.com):

- **De:** `Web Vibrance <no-reply@vibranceincaharvest.com>`
- **Para:** `ventas@vibranceincaharvest.com`
- **Responder a:** el correo del comprador (al pulsar "Responder" se le escribe a él)

Mientras el dominio no esté listo, la web sigue usando Web3Forms. El interruptor es
`QUOTE_TRANSPORT` en `src/app/core/config/brand.ts` (`'web3forms'` | `'api'`).

## Qué hacer cuando exista el dominio (devops)

1. **Resend:** crear cuenta, *Domains → Add Domain* con `vibranceincaharvest.com` y añadir los
   registros DNS (SPF y DKIM) que indique. En Cloudflare DNS, Resend ofrece conectarlo con un clic.
   Esperar a que el dominio quede *Verified*.
2. **Resend → API Keys:** crear una clave con permiso de envío.
3. **Cloudflare Pages:** proyecto conectado a este repositorio.
   - Build command: `npm run build`
   - Build output directory: `dist/MelanieFruit/browser`
4. **Pages → Settings → Variables and Secrets** (Production, y Preview si se quiere probar ahí):
   - `RESEND_API_KEY` (secreta)
   - `MAIL_FROM` = `Web Vibrance <no-reply@vibranceincaharvest.com>`
   - `MAIL_TO` = `ventas@vibranceincaharvest.com`
5. **Buzón `ventas@`:** debe existir (o reenviar a un buzón real con Cloudflare *Email Routing*).
   `no-reply@` no necesita buzón: solo se usa para enviar.
6. En `brand.ts` cambiar `QUOTE_TRANSPORT` a `'api'`, desplegar y hacer la prueba de abajo.

## Probar en local

```bash
cp .dev.vars.example .dev.vars   # y poner una clave real de Resend
npm run build
npx wrangler pages dev
```

Abrir la dirección que muestre Wrangler (con `QUOTE_TRANSPORT = 'api'`) y enviar una cotización.
Mientras el dominio no esté verificado, Resend solo permite enviar desde `onboarding@resend.dev` y
únicamente al correo de la propia cuenta de Resend: sirve para ensayar usando
`MAIL_FROM=onboarding@resend.dev` y `MAIL_TO=<correo de la cuenta>`.

`ng serve` no ejecuta la función, por eso se usa `wrangler pages dev`.

## Prueba de aceptación

- Llega a `ventas@` un correo con asunto "Nueva cotización: Empresa (País)", cada dato con su
  etiqueta y "—" en los opcionales vacíos.
- "Responder" abre un correo dirigido al comprador.
- No cae en spam (revisar SPF/DKIM en el encabezado del correo).
- Enviar con `?simular-error` en la URL muestra el mensaje de error de la web.

## Anti-spam

- Campo trampa `website` (oculto): si llega con texto, la función responde "ok" sin enviar nada.
- Opcional, **Turnstile**: crear el widget en Cloudflare, definir `TURNSTILE_SECRET` y añadir el
  widget al formulario enviando su token como `turnstileToken`. Sin `TURNSTILE_SECRET` no se exige.
- Límite de envíos por IP: configurar una regla de *Rate limiting* en Cloudflare para `/api/cotizacion`.

## Respuesta automática al comprador (pendiente, opcional)

Segundo envío a `values.email` desde `no-reply@` con "Recibimos tu solicitud". Se añade en la misma
función con otra llamada a Resend.
