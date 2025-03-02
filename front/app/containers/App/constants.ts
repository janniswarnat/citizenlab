export const AUTH_PATH = '/auth';
export const API_PATH = '/web_api/v1';
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
export const API_HOST =
  process.env.API_HOST ||
  (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
export const API_PORT = process.env.API_PORT || 4000;
export const GRAPHQL_HOST =
  process.env.GRAPHQL_HOST ||
  (typeof window === 'undefined' ? 'localhost' : window.location.hostname);
export const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 5001;
export const DEFAULT_LOCALE = 'en';

// the locales we "support" :
// platformBaseUrl/{oneOfTheseStrings}/{anything we have a route for}
// - won't 404
// - will replace the oneOfTheseStrings with authUser's locale if there is one
// - else, will replace the oneOfTheseStrings with the one if the cookie if it exists
// - else, will replce the oneOfTheseStrings with the first locale of the platfom (default)
export const locales = [
  'en',
  'fr',
  'de',
  'nl',
  'nb',
  'da',
  'es',
  'de-DE',
  'it-IT',
  'en-GB',
  'en-CA',
  'fr-BE',
  'fr-FR',
  'nl-BE',
  'nl-NL',
  'da-DK',
  'nb-NO',
  'es-ES',
  'es-CL',
  'pl-PL',
  'kl-GL',
  'lb-LU',
  'hu-HU',
  'ro-RO',
  'pt-BR',
  'ar-SA',
  'mi',
  'sr-Latn',
  'sr-SP',
  'hr-HR',
];

// the locales we really support, ie we have translations for these ect
export const appLocalePairs = {
  en: 'English',
  'en-GB': 'English (Great Britain)',
  'en-CA': 'English (Canada)',
  'fr-BE': 'Français (Belgique)',
  'fr-FR': 'Français (France)',
  'nl-BE': 'Nederlands (België)',
  'nl-NL': 'Nederlands (Nederland)',
  'de-DE': 'Deutsch',
  'it-IT': 'Italiano',
  'da-DK': 'Dansk',
  'nb-NO': 'Norsk (Bokmål)',
  'es-ES': 'Español (España)',
  'es-CL': 'Español (Chile)',
  'pl-PL': 'Polski',
  'kl-GL': 'Kalaallisut',
  'lb-LU': 'Lëtzebuergesch',
  'hu-HU': 'Magyar',
  'ro-RO': 'Română',
  'pt-BR': 'Português (Brasil)',
  'ar-SA': 'عربى',
  mi: 'Māori',
  'sr-Latn': 'Srpski (Latinica)',
  'sr-SP': 'Српски (Ћирилица)',
  'hr-HR': 'Hrvatski',
};

export const appGraphqlLocalePairs = {
  en: 'en',
  fr: 'fr',
  de: 'de',
  nl: 'nl',
  nb: 'nb',
  da: 'da',
  es: 'es',
  enGb: 'en-GB',
  enCa: 'en-CA',
  frBe: 'fr-BE',
  frFr: 'fr-FR',
  nlBe: 'nl-BE',
  nlNl: 'nl-NL',
  deDe: 'de-DE',
  itIt: 'it-IT',
  daDk: 'da-DK',
  nbNo: 'nb-NO',
  esEs: 'es-ES',
  esCl: 'es-CL',
  plPl: 'pl-PL',
  klGl: 'kl-GL',
  lbLu: 'lb-LU',
  huHu: 'hu-HU',
  roRo: 'ro-RO',
  ptBr: 'pt-BR',
  arSa: 'ar',
  mi: 'mi',
  srLatn: 'sr-Latn',
  srSp: 'sr-SP',
  hrHr: 'hr-HR',
};

export const shortenedAppLocalePairs = {
  en: 'English',
  'en-GB': 'English',
  'en-CA': 'English',
  'fr-BE': 'Français',
  'fr-FR': 'Français',
  'nl-BE': 'Nederlands',
  'nl-NL': 'Nederlands',
  'de-DE': 'Deutsch',
  'it-IT': 'Italiano',
  'da-DK': 'Dansk',
  'nb-NO': 'Norsk',
  'es-ES': 'Español',
  'es-CL': 'Español',
  'pl-PL': 'Polski',
  'kl-GL': 'Kalaallisut',
  'lb-LU': 'Lëtzebuergesch',
  'hu-HU': 'Magyar',
  'ro-RO': 'Română',
  'pt-BR': 'Português',
  'ar-SA': 'عربى',
  mi: 'Māori',
  'sr-Latn': 'Srpski',
  'sr-SP': 'Српски',
  'hr-HR': 'Hrvatski',
};

// see https://www.ge.com/digital/documentation/predix-services/c_custom_locale_support.html
export const appLocalesMomentPairs = {
  'en-GB': 'en-gb',
  'en-CA': 'en-ca',
  'fr-BE': 'fr',
  'fr-FR': 'fr',
  'nl-BE': 'nl',
  'nl-NL': 'nl',
  'de-DE': 'de',
  'it-IT': 'it',
  'da-DK': 'da',
  'nb-NO': 'nb',
  'es-ES': 'es',
  'es-CL': 'es',
  'pl-PL': 'pl',
  'kl-GL': 'da',
  'lb-LU': 'lb',
  'hu-HU': 'hu',
  'ro-RO': 'ro',
  'pt-BR': 'pt',
  'ar-SA': 'ar',
  mi: 'mi',
  'sr-Latn': 'sr',
  'sr-SP': 'sr',
  'hr-HR': 'hr',
};
