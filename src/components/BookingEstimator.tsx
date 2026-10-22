import React, { useEffect, useState } from 'react';

export type ServiceType = 'drop-off' | 'harian' | 'luar-kota';

const services: Record<ServiceType, { name: string; price: number; note: string }> = {
  'drop-off': {
    name: 'Drop-off dalam kota',
    price: 1000000,
    note: '1 titik jemput dan 1 titik antar di Bandung, waktu tunggu maksimal 60 menit. All in driver, BBM, parkir & tol.',
  },
  'harian': {
    name: 'Sewa harian dalam kota',
    price: 2500000,
    note: '24 jam (00.00–23.59) di Bandung, titik jemput & antar tidak dibatasi. All in driver, BBM, parkir & tol.',
  },
  'luar-kota': {
    name: 'Luar kota / custom trip',
    price: 0,
    note: 'Rute luar kota Bandung atau itinerary khusus. Tarif dikonfirmasi oleh Customer Service.',
  },
};

export const WHATSAPP_NUMBER = '62818804288';

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export function estimate(service: ServiceType, duration: number): number | null {
  if (service === 'drop-off') return services[service].price;
  if (service === 'harian') return services[service].price * duration;
  return null;
}

/** WhatsApp message mirroring the form: same labels, same order, WhatsApp bold/italic markup. */
export function buildReservationMessage(input: { service: ServiceType; date: string; passengers: number; duration: number; pickup: string }): string {
  const { service, date, passengers, duration } = input;
  const pickup = input.pickup.trim();
  const total = estimate(service, duration);
  const travelDate = new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return [
    'Halo Alphard Elite, saya ingin melakukan reservasi.',
    '',
    '*RESERVASI CEPAT — ALPHARD ELITE*',
    '',
    `*Layanan:* ${services[service].name}`,
    `*Tanggal perjalanan:* ${travelDate}`,
    `*Jumlah penumpang:* ${passengers} orang`,
    ...(service === 'harian' ? [`*Durasi sewa:* ${duration} hari`] : []),
    `*Lokasi jemput / catatan:* ${pickup || '-'}`,
    `*Estimasi:* ${total !== null ? rupiah(total) : 'Hubungi CS'}`,
    '',
    '_Estimasi dari website, bukan harga final. Mohon konfirmasi ketersediaan jadwal dan harga akhir._',
    '',
    'Terima kasih.',
  ].join('\n');
}

export default function BookingEstimator() {
  const [service, setService] = useState<ServiceType>('harian');
  const [duration, setDuration] = useState<number>(1);
  const [date, setDate] = useState<string>('');
  const [pickup, setPickup] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(2);
  const [dateError, setDateError] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  const selected = services[service];
  const totalPrice = estimate(service, duration);

  const handleBookWhatsApp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const today = new Date();
    const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (!date || date < minimumDate) {
      setDateError('Pilih tanggal hari ini atau setelahnya.');
      e.currentTarget.querySelector<HTMLInputElement>('#travel-date')?.focus();
      return;
    }
    setDateError('');
    const text = buildReservationMessage({ service, date, passengers, duration, pickup });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <form id="reservasi" className="booking" onSubmit={handleBookWhatsApp} aria-busy={!ready} noValidate>
      <div className="booking-summary">
        <div className="booking-intro">
          <p className="eyebrow">Reservasi cepat</p>
          <h3 className="display">Rencanakan <em>perjalanan Anda.</em></h3>
          <p className="text-silver-400">Pilih layanan dan tanggal. Pesan tersusun otomatis untuk Anda kirim melalui WhatsApp.</p>
          {!ready && <p role="status" className="text-sm text-silver-400">Menyiapkan formulir… atau <a className="link-lux" href="https://wa.me/62818804288">hubungi WhatsApp langsung</a>.</p>}
        </div>
        <div className="booking-total">
          <span className="field-label">Estimasi</span>
          <p className="price !m-0" aria-live="polite">
            {totalPrice !== null ? rupiah(totalPrice) : 'Hubungi CS'}
          </p>
          <p className="price-note">Bukan harga final atau konfirmasi booking.</p>
          <button type="submit" disabled={!ready} className="btn-metal w-full mt-6">Kirim ke WhatsApp <span aria-hidden="true">↗</span></button>
          <p className="price-note">Data hanya disusun menjadi pesan di perangkat Anda. <a className="link-lux" href="#privasi">Privasi</a></p>
        </div>
      </div>

      <fieldset className="booking-form" disabled={!ready}>
        <legend className="sr-only">Detail reservasi</legend>
        <div>
          <span className="field-label" id="service-label">Layanan</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-labelledby="service-label">
            {(Object.keys(services) as ServiceType[]).map((key) => (
              <button
                type="button"
                key={key}
                className="service-option"
                aria-pressed={service === key}
                onClick={() => setService(key)}
              >
                {services[key].name}
                <small>{services[key].price > 0 ? rupiah(services[key].price) : 'Hubungi CS'}</small>
              </button>
            ))}
          </div>
          <p className="price-note">{selected.note}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="travel-date" className="field-label">Tanggal perjalanan</label>
            <input
              id="travel-date"
              type="date"
              required
              className="field"
              value={date}
              aria-invalid={Boolean(dateError)}
              aria-describedby={dateError ? 'date-error' : undefined}
              onChange={(e) => { setDate(e.target.value); setDateError(''); }}
            />
            {dateError && <p id="date-error" role="alert" className="field-error">{dateError}</p>}
          </div>
          <div>
            <label htmlFor="passengers" className="field-label">Jumlah penumpang</label>
            <select id="passengers" className="field cursor-pointer" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((p) => <option key={p} value={p}>{p} orang</option>)}
            </select>
          </div>
          {service === 'harian' && (
            <div className="sm:col-span-2">
              <label htmlFor="rental-duration" className="field-label">Durasi sewa</label>
              <select id="rental-duration" className="field cursor-pointer" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 7, 10, 14, 30].map((d) => (
                  <option key={d} value={d}>{d} hari — {rupiah(selected.price * d)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="pickup" className="field-label">Lokasi jemput / catatan (opsional)</label>
          <input
            id="pickup"
            type="text"
            maxLength={500}
            className="field"
            placeholder="Contoh: Hotel Pullman Bandung / Bandara Husein"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>
      </fieldset>
    </form>
  );
}
