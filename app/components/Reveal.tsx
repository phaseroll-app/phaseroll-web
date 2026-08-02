"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
};

/** 200ms opacity fade on scroll-in. Nothing more. */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.max(
        -1,
        Math.min(1, (center - window.innerHeight / 2) / window.innerHeight),
      );
      node.style.setProperty("--title-shift", `${distance * -76}px`);
      node.style.setProperty("--copy-shift", `${distance * -42}px`);
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateParallax);
    };

    if (typeof IntersectionObserver === "undefined") {
      node.dataset.shown = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    if (!reducedMotion.matches) {
      updateParallax();
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
    }

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown}
      className={className ? `reveal ${className}` : "reveal"}
    >
      {children}
    </div>
  );
}
