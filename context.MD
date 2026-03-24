# BlueChainLogic Site - Context & Skills Reference

## 1. UI/UX Pro Max Skill (Installed)

**Location:** `.claude/skills/ui-ux-pro-max/`

An AI-powered design intelligence system providing automated design system generation for professional UI/UX across multiple platforms and frameworks.

### Capabilities
- **161 Reasoning Rules** - Industry-specific design system generation
- **67 UI Styles** - Glassmorphism, Claymorphism, Minimalism, Brutalism, Neumorphism, Bento Grid, Dark Mode, AI-Native UI, etc.
- **161 Color Palettes** - Aligned with product categories
- **57 Font Pairings** - Curated typography with Google Fonts
- **25 Chart Types** - Dashboard and analytics recommendations
- **13 Tech Stacks** - React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, HTML+Tailwind, shadcn/ui, etc.
- **99 UX Guidelines** - Best practices and accessibility rules

### Supported Industries
| Area | Examples |
|------|----------|
| Tech & SaaS | SaaS, B2B Service, Developer Tools, AI Platforms, Cybersecurity |
| Finance | Fintech, Banking, Insurance, Invoice Tools |
| Healthcare | Medical Clinic, Pharmacy, Dental, Mental Health |
| E-commerce | General, Luxury, Marketplace, Subscription, Food Delivery |
| Services | Beauty/Spa, Restaurant, Hotel, Legal, Booking |
| Creative | Portfolio, Agency, Photography, Gaming, Music |
| Lifestyle | Habit Tracker, Recipe, Meditation, Diary |
| Emerging Tech | Web3/NFT, Spatial Computing, Quantum, Autonomous Systems |

### Usage
The skill auto-activates when UI/UX work is requested. Just describe what you want:
- "Build a landing page for a SaaS product"
- "Design a dashboard for fintech analytics"

### Advanced CLI Commands
```bash
# Generate design system
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa" --design-system

# Domain-specific searches
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "glassmorphism" --domain style

# Persist design system
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --design-system --persist -p "MyApp"
```

### Design System Output Structure
```
design-system/
├── MASTER.md              # Global source of truth
└── pages/
    └── dashboard.md       # Page-specific overrides
```

### Source
- GitHub: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- CLI: `npm install -g uipro-cli`
- Reinstall/Update: `npm install -g uipro-cli && uipro init --ai claude`

---

## 2. Google Stitch MCP (Configured)

**Status:** Active MCP Server
**Transport:** HTTP
**Endpoint:** `https://stitch.googleapis.com/mcp`
**API Key:** Configured via `X-Goog-Api-Key` header

### What is Stitch?
Google Stitch is an AI-powered design tool that generates UI designs and frontend code from text prompts. Through MCP integration, it connects directly to Claude Code as a tool.

### Capabilities
- Generate complete UI designs from text descriptions
- Export production-ready frontend code
- Create responsive layouts, components, and pages
- AI-powered design-to-code pipeline

### Setup Details
Added via:
```bash
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp --header "X-Goog-Api-Key: AQ.Ab8RN6IB-c13cGajPDwgC1WCDCF3JGmkjXaOc7YzbnRRILD7SA"
```

### Configuration Location
Stored in: `C:\Users\Vanshh\.claude.json` (project-scoped for `D:\bluechainlogic-site\bluechainlogic-site`)

### Documentation
- Setup Guide: https://stitch.withgoogle.com/docs/mcp/setup
- MCP Guide: https://stitch.withgoogle.com/docs/mcp/guide/

---

## 3. Asset Library - Interactive/Animated UI Resources

A curated collection of libraries and resources for creating interactive, animated, attention-grabbing UI components.

### Primary Animation Libraries

#### Motion (formerly Framer Motion)
- **Best for:** React/Next.js declarative animations
- **Install:** `npm install motion`
- **Features:** 120fps GPU-accelerated animations, springs, gestures, layout transitions, scroll animations, timelines
- **Stars:** 30.7k+ | **Downloads:** 3.6M+/week
- **Site:** https://motion.dev/

