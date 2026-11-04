"use client";

import { useEffect, useId, useRef, useState } from "react";
import { mountStation, type StationController } from "@/lib/dev-station/scene";
import { StationBadges, StationPlaceholderContent } from "./DevStationPlaceholder";
import styles from "./DevStation.module.css";

export default function DeveloperDesk3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<StationController | null>(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const instructionsId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || unavailable) return;
    let controller: StationController | undefined;
    let failureFrame = 0;
    try {
      controller = mountStation(container, () => setReady(true), () => setUnavailable(true));
      controllerRef.current = controller;
    } catch {
      // WebGL2 can be blocked or the device can exhaust its available contexts.
      failureFrame = requestAnimationFrame(() => setUnavailable(true));
    }
    return () => {
      cancelAnimationFrame(failureFrame);
      controller?.dispose();
      controllerRef.current = null;
    };
  }, [unavailable]);

  return (
    <figure className={styles.frame} aria-label="Interactive 3D developer workspace">
      <div
        ref={containerRef}
        className={styles.canvas}
        role="group"
        tabIndex={unavailable ? undefined : 0}
        aria-label="Developer at a wooden desk with dual monitors and a mint-lit PC"
        aria-describedby={instructionsId}
        aria-busy={!ready && !unavailable}
        onPointerDown={(event) => event.currentTarget.focus({ preventScroll: true })}
        onKeyDown={(event) => {
          if (controllerRef.current?.handleKey(event.key)) event.preventDefault();
        }}
      />
      {(!ready || unavailable) && <StationPlaceholderContent unavailable={unavailable} />}
      <StationBadges />
      {ready && !unavailable && (
        <button className={styles.reset} type="button" onClick={() => controllerRef.current?.reset()} aria-label="Reset workspace camera">
          Reset view
        </button>
      )}
      <figcaption id={instructionsId} className="sr-only">
        Drag to orbit and scroll to zoom. On a touch screen, use two fingers to orbit and pinch to zoom.
        With the workspace focused, use the arrow keys to orbit, plus and minus to zoom, and R to reset the view.
      </figcaption>
    </figure>
  );
}
