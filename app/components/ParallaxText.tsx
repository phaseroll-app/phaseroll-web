"use client";

import { useEffect, useRef } from "react";

type ParallaxTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function ParallaxText({ children, className }: ParallaxTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.max(
        -1,
        Math.min(1, (center - window.innerHeight / 2) / window.innerHeight),
      );
      node.style.setProperty("--text-shift", `${distance * -72}px`);
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div ref={ref} className={className ? `parallax-text ${className}` : "parallax-text"}>
      {children}
    </div>
  );
}