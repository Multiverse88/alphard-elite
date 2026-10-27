import { useState, useEffect, useRef } from 'react';
import type siteData from '../data/site.json';

export interface MediaItem {
  id: string;
  type: 'video' | 'image';
  title: string;
  subtitle?: string;
  src: string;
  poster?: string;
  aspect?: 'video' | 'vertical';
}

interface Props {
  items: MediaItem[];
  labels: typeof siteData.gallery.labels;
}

export default function MediaGallery({ items: initialItems, labels: initialLabels }: Props) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [labels, setLabels] = useState(initialLabels);
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    const onMsg = (e: MessageEvent) => {
      if (e.data && typeof e.data === 'object' && e.data.type === 'cms:update' && e.data.siteData?.gallery) {
        setItems(e.data.siteData.gallery.items);
        setLabels(e.data.siteData.gallery.labels);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!activeItem) return;
    const previousOverflow = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [activeItem]);

  return (
    <>
      <div className="gallery-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={!ready}
            className="gallery-card"
            data-shape={item.aspect === 'video' ? 'wide' : item.aspect === 'vertical' ? 'tall' : undefined}
            aria-label={`${item.type === 'video' ? labels.playVideo : labels.enlargePhoto}: ${item.title}`}
            aria-haspopup="dialog"
            onClick={() => {
              setMediaError(false);
              setLoading(item.type === 'video');
              setActiveItem(item);
            }}
          >
            <img src={item.poster || item.src} alt={item.title} loading="lazy" decoding="async" width="1200" height="900" />
            {item.type === 'video' && (
              <span className="play" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            )}
            <span className="caption">
              <small>{item.type === 'video' ? labels.video : labels.photo}</small>
              <span>{item.title}</span>
            </span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialog}
        className="media-dialog"
        aria-labelledby="media-title"
        onClose={() => setActiveItem(null)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close();
        }}
      >
        {activeItem && (
          <>
            <header>
              <h3 id="media-title">{activeItem.title}</h3>
              <button type="button" className="btn-ghost !min-h-10 !py-1.5" onClick={() => dialog.current?.close()} autoFocus aria-label={labels.closeLabel}>{labels.close}</button>
            </header>
            {activeItem.type === 'video' ? (
              <video
                key={activeItem.id}
                src={activeItem.src}
                poster={activeItem.poster}
                controls
                autoPlay
                playsInline
                onWaiting={() => setLoading(true)}
                onPlaying={() => setLoading(false)}
                onLoadedData={() => setLoading(false)}
                onError={() => { setMediaError(true); setLoading(false); }}
              />
            ) : (
              <img src={activeItem.src} alt={activeItem.title} onError={() => setMediaError(true)} />
            )}
            {loading && <p role="status">{labels.loading}</p>}
            {mediaError && <p role="alert">{labels.error} <a href={activeItem.src} target="_blank" rel="noopener noreferrer">{labels.openFile}</a> {labels.retry}</p>}
            {activeItem.subtitle && <p>{activeItem.subtitle}</p>}
          </>
        )}
      </dialog>
    </>
  );
}
