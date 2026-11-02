"use client";

import { useState, useMemo, type ComponentType, type CSSProperties } from "react";
import {
  SiReact,
  SiNextdotjs,
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiBootstrap,
  SiMongodb,
  SiGithub,
} from "react-icons/si";
import { LuMonitorSmartphone } from "react-icons/lu";
import { FigmaIcon } from "./SkillIcons";

/* ================= EDIT YOUR CONTENT HERE ================= */

export type SkillCategory = "all" | "frontend" | "backend" | "tools" | "concepts";

export interface CategoryTab {
  id: SkillCategory;
  label: string;
}

export interface SkillItem {
  name: string;
  category: "frontend" | "backend" | "tools" | "concepts";
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  iconColor?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

// 1. Category tabs
export const CATEGORIES: CategoryTab[] = [
  { id: "all", label: "🚀 All Skills" },
  { id: "frontend", label: "🎨 Frontend" },
  { id: "backend", label: "⚙️ Backend" },
  { id: "tools", label: "🛠️ Tools" },
  { id: "concepts", label: "💡 Concepts" },
];

// 2. All Skills in order (12 cards)
export const ALL_SKILLS: SkillItem[] = [
  { name: "React", category: "frontend", icon: SiReact, iconColor: "#61DAFB" },
  { name: "Next.js", category: "frontend", icon: SiNextdotjs, iconColor: "#FFFFFF" },
  { name: "JavaScript", category: "frontend", icon: SiJavascript, iconColor: "#F7DF1E" },
  { name: "TypeScript", category: "frontend", icon: SiTypescript, iconColor: "#3178C6" },
  { name: "HTML", category: "frontend", icon: SiHtml5, iconColor: "#E34F26" },
  { name: "CSS", category: "frontend", icon: SiCss, iconColor: "#1572B6" },
  { name: "Tailwind CSS", category: "frontend", icon: SiTailwindcss, iconColor: "#06B6D4" },
  { name: "Bootstrap", category: "frontend", icon: SiBootstrap, iconColor: "#7952B3" },
  { name: "MongoDB", category: "backend", icon: SiMongodb, iconColor: "#47A248" },
  { name: "GitHub", category: "tools", icon: SiGithub, iconColor: "#FFFFFF" },
  { name: "Figma", category: "tools", icon: FigmaIcon },
  { name: "Responsive Design", category: "concepts", icon: LuMonitorSmartphone, iconColor: "#38BDF8" },
];

// 3. Stats row content
export const STATS: StatItem[] = [
  { value: "15+", label: "Technologies" },
  { value: "10+", label: "Projects" },
  { value: "3+", label: "Months Experience" },
  { value: "Always", label: "Learning" },
];

/* ================= LEGACY EXPORTS (BACKWARD COMPATIBILITY) ================= */

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
  title?: string;
  skills?: SkillItem[];
  categories?: CategoryTab[];
  stats?: StatItem[];
  roles?: Role[];
}

export default function SkillsSection({
  title = "Skills for the role",
  skills = ALL_SKILLS,
  categories = CATEGORIES,
  stats = STATS,
}: SkillsSectionProps) {
  const [activeTab, setActiveTab] = useState<SkillCategory>("all");

  // Memoize filtered skills to avoid unnecessary recomputations
  const filteredSkills = useMemo(() => {
    if (activeTab === "all") return skills;
    return skills.filter((skill) => skill.category === activeTab);
  }, [activeTab, skills]);

  return (
    <section
      id="skills"
      aria-label="Skills section"
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 2xl:py-36 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 2xl:px-20 bg-[#04140D] bg-[image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] text-white selection:bg-[#10B981] selection:text-black overflow-hidden"
    >
      {/* Soft subtle emerald glow behind the grid (approx 5-6% opacity, heavily blurred) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div className="w-[600px] h-[350px] sm:w-[800px] sm:h-[450px] bg-[#10B981]/[0.06] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white mb-6 sm:mb-8">
          {title}
        </h2>

        {/* 1. Category Tabs */}
        <div
          role="tablist"
          aria-label="Skill categories"
          className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-10"
        >
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                id={`tab-${cat.id}`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls="skills-tabpanel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-white whitespace-nowrap ${
                  isActive
                    ? "bg-[#10B981] text-[#03150e] border border-[#10B981] shadow-lg shadow-[#10B981]/25 font-bold"
                    : "bg-[#061711] text-emerald-100/60 border border-emerald-950/80 hover:border-[#10B981] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 2 & 4. Skills Grid Tabpanel (with minimum height to prevent stats row layout jumps) */}
        <div
          id="skills-tabpanel"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[400px] xl:min-h-[380px]"
        >
          <div
            key={activeTab}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 animate-fade-in motion-reduce:animate-none"
          >
            {filteredSkills.map((skill) => {
              const Icon = skill.icon;
              return (
                <article
                  key={skill.name}
                  className="group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-emerald-950/60 bg-[#061711]/75 backdrop-blur-md hover:border-[#10B981] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#10B981]/10 transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:transform-none cursor-default"
                >
                  <div
                    className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14"
                    aria-hidden="true"
                  >
                    <Icon
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                      style={skill.iconColor ? { color: skill.iconColor } : undefined}
                    />
                  </div>
                  <span className="mt-3 text-xs sm:text-sm font-bold text-white text-center tracking-tight">
                    {skill.name}
                  </span>
                </article>
              );
            })}
          </div>
        </div>

        {/* 5. Stats Row (4 across on desktop, 2 x 2 on mobile) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-10 sm:mt-12 md:mt-14">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="flex flex-col items-center justify-center p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-emerald-950/60 bg-[#061711]/75 backdrop-blur-md hover:border-[#10B981] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#10B981]/10 transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:transform-none text-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#10B981] to-emerald-300 bg-clip-text text-transparent tracking-tight">
                {stat.value}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-emerald-100/60 font-medium tracking-wide">
                {stat.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { SkillsSection as SkillsRoleFit };
