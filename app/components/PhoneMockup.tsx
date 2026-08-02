"use client";

import { useCallback, useState } from "react";

type PhoneMockupProps = {
  src: string;
  alt: string;
  caption: string;
  slot: string;
  priority?: boolean;
  className?: string;
};

const WIDTH = 540;
const HEIGHT = 1170;

export function PhoneMockup({
  src,
  alt,
  caption,
  slot,
  priority = false,
  className,
}: PhoneMockupProps) {
  const [missing, setMissing] = useState(false);

  // Catches a 404 that already happened before React hydrated.
  const checkLoaded = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) setMissing(true);
  }, []);

  return (
    <figure className={className ? `mockup ${className}` : "mockup"}>
      <div className="phone">
        <div className="phone__media">
          {missing ? (
            <div className="phone__blank">
              <span className="caption">{slot}</span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- swappable static mockup, not a content image
            <img
              ref={checkLoaded}
              className="phone__img"
              src={src}
              alt={alt}
              width={WIDTH}
              height={HEIGHT}
              loading={priority ? "eager" : "lazy"}
              decoding={priority ? "sync" : "async"}
              onError={() => setMissing(true)}
            />
          )}
        </div>
      </div>
      <figcaption className="caption">{caption}</figcaption>
    </figure>
  );
}
