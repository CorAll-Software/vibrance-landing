import { lang } from '../../lib/i18n';
import { PRIVACY } from '../../data/privacy.data';
import { closePrivacy, privacyOpen } from '../../lib/ui';
import { Modal } from './Modal';

/** Política de privacidad en un modal (la web es de una sola página, sin rutas). */
export function PrivacyModal() {
  // Español para quien navega en español; el resto lee la versión en inglés.
  const l = lang.value === 'es' ? 'es' : 'en';
  const policy = PRIVACY[l];
  return (
    <Modal open={privacyOpen.value} labelledBy="privacy-title" onClose={closePrivacy}>
      <article class="p-6 sm:p-10" lang={l}>
        <h2 id="privacy-title" class="pr-12 text-3xl font-semibold sm:text-4xl">
          {policy.title}
        </h2>
        <p class="mt-2 text-sm text-palta/60">{policy.updated}</p>
        <ol class="mt-6 flex flex-col gap-4 text-palta/85">
          {policy.sections.map((s, i) => (
            <li key={i}>
              <p>
                <strong class="font-semibold text-palta">
                  {i + 1}. {s.title}.
                </strong>{' '}
                {s.text}
              </p>
            </li>
          ))}
        </ol>
        <p class="mt-6 text-sm text-palta/70">{policy.legal}</p>
      </article>
    </Modal>
  );
}
