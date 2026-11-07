import './quote-modal.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import { LOGO } from '../../config/brand';
import { PRODUCTS } from '../../data/productos.data';
import { useT } from '../../lib/i18n';
import { sendQuote } from '../../lib/quote';
import { closeQuote, openPrivacy, quoteOpen, quoteProduct } from '../../lib/ui';
import { Butterfly } from '../shared/Butterfly';
import { Modal } from '../shared/Modal';

type Status = 'idle' | 'sending' | 'success' | 'error';
type FieldName =
  | 'name'
  | 'company'
  | 'country'
  | 'email'
  | 'phone'
  | 'product'
  | 'volume'
  | 'incoterm'
  | 'destPort'
  | 'shipDate'
  | 'message';
type ErrorKind = 'required' | 'email' | 'pattern';

export const INCOTERMS = ['FOB', 'CFR', 'CIF'] as const;

/** Cómo se dibuja cada campo: input de texto/correo/teléfono/fecha o uno de los dos selects. */
type FieldKind = 'text' | 'email' | 'tel' | 'date' | 'product' | 'incoterm';
interface FieldDef {
  name: FieldName;
  kind: FieldKind;
  autocomplete: string;
}

/**
 * Los campos van de dos en dos para que las filas queden simétricas (el mensaje y la casilla
 * ocupan todo el ancho): nombre y empresa, país y correo, teléfono y producto, volumen y puerto,
 * fecha e Incoterm.
 */
const FIELDS: FieldDef[] = [
  { name: 'name', kind: 'text', autocomplete: 'name' },
  { name: 'company', kind: 'text', autocomplete: 'organization' },
  { name: 'country', kind: 'text', autocomplete: 'country-name' },
  { name: 'email', kind: 'email', autocomplete: 'email' },
  { name: 'phone', kind: 'tel', autocomplete: 'tel' },
  { name: 'product', kind: 'product', autocomplete: 'off' },
  { name: 'volume', kind: 'text', autocomplete: 'off' },
  { name: 'destPort', kind: 'text', autocomplete: 'off' },
  { name: 'shipDate', kind: 'date', autocomplete: 'off' },
  { name: 'incoterm', kind: 'incoterm', autocomplete: 'off' },
];

/**
 * Solo nombre, empresa, país, correo y producto son obligatorios (pedido de la clienta): que
 * nadie deje de escribir por no tener a mano volumen, puerto, fecha o Incoterm.
 * Los opcionales se validan solo si se completan.
 */
const REQUIRED: Partial<Record<FieldName, boolean>> = {
  name: true,
  company: true,
  country: true,
  email: true,
  product: true,
};
const MAX_LENGTH: Partial<Record<FieldName, number>> = {
  name: 80,
  company: 120,
  country: 60,
  volume: 80,
  destPort: 80,
};

// Mismo patrón de correo que Validators.email de Angular
const EMAIL =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// + opcional, luego dígitos, espacios, paréntesis, puntos o guiones (al menos 6 dígitos)
const PHONE = /^\+?(?:[\s().-]*\d){6,}[\s().-]*$/;

type Values = Record<FieldName, string> & { privacy: boolean; website: string };
const EMPTY: Values = {
  name: '',
  company: '',
  country: '',
  email: '',
  phone: '',
  product: '',
  volume: '',
  incoterm: '',
  destPort: '',
  shipDate: '',
  message: '',
  privacy: false,
  website: '',
};

/** Primer error de un campo (null si es válido). */
function validate(field: FieldName, value: string): ErrorKind | null {
  if (REQUIRED[field] && value.length === 0) return 'required';
  if (value.length === 0) return null; // opcionales vacíos: válidos
  if (field === 'email' && !EMAIL.test(value)) return 'email';
  if (field === 'phone' && !PHONE.test(value)) return 'pattern';
  const max = MAX_LENGTH[field];
  if (max && value.length > max) return 'required';
  return null;
}

