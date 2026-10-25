"use client";

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { PhoneMockup } from "./PhoneMockup";

type ScreenshotGalleryProps = {
  screens: ComponentProps<typeof PhoneMockup>[];
};

export function ScreenshotGallery({ screens }: ScreenshotGalleryProps) {
  const galleryId = useId();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const updateEdges = () => {
      setEdges({
        start: gallery.scrollLeft <= 1,
        end: gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 1,
      });
    };
    const observer = new ResizeObserver(updateEdges);
    observer.observe(gallery);
    if (gallery.firstElementChild) observer.observe(gallery.firstElementChild);
    gallery.addEventListener("scroll", updateEdges, { passive: true });
    return () => {
      observer.disconnect();
      gallery.removeEventListener("scroll", updateEdges);
    };
  }, []);

  function scroll(direction: -1 | 1) {
    const gallery = galleryRef.current;
    const screen = gallery?.firstElementChild;
    if (!gallery || !screen) return;

    const gap = parseFloat(getComputedStyle(gallery).columnGap);
    gallery.scrollBy({
      left: direction * (screen.getBoundingClientRect().width + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <div className="screenshot-gallery">
      <div className="mockups-heading">
        <p className="caption" id={`${galleryId}-label`}>Inside the app</p>
        <div className="mockups-controls">
          <button
            type="button"
            aria-label="Previous app screen"
            aria-controls={galleryId}
            disabled={edges.start}
            onClick={() => scroll(-1)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next app screen"
            aria-controls={galleryId}
            disabled={edges.end}
            onClick={() => scroll(1)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m10 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
      <div
        className="mockups"
        id={galleryId}
        ref={galleryRef}
        tabIndex={0}
        role="group"
        aria-labelledby={`${galleryId}-label`}
      >
        {screens.map((screen) => <PhoneMockup key={screen.src} {...screen} />)}
      </div>
    </div>
  );
}
