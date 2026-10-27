import React, { useEffect, useState } from 'react';
import siteData from '../data/site.json';
import { rupiah, whatsappUrl } from '../data/contact';

export type ServiceType = 'drop-off' | 'harian' | 'luar-kota';

const services: Record<ServiceType, { name: string; price: number; note: string }> = {
  'drop-off': {
    name: siteData.pricing.dropOff.name,
    price: siteData.pricing.dropOff.price,
    note: siteData.pricing.dropOff.serviceNote,
  },
  'harian': {
    name: siteData.pricing.harian.name,
    price: siteData.pricing.harian.price,
    note: siteData.pricing.harian.serviceNote,
  },
  'luar-kota': {
    name: siteData.pricing.custom.name,
    price: 0,
    note: siteData.pricing.custom.serviceNote,
  },
};

export function estimate(service: ServiceType, duration: number): number | null {
  if (service === 'drop-off') return services[service].price;
  if (service === 'harian') return services[service].price * duration;
  return null;
}

export function buildReservationMessage(input: { service: ServiceType; date: string; passengers: number; duration: number; pickup: string }): string {
  const { service, date, passengers, duration } = input;
  const pickup = input.pickup.trim();
  const total = estimate(service, duration);
  const travelDate = new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const b = siteData.booking;
  return [
    siteData.contact.defaultMessage,
    '',
    `*${b.messageTitle}*`,
    '',
    `*${b.serviceLabel}:* ${services[service].name}`,
    `*${b.dateLabel}:* ${travelDate}`,
    `*${b.passengersLabel}:* ${passengers} ${b.passengerUnit}`,
    ...(service === 'harian' ? [`*${b.durationLabel}:* ${duration} ${b.dayUnit}`] : []),
    `*${b.pickupMessageLabel}:* ${pickup || '-'}`,
    `*${b.estimateLabel}:* ${total !== null ? rupiah(total) : b.contactPrice}`,
    '',
    `_${b.messageDisclaimer}_`,
    '',
    b.messageThanks,
  ].join('\n');
}

export default function BookingEstimator() {
  const b = siteData.booking;
  const [service, setService] = useState<ServiceType>('harian');
  const [duration, setDuration] = useState<number>(b.durationOptions[0] ?? 1);
  const [date, setDate] = useState<string>('');
  const [pickup, setPickup] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(b.passengerOptions[1] ?? b.passengerOptions[0] ?? 2);
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
      setDateError(b.dateError);
      e.currentTarget.querySelector<HTMLInputElement>('#travel-date')?.focus();
      return;
    }
    setDateError('');
    const text = buildReservationMessage({ service, date, passengers, duration, pickup });
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
  };

  return (
    <form id="reservasi" className="booking" onSubmit={handleBookWhatsApp} aria-busy={!ready} noValidate>
      <div className="booking-summary">
        <div className="booking-intro">
          <p className="eyebrow">{b.badge}</p>
          <h3 className="display">{b.title} <em>{b.titleEm}</em></h3>
          <p className="text-silver-400">{b.lead}</p>
          {!ready && <p role="status" className="text-sm text-silver-400">{b.loadingText} <a className="link-lux" href={whatsappUrl()}>{b.directLinkText}</a>.</p>}
        </div>
        <div className="booking-total">
          <span className="field-label">{b.estimateLabel}</span>
          <p className="price !m-0" aria-live="polite">
            {totalPrice !== null ? rupiah(totalPrice) : b.contactPrice}
          </p>
          <p className="price-note">{b.estimateNote}</p>
          <button type="submit" disabled={!ready} className="btn-metal w-full mt-6">{b.buttonText} <span aria-hidden="true">↗</span></button>
          <p className="price-note">{b.privacyNote} <a className="link-lux" href="#privasi">{siteData.legal.privacyTitle}</a></p>
        </div>
      </div>

      <fieldset className="booking-form" disabled={!ready}>
        <legend className="sr-only">{b.legend}</legend>
        <div>
          <span className="field-label" id="service-label">{b.serviceLabel}</span>
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
                <small>{services[key].price > 0 ? rupiah(services[key].price) : b.contactPrice}</small>
              </button>
            ))}
          </div>
          <p className="price-note">{selected.note}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="travel-date" className="field-label">{b.dateLabel}</label>
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
            <label htmlFor="passengers" className="field-label">{b.passengersLabel}</label>
            <select id="passengers" className="field cursor-pointer" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
              {b.passengerOptions.map((p) => <option key={p} value={p}>{p} {b.passengerUnit}</option>)}
            </select>
          </div>
          {service === 'harian' && (
            <div className="sm:col-span-2">
              <label htmlFor="rental-duration" className="field-label">{b.durationLabel}</label>
              <select id="rental-duration" className="field cursor-pointer" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {b.durationOptions.map((d) => (
                  <option key={d} value={d}>{d} {b.dayUnit} — {rupiah(selected.price * d)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="pickup" className="field-label">{b.pickupLabel}</label>
          <input
            id="pickup"
            type="text"
            maxLength={500}
            className="field"
            placeholder={b.pickupPlaceholder}
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>
      </fieldset>
    </form>
  );
}