/** Modal "Solicitar cotización" con formulario y validaciones. */
export function QuoteModal() {
  const t = useT('form');
  const tc = useT('common');
  const tp = useT('productos');
  const root = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState('');
  /** Teléfono que escribió la persona (vacío si no lo dio): la pantalla de envío lo muestra solo si existe. */
  const [sentPhone, setSentPhone] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

  const open = quoteOpen.value;
  const product = quoteProduct.value;

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setSubmitted(false);
    setErrorCount(0);
    setStatus('idle');
  };

  // Preselecciona el producto cuando la cotización se abre desde una card
  useEffect(() => {
    if (!open) return;
    if (status === 'success') reset();
    if (product) setValues((v) => ({ ...v, product }));
  }, [open, product]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const touch = (key: string) => setTouched((s) => ({ ...s, [key]: true }));

  const errorOf = (f: FieldName) => validate(f, values[f]);
  const showError = (f: FieldName) => !!errorOf(f) && (!!touched[f] || submitted);
  const privacyInvalid = !values.privacy;
  const showPrivacyError = privacyInvalid && (!!touched.privacy || submitted);
  const showSummary = submitted && errorCount > 0;

  const submit = async (event: Event) => {
    event.preventDefault();
    setSubmitted(true);
    const invalid = FIELDS.filter((f) => errorOf(f.name)).length + (privacyInvalid ? 1 : 0);
    // El campo "message" no tiene validadores, así que no cuenta (igual que antes)
    if (invalid > 0) {
      setTouched(
        Object.fromEntries([...FIELDS.map((f) => [f.name, true]), ['privacy', true]]),
      );
      setErrorCount(invalid);
      // Lleva el foco al primer campo con error (tras pintar los aria-invalid)
      setTimeout(() => root.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setErrorCount(0);
    setStatus('sending');
    try {
      await sendQuote({ ...values });
      setSentTo(values.email);
      setSentPhone(values.phone.trim());
      setStatus('success');
    } catch {
      // Conservamos lo escrito para que pueda reintentar
      setStatus('error');
    }
  };

  const fieldProps = (f: FieldDef) => ({
    id: `q-${f.name}`,
    value: values[f.name],
    class: 'field',
    'aria-required': !!REQUIRED[f.name],
    'aria-invalid': showError(f.name),
    'aria-describedby': showError(f.name) ? `q-${f.name}-err` : undefined,
    onInput: (e: Event) => set(f.name, (e.target as HTMLInputElement).value),
    onChange: (e: Event) => set(f.name, (e.target as HTMLInputElement).value),
    onBlur: () => touch(f.name),
  });

  return (
    <Modal open={open} labelledBy="quote-title" onClose={closeQuote}>
      <div class="p-6 sm:p-10" ref={root}>
        {status === 'success' ? (
          /* Envío exitoso: tarjeta de marca con el logo y la mariposa que sale volando */
          <div
            class="relative overflow-hidden rounded-3xl bg-palta px-7 py-9 text-niebla sm:px-10 sm:py-12"
            role="status"
          >
            <Butterfly class="sent-bf" />
            <img src={LOGO.dark} alt="" width={LOGO.width} height={LOGO.height} class="h-14 w-auto" />
            <h2 id="quote-title" class="mt-6 text-4xl leading-tight font-semibold sm:text-5xl">
              {t('successTitle')}
            </h2>
            <p class="mt-4 max-w-[34rem] text-lg text-niebla/80">
              {sentPhone
                ? t('successTextPhone', { email: sentTo, phone: sentPhone })
                : t('successText', { email: sentTo })}
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <button type="button" class="btn-primary" onClick={closeQuote}>
                {tc('close')}
              </button>
              <button
                type="button"
                class="rounded-full border border-niebla/40 px-6 py-3 font-semibold text-niebla transition-colors hover:bg-niebla hover:text-palta"
                onClick={reset}
              >
                {t('again')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div class="flex items-center gap-3 pe-12">
              <img
                src={LOGO.light}
                alt=""
                width={LOGO.width}
                height={LOGO.height}
                class="h-11 w-auto shrink-0 sm:h-12"
              />
              <h2 id="quote-title" class="text-3xl leading-tight font-semibold sm:text-4xl">
                {t('title')}
              </h2>
            </div>
            <p class="mt-3 text-palta/75">{t('intro')}</p>
            <p class="mt-1 text-sm text-palta/60">
              <span class="font-semibold text-red-600" aria-hidden="true">
                *
              </span>{' '}
              {t('required')}
            </p>

            <div aria-live="assertive" class="empty:hidden">
              {showSummary && (
                <p class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                  {t('errors.summary', { n: errorCount })}
                </p>
              )}
              {status === 'error' && (
                <div class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-900">
                  <p class="font-semibold">{t('errorTitle')}</p>
                  <p class="mt-1 text-sm">{t('errorText')}</p>
                </div>
              )}
            </div>

            <form
              class="mt-6 grid items-start gap-x-4 gap-y-5 sm:grid-cols-2"
              onSubmit={submit}
              noValidate
            >
              {FIELDS.map((f) => (
                <div key={f.name} class="flex flex-col gap-1.5">
                  <label for={`q-${f.name}`} class="text-sm leading-snug font-semibold">
                    {t(f.name)}
                    {REQUIRED[f.name] && (
                      <>
                        {' '}
                        <span class="text-red-600" aria-hidden="true">
                          *
                        </span>
                      </>
                    )}
                  </label>
                  {f.kind === 'product' ? (
                    <select {...fieldProps(f)}>
                      <option value="" disabled>
                        {t('productPlaceholder')}
                      </option>
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {tp('items.' + p.id + '.name')}
                        </option>
                      ))}
                      <option value="varios">{t('productSeveral')}</option>
                    </select>
                  ) : f.kind === 'incoterm' ? (
                    <select {...fieldProps(f)}>
                      <option value="">{t('incotermPlaceholder')}</option>
                      {INCOTERMS.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...fieldProps(f)}
                      type={f.kind as 'text'}
                      autocomplete={f.autocomplete}
                      min={f.kind === 'date' ? today : undefined}
                    />
                  )}
                  {showError(f.name) && (
                    <p id={`q-${f.name}-err`} class="text-sm text-red-700">
                      {t('errors.' + errorOf(f.name))}
                    </p>
                  )}
                </div>
              ))}

              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label for="q-message" class="text-sm leading-snug font-semibold">
                  {t('message')}
                </label>
                <textarea
                  id="q-message"
                  rows={4}
                  class="field resize-y"
                  placeholder={t('messagePlaceholder')}
                  value={values.message}
                  onInput={(e) => set('message', (e.target as HTMLTextAreaElement).value)}
                  onBlur={() => touch('message')}
                ></textarea>
              </div>

              {/* Campo trampa: fuera de pantalla y sin foco; solo lo llenan los bots */}
              <div class="sr-only" aria-hidden="true">
                <label for="q-website">Website</label>
                <input
                  id="q-website"
                  type="text"
                  tabIndex={-1}
                  autocomplete="off"
                  value={values.website}
                  onInput={(e) => set('website', (e.target as HTMLInputElement).value)}
                />
              </div>

              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <div class="flex items-start gap-3">
                  <input
                    id="q-privacy"
                    type="checkbox"
                    class="mt-1 size-5 shrink-0 accent-hoja"
                    aria-required="true"
                    aria-invalid={showPrivacyError}
                    aria-describedby={showPrivacyError ? 'q-privacy-err' : undefined}
                    checked={values.privacy}
                    onChange={(e) => set('privacy', (e.target as HTMLInputElement).checked)}
                    onBlur={() => touch('privacy')}
                  />
                  <label for="q-privacy" class="text-sm">
                    {t('privacyBefore')}
                    <button
                      type="button"
                      class="font-semibold underline underline-offset-2"
                      onClick={openPrivacy}
                    >
                      {t('privacyLink')}
                    </button>
                    {t('privacyAfter')}{' '}
                    <span class="text-red-600" aria-hidden="true">
                      *
                    </span>
                  </label>
                </div>
                {showPrivacyError && (
                  <p id="q-privacy-err" class="text-sm text-red-700">
                    {t('errors.privacy')}
                  </p>
                )}
              </div>

              <div class="sm:col-span-2">
                <button
                  type="submit"
                  class="btn-primary w-full sm:w-auto"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <>
                      <svg class="size-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-opacity="0.25"
                        />
                        <path
                          d="M21 12a9 9 0 00-9-9"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-linecap="round"
                        />
                      </svg>
                      {t('sending')}
                    </>
                  ) : status === 'error' ? (
                    t('retry')
                  ) : (
                    t('submit')
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
