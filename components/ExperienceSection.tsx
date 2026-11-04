"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  organization: string;
  description: string;
  skills: string[];
  commitHash?: string;
  branch?: string;
}

export const RESUME_EXPERIENCES: ExperienceItem[] = [
  {
    id: "coderatory",
    period: "May 2026 – Present",
    role: "MERN Stack Developer",
    organization: "CODERATORY · Vendor Booking Platform",
    description:
      "Built vendor onboarding and multi-step profile setup in React Native with TypeScript. Delivered real-time listing updates with optimistic UI and live data sync in a monorepo architecture.",
    skills: ["React Native", "TypeScript", "Expo", "REST APIs", "Optimistic UI"],
  },
  {
    id: "synccai",
    period: "Feb 2026 – April 2026",
    role: "Front End Developer",
    organization: "SYNCCAI · Multi-User Music Player",
    description:
      "Developed a responsive music player UI consuming the Spotify Web API with PKCE auth. Architected multi-user rooms with real-time synchronized playback and Spotify SDK integration.",
    skills: ["React", "Vite", "Spotify API", "Web Playback SDK", "Context API"],
  },
];

interface ExperienceSectionProps {
  items?: ExperienceItem[];
  title?: string;
  subtitle?: string;
}

// Distance from the top of a card to the center of its timeline dot
const NODE_OFFSET = 32;

export default function ExperienceSection({
  items = RESUME_EXPERIENCES,
  title = "Experience",
  subtitle = "My work history, newest first, written like a commit log.",
}: ExperienceSectionProps) {
  const [nodePositions, setNodePositions] = useState<number[]>(
    items.map((_, i) => i * 260 + NODE_OFFSET)
  );

  const listRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const progressLineRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  // Measure node anchor positions; only update state when something changed
  const updateNodePositions = useCallback(() => {
    if (!listRef.current) return;
    const listRect = listRef.current.getBoundingClientRect();

    const computed = items.map((_, idx) => {
      const card = cardRefs.current[idx];
      if (!card) return idx * 260 + NODE_OFFSET;
      return Math.round(card.getBoundingClientRect().top - listRect.top + NODE_OFFSET);
    });

    setNodePositions((prev) =>
      prev.length === computed.length && prev.every((v, i) => v === computed[i])
        ? prev
        : computed
    );
  }, [items]);

  useEffect(() => {
    updateNodePositions();

    let animationFrameId = 0;

    // Writes straight to the DOM so scrolling never triggers a React re-render
    const updateScrollProgress = () => {
      const card0 = cardRefs.current[0];
      const cardLast = cardRefs.current[items.length - 1];
      if (!card0 || !cardLast) return;

      const card0Rect = card0.getBoundingClientRect();
      const cardLastRect = cardLast.getBoundingClientRect();

      const totalDistance = Math.max(1, cardLastRect.top - card0Rect.top);

      // The line fills when the first card reaches 45% of the viewport height
      const triggerY = window.innerHeight * 0.45;
      const progress = Math.max(0, Math.min(1, (triggerY - card0Rect.top) / totalDistance));

      // Distance travelled from the FIRST node (not from the top of the track)
      const fillHeight = progress * totalDistance;

      if (progressLineRef.current) {
        progressLineRef.current.style.height = `${fillHeight}px`;
      }
      if (indicatorRef.current) {
        // One single transform: center on the line, then move down by fillHeight.
        // `top` already places the dot at the first node, so don't add it again.
        indicatorRef.current.style.transform = `translate(-50%, calc(-50% + ${fillHeight}px))`;
      }
    };

    const handleScrollOrResize = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        updateNodePositions();
        updateScrollProgress();
      });
    };

    updateScrollProgress();

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [items, updateNodePositions]);

  const firstNodeY = nodePositions[0] ?? NODE_OFFSET;
  const lastNodeY = nodePositions[nodePositions.length - 1] ?? firstNodeY + 260;
  const totalLineHeight = Math.max(1, lastNodeY - firstNodeY);

  return (
    <section
      id="experience"
      aria-label="Experience section"
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 2xl:py-36 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 2xl:px-20 bg-[#04140D] bg-[image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] text-white selection:bg-[#10B981] selection:text-black overflow-hidden"
    >
      <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto">
        {/* Section Header */}
        <header className="mb-10 sm:mb-12 md:mb-14 lg:mb-16 xl:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-emerald-100/60 font-normal">
            {subtitle}
          </p>
        </header>

        {/* Timeline & Cards Layout */}
        <div ref={listRef} className="relative flex items-start gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-16">
          {/* Left Vertical Timeline Track */}
          <div
            aria-hidden="true"
            className="relative flex flex-col items-center shrink-0 w-8 sm:w-10 md:w-12 lg:w-14 xl:w-16 self-stretch"
            style={{ minHeight: `${lastNodeY + NODE_OFFSET}px` }}
          >
            {/* Base timeline line */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-[#0c2e22] rounded-full"
              style={{ top: `${firstNodeY}px`, height: `${totalLineHeight}px` }}
            />

            {/* Scroll-driven green progress line */}
            <div
              ref={progressLineRef}
              className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-[#10B981] rounded-full motion-reduce:transition-none"
              style={{ top: `${firstNodeY}px`, height: "0px" }}
            />

            {/* Static timeline dots */}
            {items.map((item, index) => {
              const nodeY = nodePositions[index] ?? index * 260 + NODE_OFFSET;
              return (
                <div
                  key={`node-${item.id}`}
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 xl:size-4 2xl:size-4.5 rounded-full border-2 border-emerald-700 bg-[#04140D] z-10"
                  style={{ top: `${nodeY}px` }}
                />
              );
            })}

            {/* Scroll-driven indicator dot */}
            <div
              ref={indicatorRef}
              className="absolute left-1/2 size-3.5 xl:size-4 2xl:size-4.5 rounded-full bg-[#10B981] border-2 border-[#10B981] pointer-events-none z-20"
              style={{
                top: `${firstNodeY}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          {/* Right Column: Experience Cards */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 sm:gap-7 md:gap-8 lg:gap-10 xl:gap-12">
            {items.map((item, index) => (
              <article
                key={item.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="relative rounded-2xl 2xl:rounded-3xl border border-emerald-950/60 bg-[#061711]/75 p-5 sm:p-6 md:p-8 lg:p-9 xl:p-11 2xl:p-14 backdrop-blur-md"
              >
                <div className="mb-2">
                  <span className="text-xs sm:text-sm lg:text-base font-mono text-emerald-300/70 font-medium tracking-wide">
                    {item.period}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight">
                  {item.role}
                </h3>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-[#34D399] mt-1 md:mt-2">
                  {item.organization}
                </p>

                <p className="mt-3 md:mt-4 xl:mt-5 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-zinc-300 font-normal leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 md:mt-6 xl:mt-8 flex flex-wrap gap-2 sm:gap-2.5 lg:gap-3 xl:gap-4">
                  {item.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-md 2xl:rounded-lg border border-emerald-950/70 bg-[#051912] px-2.5 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-emerald-300/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}