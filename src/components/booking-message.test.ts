import { expect, test } from 'bun:test';
import siteData from '../data/site.json';
import { rupiah, whatsappUrl } from '../data/contact';
import { buildReservationMessage, estimate } from './BookingEstimator';

test('estimates, reservation message, and WhatsApp URL derive from site.json', () => {
  expect(estimate('drop-off', 5)).toBe(siteData.pricing.dropOff.price);
  expect(estimate('harian', 3)).toBe(siteData.pricing.harian.price * 3);
  expect(estimate('luar-kota', 2)).toBeNull();

  const b = siteData.booking;
  const msg = buildReservationMessage({
    service: 'harian',
    date: '2027-02-10',
    passengers: 4,
    duration: 3,
    pickup: '  Hotel & kantor / Bandung ',
  });
  const lines = msg.split('\n').filter((l) => l.startsWith('*') && l.includes(':*'));
  expect(lines).toEqual([
    `*${b.serviceLabel}:* ${siteData.pricing.harian.name}`,
    `*${b.dateLabel}:* Rabu, 10 Februari 2027`,
    `*${b.passengersLabel}:* 4 ${b.passengerUnit}`,
    `*${b.durationLabel}:* 3 ${b.dayUnit}`,
    `*${b.pickupMessageLabel}:* Hotel & kantor / Bandung`,
    `*${b.estimateLabel}:* ${rupiah(siteData.pricing.harian.price * 3)}`,
  ]);

  const url = new URL(whatsappUrl(msg));
  expect(url.pathname).toBe(`/${siteData.contact.whatsappNumber}`);
  expect(url.searchParams.get('text')).toBe(msg);

  const dropOff = buildReservationMessage({ service: 'drop-off', date: '2027-02-10', passengers: 2, duration: 5, pickup: '' });
  expect(dropOff).not.toContain(`*${b.durationLabel}:*`);
  expect(dropOff).toContain(`*${b.estimateLabel}:* ${rupiah(siteData.pricing.dropOff.price)}`);
  expect(dropOff).toContain(`*${b.pickupMessageLabel}:* -`);
  expect(buildReservationMessage({ service: 'luar-kota', date: '2027-02-10', passengers: 2, duration: 1, pickup: 'Jakarta' }))
    .toContain(`*${b.estimateLabel}:* ${b.contactPrice}`);
});
