import { LEGAL_NAME, RUC } from '../core/config/brand';

/**
 * Texto de la política de privacidad (anexo del tercer informe de la clienta).
 * Solo existe en español e inglés: los demás idiomas muestran la versión en inglés,
 * que remite a la española en caso de discrepancia.
 * La clienta decidió no publicar el domicilio: se identifica a la empresa por razón social y RUC.
 */

export const SALES_EMAIL = 'ventas@vibranceincaharvest.com';
export const PARTNERS_EMAIL = 'aliados@vibranceincaharvest.com';

export interface PrivacyPolicy {
  title: string;
  updated: string;
  sections: { title: string; text: string }[];
  legal: string;
}

export const PRIVACY: Record<'es' | 'en', PrivacyPolicy> = {
  es: {
    title: `Política de privacidad — ${LEGAL_NAME}`,
    updated: 'Última actualización: octubre de 2026',
    sections: [
      {
        title: 'Responsable',
        text: `${LEGAL_NAME}, con RUC ${RUC}, con sede en Lima, Perú, es responsable del tratamiento de tus datos personales. Contacto: ${SALES_EMAIL}.`,
      },
      {
        title: 'Datos que recopilamos',
        text: 'Nombre, empresa, país, correo electrónico, teléfono o WhatsApp, producto de interés y la información que decidas enviarnos (volúmenes, puertos, fechas, mensajes), a través del formulario de la web, correo electrónico o WhatsApp. No solicitamos datos sensibles.',
      },
      {
        title: 'Finalidades',
        text: `Usamos tus datos para: (a) atender solicitudes de cotización y consultas; (b) gestionar la relación comercial (propuestas, contratos, embarques y facturación); (c) evaluar alianzas con productores que nos escriban a ${PARTNERS_EMAIL}; y (d) cumplir obligaciones legales. No te enviaremos publicidad sin tu consentimiento previo.`,
      },
      {
        title: 'Destinatarios',
        text: 'Solo compartimos tus datos cuando es necesario para la operación que solicitas: plantas de empaque, agentes de carga y de aduana, navieras o aerolíneas, aseguradoras y entidades financieras; proveedores tecnológicos (correo electrónico y alojamiento web); y autoridades cuando la ley lo exija. No vendemos ni cedemos tus datos a terceros con fines comerciales.',
      },
      {
        title: 'Transferencia internacional',
        text: 'Algunos de nuestros proveedores tecnológicos tienen servidores fuera del Perú (por ejemplo, servicios de correo en la nube). Además, cuando corresponda, tus datos podrán compartirse con operadores en el país de destino para ejecutar la operación comercial solicitada.',
      },
      {
        title: 'Conservación',
        text: 'Conservamos tus datos mientras dure la relación comercial y, después, durante los plazos que exigen las normas tributarias, aduaneras y demás aplicables. Las consultas que no terminen en una relación comercial se conservan hasta por 12 meses.',
      },
      {
        title: 'Tus derechos',
        text: `Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO), así como revocar tu consentimiento, escribiendo a ${SALES_EMAIL} con el asunto "Datos personales". Responderemos dentro de los plazos legales. Si consideras que no atendimos tu solicitud, puedes acudir a la Autoridad Nacional de Protección de Datos Personales del Perú.`,
      },
      {
        title: 'Seguridad',
        text: 'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra pérdida, acceso no autorizado o uso indebido.',
      },
      {
        title: 'Consentimiento',
        text: 'Al marcar la casilla y enviar el formulario, declaras haber leído esta política y aceptas el tratamiento de tus datos para las finalidades descritas.',
      },
      {
        title: 'Cambios',
        text: 'Podemos actualizar esta política; la versión vigente siempre estará publicada en esta página.',
      },
    ],
    legal: 'Marco legal: Ley N.º 29733, Ley de Protección de Datos Personales, y su Reglamento.',
  },
  en: {
    title: `Privacy Policy — ${LEGAL_NAME}`,
    updated: 'Last updated: October 2026',
    sections: [
      {
        title: 'Data controller',
        text: `${LEGAL_NAME}, Taxpayer ID (RUC) ${RUC}, based in Lima, Peru, is responsible for processing your personal data. Contact: ${SALES_EMAIL}.`,
      },
      {
        title: 'Data we collect',
        text: 'Name, company, country, email address, phone or WhatsApp number, product of interest and any information you choose to send us (volumes, ports, dates, messages), through our website form, email or WhatsApp. We do not request sensitive data.',
      },
      {
        title: 'Purposes',
        text: `We use your data to: (a) respond to quotation requests and inquiries; (b) manage the business relationship (proposals, contracts, shipments and invoicing); (c) evaluate partnerships with growers who contact us at ${PARTNERS_EMAIL}; and (d) comply with legal obligations. We will not send you marketing communications without your prior consent.`,
      },
      {
        title: 'Recipients',
        text: 'We only share your data when necessary to carry out the operation you request: packing facilities, freight forwarders and customs brokers, shipping lines or airlines, insurers and financial institutions; technology providers (email and web hosting); and authorities when required by law. We do not sell or transfer your data to third parties for commercial purposes.',
      },
      {
        title: 'International transfers',
        text: 'Some of our technology providers have servers outside Peru (for example, cloud email services). Where applicable, your data may also be shared with operators in the destination country in order to carry out the requested transaction.',
      },
      {
        title: 'Retention',
        text: 'We keep your data for as long as the business relationship lasts and, afterwards, for the periods required by tax, customs and other applicable regulations. Inquiries that do not result in a business relationship are kept for up to 12 months.',
      },
      {
        title: 'Your rights',
        text: `You may exercise your rights of access, rectification, cancellation and objection, and withdraw your consent, by writing to ${SALES_EMAIL} with the subject "Personal data". We will respond within the legal deadlines. If you believe your request was not properly handled, you may contact Peru's National Authority for the Protection of Personal Data.`,
      },
      {
        title: 'Security',
        text: 'We apply reasonable technical and organizational measures to protect your data against loss, unauthorized access or misuse.',
      },
      {
        title: 'Consent',
        text: 'By ticking the box and submitting the form, you confirm that you have read this policy and agree to the processing of your data for the purposes described above.',
      },
      {
        title: 'Changes',
        text: 'We may update this policy; the current version will always be published on this page.',
      },
    ],
    legal:
      'Legal framework: Peruvian Law No. 29733, Personal Data Protection Law, and its Regulations. This English version is provided for convenience; in case of any discrepancy, the Spanish version shall prevail.',
  },
};