#### GSAP (GreenSock Animation Platform)
- **Best for:** Complex sequenced animations, scroll effects, SVG morphing
- **Install:** `npm install gsap`
- **Features:** ScrollTrigger, MorphSVG, TextPlugin, DrawSVG, SplitText, Flip
- **Stars:** 23k+ | **Downloads:** 750k+/week
- **License:** Now free for all (thanks to Webflow)
- **Site:** https gsap.com

#### Lottie
- **Best for:** Vector animations from After Effects / design tools
- **Install:** `npm install lottie-react`
- **Features:** Lightweight JSON animations, scalable across devices, onboarding flows, empty states, illustrative UI
- **Downloads:** 800k+/week
- **Free animations:** https://lottiefiles.com/free-animations

### Copy-Paste Animated Component Libraries

#### Aceternity UI
- **Best for:** Animated landing pages, hero sections, interactive cards
- **Components:** 200+ free components
- **Stack:** React, Next.js, Tailwind CSS, Framer Motion
- **Features:** Spotlight effects, parallax scrolling, 3D cards, text animations, background effects
- **Site:** https://ui.aceternity.com/
- **Components:** https://ui.aceternity.com/components

#### Magic UI
- **Best for:** Animated backgrounds, text effects, interactive cards, smooth transitions
- **Components:** 50+ animated components
- **Stack:** TypeScript, Next.js, Tailwind CSS, Framer Motion (built on shadcn/ui)
- **Stars:** 19k+
- **License:** MIT
- **Site:** https://magicui.design/

#### nextjs-animated-components
- **Best for:** Comprehensive animated component collection
- **Components:** 110+ free animated React components
- **Stack:** Framer Motion, GSAP, Three.js, Tailwind CSS
- **Features:** Dock, Spotlight Cards, Glassmorphism, Scroll Animations, 3D Effects
- **GitHub:** https://github.com/itsjwill/nextjs-animated-components

### Animation Patterns Reference

| Effect | Library | Use Case |
|--------|---------|----------|
| Page transitions | Motion | Route changes, modal opens |
| Scroll reveals | GSAP ScrollTrigger | Section entrance animations |
| Hover effects | Motion / CSS | Cards, buttons, links |
| Loading states | Lottie | Skeleton screens, spinners |
| Text animations | GSAP SplitText | Hero headlines, counters |
| 3D transforms | Three.js / CSS | Product showcases, backgrounds |
| Parallax | GSAP / Motion | Hero sections, backgrounds |
| Micro-interactions | Motion | Toggles, likes, notifications |
| SVG morphing | GSAP MorphSVG | Icon transitions, illustrations |
| Spotlight/Glow | Aceternity UI | Cards, CTAs, featured content |
| Bento grids | Magic UI | Dashboards, feature showcases |
| Glassmorphism | CSS + backdrop-filter | Cards, modals, overlays |

### Quick Start - Adding Animations to This Project

```bash
# Install core animation libraries
npm install motion gsap lottie-react

# For Three.js 3D effects (optional)
npm install three @react-three/fiber @react-three/drei
```

### Best Practices
1. **Performance first** - Use `will-change`, GPU-accelerated properties (`transform`, `opacity`)
2. **Reduce motion** - Always respect `prefers-reduced-motion` media query
3. **Progressive enhancement** - Core functionality works without animations
4. **Lazy load** - Only load animation libraries when needed (dynamic imports)
5. **60fps target** - Keep animations smooth, avoid layout thrashing
6. **Meaningful motion** - Every animation should serve a UX purpose

---

## 4. Project Tech Stack Reference

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Deployment:** (check project config)
- **Key Pages:** Onboarding portal (`app/onboard/[token]/`)

---

## 5. Quick Reference Commands

```bash
# Regenerate UI/UX Pro Max skill files
npm install -g uipro-cli && uipro init --ai claude

# Generate design system for a product type
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product-type>" --design-system

# Stitch MCP is auto-available as a tool in Claude Code
# Just ask: "Use Stitch to generate a UI for..."

# Install animation libraries
npm install motion gsap lottie-react
```
