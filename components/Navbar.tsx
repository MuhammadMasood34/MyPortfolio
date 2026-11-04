"use client";

import { useState, useEffect } from "react";
import { LuGlobe, LuGithub, LuLinkedin, LuMenu, LuX } from "react-icons/lu";

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experiences", href: "#experience" },
  { label: "Projects", href: "#experience" },
  { label: "Educations", href: "#about" },
  { label: "Contact", href: "#contact" },
];

interface NavbarProps {
  brandName?: string;
  items?: NavItem[];
  resumeHref?: string;
  githubHref?: string;
  linkedinHref?: string;
}

export default function Navbar({
  brandName = "Muhammad Masood",
  items = NAV_ITEMS,
  resumeHref = "/documents/Resume.pdf",
  githubHref = "https://github.com",
  linkedinHref = "https://linkedin.com",
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("about");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const sections = ["about", "skills", "experience", "contact"];

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#04140D]/85 border-b border-emerald-950/60 transition-all duration-300">
      <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#about"
          className="font-extrabold text-base sm:text-lg md:text-xl xl:text-2xl tracking-tight bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#10B981] bg-clip-text text-transparent hover:opacity-90 transition-opacity"
        >
          {brandName}
        </a>

        {/* Center Nav Links (Desktop) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 lg:gap-8">
          {items.map((item) => {
            const sectionTarget = item.href.replace("#", "");
            const isActive = activeSection === sectionTarget;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`text-xs lg:text-sm font-medium transition-colors duration-200 relative py-1 ${isActive
                    ? "text-[#34D399] font-semibold"
                    : "text-zinc-300 hover:text-[#34D399]"
                  }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Actions & Socials (Desktop) */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {/* Resume CTA Button */}
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 lg:px-5 lg:py-2 rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#0ea371] hover:to-[#28be88] text-[#03150e] font-bold text-xs lg:text-sm shadow-md shadow-[#10B981]/25 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Resume
          </a>

          {/* Language Indicator Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-950/80 bg-[#061711] text-xs font-medium text-emerald-200/80 select-none">
            <LuGlobe className="size-3.5 text-[#34D399]" aria-hidden="true" />
            <span>EN</span>
          </div>

          {/* GitHub Icon Link */}
          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="text-zinc-400 hover:text-[#34D399] hover:scale-110 transition-all duration-200 p-1"
          >
            <LuGithub className="size-4 lg:size-5" />
          </a>

          {/* LinkedIn Icon Link */}
          <a
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="text-zinc-400 hover:text-[#34D399] hover:scale-110 transition-all duration-200 p-1"
          >
            <LuLinkedin className="size-4 lg:size-5" />
          </a>
        </div>

        {/* Mobile Actions: Resume + Hamburger Toggle Button */}
        <div className="flex md:hidden items-center gap-2 sm:gap-3">
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#03150e] font-bold text-xs shadow-md shadow-[#10B981]/25"
          >
            Resume
          </a>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg border border-emerald-950/80 bg-[#061711] text-zinc-300 hover:text-[#34D399] transition-colors"
          >
            {isMobileMenuOpen ? <LuX className="size-5" /> : <LuMenu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-950/60 bg-[#04140D]/95 backdrop-blur-xl px-6 py-5 animate-fade-in">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-3.5">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-300 hover:text-[#34D399] transition-colors py-1"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 pt-4 border-t border-emerald-950/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-950/80 bg-[#061711] text-xs font-medium text-emerald-200/80">
              <LuGlobe className="size-3.5 text-[#34D399]" aria-hidden="true" />
              <span>EN</span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={githubHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="text-zinc-400 hover:text-[#34D399] transition-colors"
              >
                <LuGithub className="size-5" />
              </a>
              <a
                href={linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="text-zinc-400 hover:text-[#34D399] transition-colors"
              >
                <LuLinkedin className="size-5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

