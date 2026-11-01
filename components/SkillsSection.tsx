"use client";

import { useState } from "react";

/* ================= EDIT YOUR CONTENT HERE ================= */

// level: "Daily" | "Comfortable" | "Learning"  (keep these honest)
export const SKILLS = {
  React: { level: "Daily", projects: ["Spotify Clone", "SYNCCAI"] },
  "Next.js": { level: "Comfortable", projects: ["syncaai.com"] },
  TypeScript: { level: "Comfortable", projects: ["CODERATORY", "Muntazim"] },
  JavaScript: { level: "Daily", projects: ["Spotify Clone", "OrderFlow"] },
  HTML: { level: "Daily", projects: [] },
  CSS: { level: "Daily", projects: [] },
  "Tailwind CSS": { level: "Daily", projects: ["syncaai.com"] },
  Bootstrap: { level: "Comfortable", projects: [] },
  "Responsive Design": { level: "Daily", projects: ["SYNCCAI"] },
  Figma: { level: "Comfortable", projects: [] },
  Vite: { level: "Comfortable", projects: ["SYNCCAI"] },
  "Context API": { level: "Comfortable", projects: ["SYNCCAI"] },
  "React Native": { level: "Comfortable", projects: ["CODERATORY", "Muntazim"] },
  Expo: { level: "Comfortable", projects: ["Muntazim"] },
  "Optimistic UI": { level: "Comfortable", projects: ["CODERATORY"] },
  "Node.js": { level: "Daily", projects: ["OrderFlow"] },
  Express: { level: "Comfortable", projects: ["OrderFlow"] },
  "REST APIs": { level: "Comfortable", projects: ["OrderFlow"] },
  MongoDB: { level: "Daily", projects: ["OrderFlow"] },
  MySQL: { level: "Learning", projects: [] },
  "Spotify Web API": { level: "Comfortable", projects: ["SYNCCAI"] },
  "PKCE auth": { level: "Comfortable", projects: ["SYNCCAI"] },
  Git: { level: "Daily", projects: [] },
  GitHub: { level: "Daily", projects: [] },
  OOP: { level: "Comfortable", projects: [] },
  "Data Structures": { level: "Comfortable", projects: [] },
} as const;

export interface Role {
  id: string;
  label: string;
  summary: string;
  primary: string[];
  secondary?: string[];
}

// primary = shown first and large, in this order.
export const ROLES: Role[] = [
  {
    id: "frontend",
    label: "Frontend",
    summary: "I build fast, responsive interfaces in React and Next.js, with TypeScript and Tailwind.",
    primary: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML", "CSS", "Responsive Design"],
    secondary: ["Figma", "Vite", "Bootstrap", "Context API", "Git", "GitHub"],
  },
  {
    id: "fullstack",
    label: "Full-stack",
    summary: "I can take a feature from the screen to the database: React, Node.js, Express and MongoDB.",
    primary: ["React", "Node.js", "Express", "MongoDB", "REST APIs", "Next.js", "TypeScript"],
    secondary: ["MySQL", "PKCE auth", "Spotify Web API", "JavaScript", "Git", "GitHub"],
  },
  {
    id: "mobile",
    label: "Mobile",
    summary: "I build cross-platform apps in React Native and Expo, with instant-feeling updates.",
    primary: ["React Native", "Expo", "TypeScript", "Optimistic UI", "React", "JavaScript"],
    secondary: ["REST APIs", "Context API", "Figma", "Git", "GitHub"],
  },
];

/* ========================================================== */

interface SkillsSectionProps {
  roles?: Role[];
  title?: string;
  subtitle?: string;
}

export default function SkillsSection({
  roles = ROLES,
  title = "Skills for the role",
  subtitle = "Pick the kind of role you're hiring for and I'll put the most relevant skills first.",
}: SkillsSectionProps) {
  const [roleId, setRoleId] = useState<string>(roles[0]?.id ?? "frontend");
  const idx = Math.max(
    0,
    roles.findIndex((r) => r.id === roleId)
  );
  const currentRole = roles[idx] ?? roles[0];

  return (
    <section
      id="skills"
      aria-label="Skills for the role"
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 2xl:py-36 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 2xl:px-20 bg-[#04140D] bg-[image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] text-white selection:bg-[#10B981] selection:text-black overflow-hidden"
    >
      <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto">
        {/* Section Heading */}
        <header className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-emerald-100/60 font-normal max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </header>

        {/* Segmented Role Toggle Control */}
        <div
          role="group"
          aria-label="Select role"
          className="relative inline-grid grid-cols-3 p-1 rounded-xl sm:rounded-2xl border border-emerald-950/80 bg-[#061711]/90 w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] shadow-inner shadow-black/40"
        >
          {/* Animated Green Slider Indicator */}
          <span
            className="absolute top-1 bottom-1 left-1 rounded-lg sm:rounded-xl bg-[#10B981] shadow-md shadow-[#10B981]/25 transition-transform duration-300 ease-[cubic-bezier(0.3,0.8,0.3,1)] motion-reduce:transition-none"
            style={{
              width: `calc((100% - 8px) / ${roles.length})`,
              transform: `translateX(${idx * 100}%)`,
            }}
            aria-hidden="true"
          />

          {roles.map((r) => {
            const isSelected = r.id === roleId;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setRoleId(r.id)}
                className={`relative z-10 py-2.5 sm:py-3 px-2 sm:px-3 text-center text-xs sm:text-sm lg:text-base xl:text-lg font-semibold rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-white ${isSelected ? "text-[#03150e]" : "text-emerald-100/60 hover:text-white"
                  }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Role Content View with Smooth Fade Transition */}
        <div key={roleId} className="animate-fade-in">
          {/* Role Summary */}
          <p className="mt-6 sm:mt-8 mb-6 sm:mb-8 text-base sm:text-lg md:text-xl lg:text-2xl text-[#cfe5da] leading-relaxed max-w-3xl font-normal">
            {currentRole.summary}
          </p>

          {/* Label */}
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base font-semibold tracking-wide uppercase text-emerald-300/70">
            Most relevant
          </p>

          {/* Clean Primary Skills Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8">
            {currentRole.primary.map((name) => (
              <article
                key={name}
                className="rounded-xl sm:rounded-2xl 2xl:rounded-3xl border border-emerald-950/60 bg-[#061711]/75 p-5 sm:p-6 lg:p-7 xl:p-8 backdrop-blur-md hover:border-[#10B981] hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#10B981]/10 flex items-center"
              >
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-white tracking-tight">
                  {name}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { SkillsSection as SkillsRoleFit };

