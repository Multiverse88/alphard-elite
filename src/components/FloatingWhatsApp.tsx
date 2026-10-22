import React from 'react';

export default function FloatingWhatsApp() {
  const waUrl = "https://wa.me/62818804288?text=Halo%20Alphard%20Elite%2C%20saya%20dapat%20kontak%20dari%20website";

  return (
    <div className="fixed bottom-6 right-6 z-(--z-float) flex items-center gap-3">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Alphard Elite"
        className="relative flex items-center justify-center w-14 h-14 rounded-full border border-silver-300/40 bg-ink-850/80 backdrop-blur text-silver-50 shadow-[0_12px_30px_-10px_rgba(0,0,0,.9)] hover:border-silver-200 hover:bg-ink-800 active:scale-95 transition duration-200"
      >
        <svg className="w-7 h-7 fill-current" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.179L2 22l4.966-1.301C8.411 21.523 10.147 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
        </svg>
      </a>
    </div>
  );
}
