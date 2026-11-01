# Skills & Next.js Development Best Practices

This guide establishes the architectural standards, component conventions, theming rules, responsiveness strategies, and quality assurance commands for the **MyPortfolio** codebase.

---

## 1. Next.js Architecture & Best Practices

### 1.1 App Router Conventions
- **Server Component Default**: Keep pages (`app/page.tsx`) and layouts (`app/layout.tsx`) as Server Components wherever possible to maximize static prerendering (SSG), reduce client JavaScript payloads, and enhance Core Web Vitals.
- **Client Component Boundaries**: Mark components with `"use client"` exclusively when client-side interactivity, DOM measurement, React state (`useState`), effects (`useEffect`), or refs (`useRef`) are required (e.g., [`ExperienceSection.tsx`](file:///d:/nextjs%20projects/MyPortfolio/components/ExperienceSection.tsx)).
- **Pure Render Integrity**: Do not access React `ref.current` values directly during the render cycle. Compute positions and layout offsets inside `useEffect`, `useCallback`, or event handlers, and update local state to preserve React's concurrent rendering guarantees.

### 1.2 Image & Asset Optimization
- Use `next/image` with explicit width/height or fluid fill layouts.
- Add `priority` to above-the-fold hero images to avoid LCP (Largest Contentful Paint) delays.
- Always provide descriptive `alt` text for accessibility.

### 1.3 TypeScript Rigor
- Maintain strict typing throughout the project (`tsconfig.json` with `strict: true`).
- Prohibit implicit `any` types on function parameters, handlers, and component props.
- Export reusable TypeScript interfaces alongside their components for ease of consumption.

---

## 2. Reusable Component Guidelines

### 2.1 Decoupled Data & Self-Contained Components
- Structure components so that presentation is decoupled from static datasets.
- Example: [`ExperienceSection.tsx`](file:///d:/nextjs%20projects/MyPortfolio/components/ExperienceSection.tsx) exports an `ExperienceItem` interface and accepts an optional `items` prop, falling back to default data if omitted:

```tsx
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

interface ExperienceSectionProps {
  items?: ExperienceItem[];
  title?: string;
  subtitle?: string;
}
```

### 2.2 Semantic HTML & Accessibility (a11y)
- Use semantic landmarks: `<section>`, `<header>`, `<article>`, `<h3>`.
- Include `aria-label` on sections and navigation buttons.
- Use `aria-current="true"` on active timeline cards.
- Support both pointer events (`onMouseEnter`, `onClick`) and keyboard navigation (`onFocus`, `tabIndex={0}`, focus rings with `focus-visible:ring-2`).

---

## 3. Design System, Consistent Colors & Themes (`global.css`)

All color tokens, grid specifications, and keyframes are centralized in [`app/global.css`](file:///d:/nextjs%20projects/MyPortfolio/app/global.css) and mirrored in Tailwind v4 `@theme` tokens.

### 3.1 Color Palette
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Background** | `#04140D` | Deep forest dark surface for whole site |
| **Card Surface** | `#081a14` / `#061711` | Translucent glass container for timeline cards |
| **Card Active / Hover** | `#081c15` / `#0c241c` | Illuminated active card background |
| **Emerald Accent** | `#10B981` | Buttons, slider track, primary brand color |
| **Mint Accent** | `#34D399` | Company highlights, core indicator dots |
| **Border Subtle** | `#113327` / `#0d2a20` | Inactive timeline cards & base track line |
| **Border Active** | `rgba(16, 185, 129, 0.5)` | Active card border glow |

### 3.2 Background Grid Pattern
A cohesive 60px × 60px grid runs across the portfolio using 5% opacity white lines:
```css
.bg-portfolio-grid {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

### 3.3 Smooth Motion & Glow Keyframes
- **Float Animation** (`@keyframes float`): Subtle 3-second vertical translation for floating badges.
- **Slider Glow** (`@keyframes pulseGlow`): Dual-layer box shadow for the active timeline slider.
- **Cubic-Bezier Easing**: Use `cubic-bezier(0.22, 1, 0.36, 1)` with 500ms duration for silky smooth track sliding and card expansion.

---

## 4. Responsive Design Standards

### 4.1 Mobile-First Breakpoint Architecture
The layout gracefully adapts across standard device widths:
- **Mobile (`< 640px`)**:
  - Hero switches from side-by-side to stacked vertical alignment (`flex-col items-center text-center`).
  - Timeline slider track contracts to `w-8` while preserving alignment with card commit badges.
  - Card padding adapts to `p-5` with flex-wrapping metadata tags.
- **Tablet (`640px – 1024px`)**:
  - Hero aligns row-wise (`md:flex-row md:text-left`).
  - Timeline track expands to `w-10 sm:gap-6`.
  - Statistics grid scales to two columns with responsive font sizes (`text-3xl md:text-4xl`).
- **Desktop (`1024px – 1280px`)**:
  - Max container width adapts up to `max-w-7xl` with balanced padding (`lg:px-12`).
  - Fluid card padding (`lg:p-9`), comfortable card gap (`gap-8`), and prominent timeline track (`w-12`).
- **Large & Ultra-wide Desktop (`1280px – 1920px+`)**:
  - Container scales gracefully up to `2xl:max-w-[1600px] w-full mx-auto` to prevent content from appearing cramped or tiny on wide monitors.
  - Hero expands with generous spacing (`2xl:gap-28`, `2xl:p-24`), headline scales to `2xl:text-8xl`, profile image expands up to `2xl:w-[580px] 2xl:h-[580px]`, and buttons/stats scale proportionally.
  - Experience timeline cards scale with generous padding (`2xl:p-14`), clear typography (`2xl:text-5xl` for roles), and proportional tags without overflow.

### 4.2 Content Density Limit
To maintain the visual balance established in the design:
- Keep role descriptions concise (approximately 2–3 lines).
- Restrict skill tags to 4–6 key technologies per card.
- Format meta information like a Git commit log (`<hash>` on `<branch>` • `<date>`).

---

## 5. Quality Assurance & Verification Commands

Always run these three validation checks prior to committing or deploying changes:

### 5.1 TypeScript Compilation Check
Verifies complete type safety across all files without emitting build artifacts:
```bash
npx tsc --noEmit
```
*Expected result: Zero errors (`exit code 0`).*

### 5.2 ESLint Code Quality Check
Verifies compliance with Next.js and React Hooks linting rules:
```bash
npm run lint
```
*Expected result: Zero errors and zero warnings (`exit code 0`).*

### 5.3 Production Build Verification
Runs the Next.js Turbopack compiler, static generation, and bundle analysis:
```bash
npm run build
```
*Expected result: Successful compilation and static prerendering of all routes (`exit code 0`).*

