import { APP_STORE_URL } from "../site";

export function DownloadLinks() {
  return (
    <div className="download-links" aria-label="Get PhaseRoll">
      <a className="download-links__store" href={APP_STORE_URL}>
        <svg
          className="download-links__icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M17.05 12.54c.03 3.23 2.83 4.3 2.86 4.31-.02.08-.45 1.54-1.48 3.05-.89 1.3-1.81 2.59-3.26 2.62-1.42.03-1.88-.85-3.5-.85-1.62 0-2.13.82-3.47.88-1.4.05-2.46-1.4-3.36-2.69-1.83-2.64-3.23-7.47-1.35-10.73.93-1.62 2.6-2.64 4.41-2.67 1.38-.03 2.68.94 3.52.94.84 0 2.42-1.16 4.08-.99.7.03 2.65.28 3.9 2.11-.1.06-2.33 1.36-2.3 4.02ZM14.37 4.66c.75-.91 1.26-2.17 1.12-3.43-1.08.04-2.39.72-3.17 1.63-.7.81-1.31 2.1-1.15 3.34 1.21.09 2.44-.62 3.2-1.54Z" />
        </svg>
        <span className="download-links__label">
          <span className="download-links__intro">Download on the</span>
          <span className="download-links__name">App Store</span>
        </span>
      </a>
      <div className="download-links__pending">
        <button
          className="download-links__store download-links__store--soon"
          type="button"
          disabled
          aria-label="Google Play, coming soon"
        >
          <svg
            className="download-links__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path fill="#4285F4" d="M3 2 13 12 3 22Z" />
            <path fill="#34A853" d="m3 2 14 8-4 2Z" />
            <path fill="#FBBC04" d="m17 10 3.5 2-3.5 2-4-2Z" />
            <path fill="#EA4335" d="m3 22 10-10 4 2Z" />
          </svg>
          <span className="download-links__name">Google Play</span>
        </button>
        <span className="download-links__status caption">Coming soon</span>
      </div>
    </div>
  );
}
