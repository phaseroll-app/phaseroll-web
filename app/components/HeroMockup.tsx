"use client";

import { useEffect, useRef } from "react";
import { PhoneMockup } from "./PhoneMockup";

type HeroMockupProps = {
  src: string;
  alt: string;
  caption: string;
  slot: string;
};

export function HeroMockup(props: HeroMockupProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const heroContent = scene
      .closest(".hero__inner")
      ?.querySelector<HTMLElement>(".hero__head");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    const syncHeight = () => {
      if (heroContent) {
        scene.style.setProperty(
          "--hero-content-height",
          `${heroContent.getBoundingClientRect().height}px`,
        );
      }
    };
    const update = () => {
      frame = 0;
      syncHeight();
      const rect = scene.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const progress = Math.max(-1, Math.min(1, (viewportCenter - rect.top) / window.innerHeight));
      scene.style.setProperty("--parallax-y", `${progress * 28}px`);
      scene.style.setProperty("--parallax-turn", `${progress * 0.6}deg`);
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const contentObserver = new ResizeObserver(syncHeight);
    if (heroContent) contentObserver.observe(heroContent);

    syncHeight();
    if (!reduceMotion) {
      update();
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      contentObserver.disconnect();
      if (!reduceMotion) {
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestUpdate);
      }
    };
  }, []);

  return (
    <div className="hero-device" ref={sceneRef}>
      <div className="hero-device__motion develop">
        <div className="hero-device__orbit" aria-hidden="true" />
        <PhoneMockup {...props} className="mockup--hero" priority />
      </div>
    </div>
  );
}