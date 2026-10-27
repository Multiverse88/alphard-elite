import siteData from './site.json';

export const rupiah = (value: number): string => `Rp ${value.toLocaleString('id-ID')}`;

export const whatsappUrl = (message: string = siteData.contact.defaultMessage): string =>
  `https://wa.me/${siteData.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
