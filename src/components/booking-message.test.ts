import { expect, test } from 'bun:test';
import { buildReservationMessage } from './BookingEstimator';

test('harian: mirrors form fields in order with WhatsApp markup', () => {
  const msg = buildReservationMessage({ service: 'harian', date: '2027-02-10', passengers: 4, duration: 3, pickup: '  Hotel & kantor / Bandung ' });
  const lines = msg.split('\n').filter((l) => l.startsWith('*') && l.includes(':*'));
  expect(lines).toEqual([
    '*Layanan:* Sewa harian dalam kota',
    '*Tanggal perjalanan:* Rabu, 10 Februari 2027',
    '*Jumlah penumpang:* 4 orang',
    '*Durasi sewa:* 3 hari',
    '*Lokasi jemput / catatan:* Hotel & kantor / Bandung',
    '*Estimasi:* Rp 7.500.000',
  ]);
});

test('drop-off omits duration; custom trip asks CS; empty note shows dash', () => {
  const dropOff = buildReservationMessage({ service: 'drop-off', date: '2027-02-10', passengers: 2, duration: 5, pickup: '' });
  expect(dropOff).not.toContain('Durasi sewa');
  expect(dropOff).toContain('*Estimasi:* Rp 1.000.000');
  expect(dropOff).toContain('*Lokasi jemput / catatan:* -');
  expect(buildReservationMessage({ service: 'luar-kota', date: '2027-02-10', passengers: 2, duration: 1, pickup: 'Jakarta' })).toContain('*Estimasi:* Hubungi CS');
});
