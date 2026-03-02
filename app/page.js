"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ── Scroll-triggered visibility hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Reusable fade-in wrapper ── */
function FadeIn({ children, delay = 0, className = "", direction = "up" }) {
  const [ref, visible] = useInView();
  const transforms = {
    up: "translateY(40px)",
    down: "translateY(-40px)",
    left: "translateX(60px)",
    right: "translateX(-60px)",
    none: "none",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0)" : transforms[direction],
        transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Scale-in wrapper for pipeline nodes ── */
function ScaleIn({ children, delay = 0 }) {
  const [ref, visible] = useInView(0.2);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.85)",
        transition: `opacity 0.6s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.6s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO CONSTELLATION CANVAS — Interactive research network
   ═══════════════════════════════════════════════════════════ */
function HeroConstellation() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const nodesRef = useRef([]);
  const frameRef = useRef(null);
  const scrollRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const initNodes = useCallback((w, h) => {
    const count = Math.floor((w * h) / 22000);
    const nodes = [];
    for (let i = 0; i < Math.min(count, 50); i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.5 + 0.6,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.006 + Math.random() * 0.01,
        opacity: 0.1 + Math.random() * 0.25,
      });
    }
    return nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      sizeRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodesRef.current = initNodes(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);

    const draw = () => {
      const { w, h } = sizeRef.current;
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const scroll = scrollRef.current;
      ctx.clearRect(0, 0, w, h);

      const CONNECT_DIST = 120;
      const MOUSE_DIST = 150;

      for (const n of nodes) {
        n.pulse += n.pulseSpeed;
        n.x += n.vx;
        n.y += n.vy;

        const parallaxY = scroll * 0.08 * (n.r / 3);
        n._drawY = n.y - parallaxY;

        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));

        const dx = n.x - mouse.x;
        const dy = n._drawY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST && dist > 0) {
          const force = (1 - dist / MOUSE_DIST) * 0.4;
          n.x += (dx / dist) * force;
          n.y += (dy / dist) * force * 0.3;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a._drawY - b._drawY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.1;
            const midX = (a.x + b.x) / 2, midY = (a._drawY + b._drawY) / 2;
            const mDist = Math.sqrt((midX - mouse.x) ** 2 + (midY - mouse.y) ** 2);
            const mouseBoost = mDist < MOUSE_DIST ? (1 - mDist / MOUSE_DIST) * 0.2 : 0;
            ctx.beginPath();
            ctx.moveTo(a.x, a._drawY);
            ctx.lineTo(b.x, b._drawY);
            ctx.strokeStyle = `rgba(200,150,62,${alpha + mouseBoost})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const pulseAlpha = 0.3 + Math.sin(n.pulse) * 0.15;
        const baseBright = n.opacity * pulseAlpha;
        const dx = n.x - mouse.x, dy = n._drawY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseGlow = dist < MOUSE_DIST ? (1 - dist / MOUSE_DIST) : 0;
        const finalAlpha = Math.min(1, baseBright + mouseGlow * 0.4);

        if (mouseGlow > 0.3) {
          ctx.beginPath();
          ctx.arc(n.x, n._drawY, n.r * 5, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(n.x, n._drawY, 0, n.x, n._drawY, n.r * 5);
          grad.addColorStop(0, `rgba(200,150,62,${mouseGlow * 0.12})`);
          grad.addColorStop(1, "rgba(200,150,62,0)");
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n._drawY, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,150,62,${finalAlpha})`;
        ctx.fill();
      }

      if (mouse.x > 0 && mouse.y > 0) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        grad.addColorStop(0, "rgba(200,150,62,0.05)");
        grad.addColorStop(0.4, "rgba(200,150,62,0.02)");
        grad.addColorStop(1, "rgba(200,150,62,0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [initNodes]);

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
  );
}


/* ── Data ── */
const PIPELINE_STEPS = [
  { num: "01", title: "Discovery & Fit Call", desc: "We start with a focused conversation to understand your business \u2014 where time and effort are being wasted, and whether deep-research outbound is the right lever for you right now. No hard sell. If we\u2019re not the right fit, we\u2019ll tell you." },
  { num: "02", title: "Alignment & Engagement", desc: "Once we agree to move forward, we align on scope, stakeholders, access, and expectations. Clear ownership, clear timelines, and a single point of contact on both sides. No confusion later." },
  { num: "03", title: "Custom Research Build", desc: "We step inside your business to understand your ICP, your market, and your buyers. This phase creates the research infrastructure \u2014 what signals to track, what data to collect, and what separates a high-intent prospect from noise." },
  { num: "04", title: "Outreach Strategy & Plan", desc: "Before anything goes live, we translate research findings into a clear outreach plan. You\u2019ll know exactly what messaging is going out, to whom, in what order, and how success will be measured." },
  { num: "05", title: "Launch & Execution", desc: "We deploy the research-driven outreach into live channels. Every touchpoint is built on actual prospect intelligence \u2014 integrations, logic, sequencing \u2014 all handled end-to-end without disrupting your day-to-day." },
  { num: "06", title: "Testing & Go-Live", desc: "We test with real scenarios, edge cases, and deliverability checks. Only once reply quality and lead relevance meet the bar do we ramp to full volume." },
  { num: "07", title: "Handover & Enablement", desc: "You receive full documentation on every campaign \u2014 targeting logic, messaging rationale, and performance benchmarks \u2014 so your team has complete visibility into what\u2019s working and why." },
  { num: "08", title: "Ongoing Optimization", desc: "For clients who continue with us, we actively manage and improve campaigns over time \u2014 performance reviews, message iteration, signal refinement \u2014 so results keep compounding as your market evolves." },
];

/*
 * ═══════════════════════════════════════════════════════
 * LOGO CONFIGURATION
 * ═══════════════════════════════════════════════════════
 * Uses Google's Favicon API — free, no auth, works for
 * literally any domain on earth. Backed by Google CDN.
 * Format: google.com/s2/favicons?domain=X&sz=128
 * ═══════════════════════════════════════════════════════
 */
const logoUrl = (domain) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const TECH_ROW_1 = [
  { name: "Python", logo: logoUrl("python.org"), color: "#3776AB" },
  { name: "Node.js", logo: logoUrl("nodejs.org"), color: "#5FA04E" },
  { name: "TypeScript", logo: logoUrl("typescriptlang.org"), color: "#3178C6" },
  { name: "PostgreSQL", logo: logoUrl("postgresql.org"), color: "#4169E1" },
  { name: "Docker", logo: logoUrl("docker.com"), color: "#2496ED" },
  { name: "AWS", logo: logoUrl("aws.amazon.com"), color: "#FF9900" },
  { name: "OpenAI", logo: logoUrl("openai.com"), color: "#10A37F" },
  { name: "Anthropic", logo: logoUrl("anthropic.com"), color: "#D4A574" },
  { name: "Perplexity", logo: logoUrl("perplexity.ai"), color: "#1FB8CD" },
  { name: "Google Gemini", logo: logoUrl("gemini.google.com"), color: "#8E75B2" },
  { name: "Mistral AI", logo: logoUrl("mistral.ai"), color: "#FF7000" },
  { name: "LangChain", logo: logoUrl("langchain.com"), color: "#2EA44F" },
  { name: "Selenium", logo: logoUrl("selenium.dev"), color: "#43B02A" },
  { name: "Puppeteer", logo: logoUrl("pptr.dev"), color: "#40B5A4" },
];

const TECH_ROW_2 = [
  { name: "HubSpot", logo: logoUrl("hubspot.com"), color: "#FF7A59" },
  { name: "Salesforce", logo: logoUrl("salesforce.com"), color: "#00A1E0" },
  { name: "Pipedrive", logo: logoUrl("pipedrive.com"), color: "#21C47F" },
  { name: "Zoho CRM", logo: logoUrl("zoho.com"), color: "#E42527" },
  { name: "Monday.com", logo: logoUrl("monday.com"), color: "#FF3D57" },
  { name: "Notion", logo: logoUrl("notion.so"), color: "#FFFFFF" },
  { name: "Apollo.io", logo: logoUrl("apollo.io"), color: "#6B47DC" },
  { name: "Instantly", logo: logoUrl("instantly.ai"), color: "#5B5FC7" },
  { name: "Smartlead", logo: logoUrl("smartlead.ai"), color: "#4CAF50" },
  { name: "n8n", logo: logoUrl("n8n.io"), color: "#EA4B71" },
  { name: "Make", logo: logoUrl("make.com"), color: "#6D00CC" },
  { name: "Zapier", logo: logoUrl("zapier.com"), color: "#FF4A00" },
  { name: "GitHub", logo: logoUrl("github.com"), color: "#FFFFFF" },
];

const FAQ_DATA = [
  { q: "What does Bluechainlogic actually do?", a: "We run deep-research outbound on your behalf. That means we build custom research infrastructure to study your prospects before we ever reach out to them, then craft situation-specific outreach that starts real sales conversations. You get qualified leads in your calendar \u2014 not a list of contacts to chase yourself." },
  { q: "How is this different from other lead gen agencies?", a: "Most agencies blast thousands of templated messages and call it \u2018personalization\u2019 because they mention your prospect\u2019s job title. We research every prospect individually \u2014 their business model, their pain points, what signals suggest they\u2019re ready to buy \u2014 and write outreach that reflects genuine understanding. The result: higher reply rates, better conversations, and leads that actually close." },
  { q: "What kind of reply rates can I expect?", a: "It depends on your market, but our clients typically see reply rates 3\u20135\u00D7 higher than industry average because every message is backed by real research. More importantly, the quality of replies is different. We\u2019re not optimizing for \u2018any reply\u2019 \u2014 we\u2019re optimizing for conversations that turn into revenue." },
  { q: "How long does it take to see results?", a: "Most clients see their first qualified conversations within the first two weeks of launch. The research and infrastructure build takes about 5\u20137 days, and outreach starts generating replies almost immediately after that." },
  { q: "What\u2019s the 36 leads guarantee?", a: "We guarantee 36 ICP-matched prospects who have responded positively and expressed genuine interest within 90 days. If we don\u2019t deliver, you don\u2019t pay. Not a reduced rate. Not a credit. Free. We only offer this because our process consistently delivers." },
  { q: "Do you work with companies in my industry?", a: "We work with B2B companies across a range of industries \u2014 SaaS, professional services, agencies, fintech, manufacturing, and more. The common thread is that our clients sell high-value solutions where the quality of the conversation matters more than the volume of outreach." },
  { q: "Can you integrate with my CRM?", a: "Yes. We integrate directly with your existing CRM and sales tools so qualified leads flow seamlessly into your pipeline. Whether you\u2019re on HubSpot, Salesforce, Pipedrive, or something else \u2014 we make sure nothing gets lost between our research and your team\u2019s follow-up." },
  { q: "Do I need to be involved in the outreach process?", a: "Minimal involvement from your side. We handle the research, the copywriting, the infrastructure, and the execution. You\u2019ll approve messaging and targeting strategy upfront, then your main job is showing up to the meetings we book." },
  { q: "Is my data safe with you?", a: "Absolutely. We take data security seriously. All client data is handled with strict confidentiality agreements, stored in encrypted environments, and never shared with third parties. Your prospect intelligence is yours alone." },
  { q: "How do I know if I\u2019m a good fit?", a: "The best way is a quick 15-minute call. Generally, we work best with B2B companies that have a proven offer, an average deal size above \u20AC5K, and are ready to scale their outbound beyond what their internal team can handle. If that sounds like you, let\u2019s talk." },
];


/* ── FAQ Accordion Item ── */
function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => { if (contentRef.current) setHeight(contentRef.current.scrollHeight); }, [open]);

  return (
    <div className="bl-faq-item" onClick={() => setOpen(!open)} style={{
      background: open ? "rgba(200,150,62,0.04)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${open ? "rgba(200,150,62,0.18)" : "rgba(255,255,255,0.05)"}`,
      borderRadius: 14, cursor: "pointer", transition: "all 0.35s ease", overflow: "hidden", marginBottom: 10,
    }}>
      <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', serif", fontSize: 14, fontWeight: 700, color: open ? "#C8963E" : "rgba(200,150,62,0.4)", minWidth: 28, transition: "color 0.3s ease" }}>{String(index + 1).padStart(2, "0")}</span>
          <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 16, fontWeight: 600, color: open ? "#E8E4DE" : "rgba(232,228,222,0.7)", transition: "color 0.3s ease" }}>{q}</span>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: open ? "rgba(200,150,62,0.15)" : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease", flexShrink: 0 }}>
          <span style={{ color: open ? "#C8963E" : "rgba(232,228,222,0.4)", fontSize: 18, fontWeight: 300, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s ease, color 0.3s ease", display: "inline-block" }}>+</span>
        </div>
      </div>
      <div ref={contentRef} style={{ maxHeight: open ? height : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(.16,1,.3,1)" }}>
        <div className="bl-faq-answer" style={{ padding: "0 28px 24px 60px" }}>
          <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, lineHeight: 1.8, color: "rgba(232,228,222,0.5)", margin: 0 }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Tech Carousel Item ── */
function TechItem({ name, color, logo }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 110, padding: "22px 18px",
      background: hovered ? `${color}12` : "rgba(255,255,255,0.02)",
      border: `1px solid ${hovered ? `${color}40` : "rgba(255,255,255,0.04)"}`,
      borderRadius: 16, cursor: "default", transition: "all 0.4s cubic-bezier(.16,1,.3,1)",
      transform: hovered ? "translateY(-8px) scale(1.06)" : "translateY(0) scale(1)",
      boxShadow: hovered ? `0 12px 40px ${color}18, 0 0 20px ${color}08` : "none",
      flexShrink: 0,
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: 14,
        background: hovered ? `${color}15` : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? `${color}40` : "rgba(255,255,255,0.06)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.4s cubic-bezier(.16,1,.3,1)",
        boxShadow: hovered ? `inset 0 0 20px ${color}10` : "none",
        overflow: "hidden",
      }}>
        {!imgError ? (
          <img src={logo} alt={name} loading="lazy" onError={() => setImgError(true)} style={{
            width: 30, height: 30, objectFit: "contain", borderRadius: 4,
            opacity: hovered ? 1 : 0.5, transition: "opacity 0.4s ease",
          }}/>
        ) : (
          <span style={{ fontSize: 13, fontWeight: 800, color: hovered ? color : "rgba(232,228,222,0.4)", fontFamily: "'Instrument Sans', sans-serif", transition: "color 0.4s ease" }}>{name.slice(0,2)}</span>
        )}
      </div>
      <span style={{
        fontFamily: "'Instrument Sans', sans-serif", fontSize: 11, fontWeight: 600,
        color: hovered ? color : "rgba(232,228,222,0.3)",
        letterSpacing: "0.04em", whiteSpace: "nowrap", transition: "color 0.4s ease"
      }}>{name}</span>
    </div>
  );
}

/* ── Gradient heading helpers ── */
const gH = { background: "linear-gradient(135deg, #E8E4DE 0%, #C8963E 50%, #E8E4DE 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };
const gHS = { background: "linear-gradient(135deg, #E8E4DE 20%, rgba(200,150,62,0.7) 80%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };


/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function BluechainlogicLanding() {
  const [scrollY, setScrollY] = useState(0);
  const calendlyRef = useRef(null);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* ── Load Calendly widget.js (required for transparent bg + hide cookie banner) ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.querySelector('script[src*="calendly.com/assets/external/widget"]');
    if (existing) { initCalendly(); return; }
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onload = initCalendly;
    document.head.appendChild(s);
    /* Also add Calendly's embed CSS */
    const link = document.createElement("link");
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    function initCalendly() {
      if (!calendlyRef.current || !window.Calendly) return;
      window.Calendly.initInlineWidget({
        url: "https://calendly.com/noah-bluechainlogic/30min?hide_gdpr_banner=1&hide_event_type_details=1&background_color=0a0e17&text_color=e8e4de&primary_color=c8963e",
        parentElement: calendlyRef.current,
        resize: true
      });
    }
  }, []);

  return (
    <div style={{ background: "#0A0E17", color: "#E8E4DE", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(200,150,62,0.3);color:#fff}
        body{background:#0A0E17}

        @keyframes pulse-glow{0%,100%{opacity:0.4}50%{opacity:0.8}}
        @keyframes scroll-left{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes scroll-right{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
        @keyframes tech-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .tech-track:hover{animation-play-state:paused!important}

        @keyframes gradient-shift{0%{background-position:0% center}50%{background-position:100% center}100%{background-position:0% center}}

        .hero-heading-animated{
          background:linear-gradient(90deg,#E8E4DE 0%,#C8963E 25%,#E8E4DE 50%,#C8963E 75%,#E8E4DE 100%);
          background-size:300% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:gradient-shift 8s ease infinite;
        }

        .hero-cta{position:relative;overflow:hidden}
        .hero-cta::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)}
        .hero-cta:hover::before{animation:cta-shimmer 0.6s ease forwards}
        @keyframes cta-shimmer{0%{left:-100%}100%{left:200%}}

        .nav-link{position:relative}
        .nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1px;background:#C8963E;transition:width 0.3s ease}
        .nav-link:hover{color:rgba(232,228,222,0.8)!important}
        .nav-link:hover::after{width:100%}

        @keyframes scroll-bounce{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(8px);opacity:0.4}}

        .calendly-inline-widget{min-width:320px;height:700px;border-radius:12px;overflow:hidden}
        .calendly-inline-widget iframe{border:none!important;border-radius:12px}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#0A0E17}
        ::-webkit-scrollbar-thumb{background:rgba(200,150,62,0.3);border-radius:3px}

        /* ── Mobile Responsive ── */
        @media(max-width:768px){
          .bl-nav{padding:0 16px!important}
          .bl-nav-inner{height:56px!important}
          .bl-nav-links{display:none!important}
          .bl-nav-cta{padding:8px 16px!important;font-size:12px!important}

          .bl-hero{padding:100px 20px 0!important}
          .bl-section{padding-left:20px!important;padding-right:20px!important}
          .bl-section-y{padding-top:60px!important;padding-bottom:60px!important}

          .bl-grid-3{grid-template-columns:1fr!important;gap:12px!important}
          .bl-grid-2{grid-template-columns:1fr!important;gap:16px!important}

          .bl-stats{gap:24px!important}
          .bl-stats>div{min-width:auto!important}

          .bl-cta-row{flex-direction:column!important;width:100%}
          .bl-cta-row>a,.bl-cta-row>button{width:100%!important;text-align:center!important;justify-content:center!important}

          .bl-hero-sub{max-width:100%!important}

          .bl-comparison-header{font-size:13px!important;padding:14px 16px!important}
          .bl-comparison-cell{padding:14px 16px!important;font-size:13px!important}

          .bl-case-grid{grid-template-columns:1fr!important}

          .bl-pipeline-step{padding-left:0!important;padding-right:0!important;justify-content:center!important}
          .bl-pipeline-line{display:none!important}
          .bl-pipeline-num{position:relative!important;left:auto!important;top:auto!important;transform:none!important;margin:0 auto 12px!important}
          .bl-pipeline-connector{display:none!important}

          .bl-guarantee{padding:36px 24px!important}

          .bl-calendly-outer{padding:60px 20px 80px!important}
          .calendly-inline-widget{height:680px!important;border-radius:8px!important}

          .bl-faq-item>div:first-child{padding:16px 20px!important}
          .bl-faq-answer{padding:0 20px 20px 44px!important}

          .bl-footer{padding:32px 20px!important;flex-direction:column!important;gap:20px!important;text-align:center!important}
          .bl-footer-links{justify-content:center!important}

          .bl-tech-label{padding:0 20px!important}

          .bl-marquee-text{font-size:13px!important;gap:32px!important}

          .bl-video-section{padding:60px 20px!important}
          .bl-video-grid{grid-template-columns:1fr!important}
        }

        @media(max-width:480px){
          .bl-hero{padding:90px 16px 0!important}
          .bl-section{padding-left:16px!important;padding-right:16px!important}
          .bl-guarantee{padding:28px 20px!important}
          .bl-calendly-outer{padding:40px 16px 60px!important}
        }

        .grain-overlay{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.022;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat:repeat;background-size:180px}
      `}</style>

      <div className="grain-overlay"/>

      {/* ═══ NAV ═══ */}
      <nav className="bl-nav" style={{ position:"fixed",top:0,left:0,right:0,zIndex:100, background:scrollY>50?"rgba(10,14,23,0.92)":"transparent", backdropFilter:scrollY>50?"blur(20px)":"none", borderBottom:scrollY>50?"1px solid rgba(255,255,255,0.05)":"1px solid transparent", transition:"all 0.4s ease",padding:"0 40px" }}>
        <div className="bl-nav-inner" style={{ maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:72 }}>
          <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.25em",color:"#C8963E" }}>BLUECHAINLOGIC</div>
          <div className="bl-nav-links" style={{ display:"flex",gap:24,alignItems:"center" }}>
            {[{label:"Why it works",href:"#why-it-works"},{label:"Our approach",href:"#pipeline"},{label:"FAQ",href:"#faq"}].map(link=>(
              <a key={link.label} href={link.href} className="nav-link" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:500,color:"rgba(232,228,222,0.5)",textDecoration:"none",transition:"color 0.3s ease" }}>{link.label}</a>
            ))}
            <a href="#book" className="bl-nav-cta" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:600,color:"#0A0E17",background:"#C8963E",padding:"10px 24px",borderRadius:6,textDecoration:"none",transition:"all 0.3s ease",letterSpacing:"0.03em" }}>Book a call</a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column" }}>
        <section className="bl-hero" style={{ position:"relative",display:"flex",alignItems:"center",padding:"120px 40px 0",overflow:"hidden",flex:1 }}>
          <HeroConstellation/>
          <div style={{ position:"absolute",top:"-20%",right:"-10%",width:700,height:700,background:"radial-gradient(circle,rgba(200,150,62,0.07) 0%,transparent 70%)",borderRadius:"50%",filter:"blur(80px)",pointerEvents:"none",animation:"pulse-glow 8s ease-in-out infinite" }}/>
          <div style={{ position:"absolute",bottom:"-10%",left:"-5%",width:500,height:500,background:"radial-gradient(circle,rgba(95,168,211,0.04) 0%,transparent 70%)",borderRadius:"50%",filter:"blur(60px)",pointerEvents:"none" }}/>
          <div style={{ position:"absolute",bottom:0,left:0,right:0,height:200,background:"linear-gradient(to top,#0A0E17,transparent)",pointerEvents:"none",zIndex:1 }}/>

          <div style={{ maxWidth:1200,margin:"0 auto",width:"100%",position:"relative",zIndex:2 }}>
            <FadeIn delay={0.1}>
              <h1 className="hero-heading-animated" style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(40px, 6vw, 76px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-0.03em",maxWidth:800,marginBottom:28 }}>
                We research.
              </h1>
            </FadeIn>
            <FadeIn delay={0.18}>
              <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(40px, 6vw, 76px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-0.03em",color:"#C8963E",maxWidth:800,marginBottom:28,textShadow:"0 0 60px rgba(200,150,62,0.3), 0 0 120px rgba(200,150,62,0.1)" }}>
                They reply.
              </h1>
            </FadeIn>

            <FadeIn delay={0.28}>
              <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:"clamp(17px, 2vw, 20px)",lineHeight:1.7,color:"rgba(232,228,222,0.55)",maxWidth:580,marginBottom:48 }}>
                Deep-research outbound that turns strangers into sales conversations. We study every prospect before we ever reach out. So your outreach feels like a warm intro, not a cold pitch.
              </p>
            </FadeIn>

            <FadeIn delay={0.38}>
              <div className="bl-cta-row" style={{ display:"flex",gap:16,flexWrap:"wrap",alignItems:"center" }}>
                <a href="#book" className="hero-cta" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"#0A0E17",background:"linear-gradient(135deg,#C8963E,#E0B860)",padding:"16px 36px",borderRadius:8,textDecoration:"none",transition:"all 0.3s ease",letterSpacing:"0.02em",boxShadow:"0 4px 24px rgba(200,150,62,0.25), 0 0 0 1px rgba(200,150,62,0.3)" }}>
                  See how this works for me &rarr;
                </a>
                <a href="#why-it-works" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:500,color:"rgba(232,228,222,0.6)",padding:"16px 24px",textDecoration:"none",transition:"all 0.3s ease" }}>Why it works</a>
              </div>
            </FadeIn>

            <FadeIn delay={0.55}>
              <div className="bl-stats" style={{ marginTop:48,display:"flex",gap:48,flexWrap:"wrap",borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:32 }}>
                {[{value:"5 days",label:"From launch to first meetings"},{value:"36+",label:"Qualified leads guaranteed per quarter"}].map((s,i)=>(
                  <div key={i} style={{ minWidth:120 }}>
                    <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:28,fontWeight:800,letterSpacing:"-0.02em",...gH }}>{s.value}</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.5)",marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.8}>
              <div style={{ marginTop:48,display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8 }}>
                <div style={{ width:1,height:32,background:"linear-gradient(to bottom,rgba(200,150,62,0.5),transparent)",animation:"scroll-bounce 2s ease infinite" }}/>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Client carousel */}
        <section style={{ padding:"0 0 32px",overflow:"hidden",background:"transparent",position:"relative",zIndex:2 }}>
          <div style={{ maxWidth:800,margin:"0 auto",textAlign:"center",marginBottom:16 }}>
            <span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:"rgba(232,228,222,0.2)" }}>TRUSTED BY</span>
          </div>
          <div style={{ position:"relative",width:"100%",overflow:"hidden",maskImage:"linear-gradient(to right,transparent,black 15%,black 85%,transparent)",WebkitMaskImage:"linear-gradient(to right,transparent,black 15%,black 85%,transparent)" }}>
            <div style={{ display:"flex",gap:64,alignItems:"center",width:"max-content",animation:"scroll-left 60s linear infinite" }}>
              {[...Array(4)].flatMap((_,si)=>["e-tailize","Quasarai","Leadember","Mooirivier","Metriq Agency","Folkal","Matter Design","Founders Connects","Ecarstrade"].map((name,i)=>(
                <span key={`${si}-${i}`} style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"rgba(232,228,222,0.2)",whiteSpace:"nowrap",letterSpacing:"0.03em",flexShrink:0 }}>{name}</span>
              )))}
            </div>
          </div>
        </section>
      </div>

      {/* ═══ VIDEO ═══ */}
      <section className="bl-section bl-section-y" style={{ padding:"40px 40px 120px" }}>
        <div style={{ maxWidth:800,margin:"0 auto" }}>
          <FadeIn>
            <div style={{ position:"relative",width:"100%",paddingBottom:"56.25%",borderRadius:16,overflow:"hidden",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",cursor:"pointer" }}>
              <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,rgba(13,27,42,0.95),rgba(10,14,23,0.98))" }}>
                <div style={{ width:72,height:72,borderRadius:"50%",background:"rgba(200,150,62,0.15)",border:"2px solid rgba(200,150,62,0.4)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
                  <div style={{ width:0,height:0,borderTop:"12px solid transparent",borderBottom:"12px solid transparent",borderLeft:"20px solid #C8963E",marginLeft:4 }}/>
                </div>
                <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"#E8E4DE",marginBottom:6 }}>See how deep research actually works</div>
                <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.35)" }}>90 seconds</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="bl-section bl-section-y" style={{ padding:"120px 40px",position:"relative" }}>
        <div style={{ position:"absolute",inset:0,background:"linear-gradient(180deg,transparent,rgba(200,150,62,0.02),transparent)",pointerEvents:"none" }}/>
        <div style={{ maxWidth:800,margin:"0 auto",textAlign:"center",position:"relative" }}>
          <FadeIn><div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20 }}>THE PROBLEM</div></FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px, 4vw, 44px)",fontWeight:800,lineHeight:1.15,marginBottom:32,letterSpacing:"-0.02em",...gHS }}>
              Generic outbound is dead.<br/>Deep research is what converts.
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.8,color:"rgba(232,228,222,0.5)",marginBottom:20 }}>Most agencies blast thousands of identical messages across email and LinkedIn and hope something sticks. Reply rates are tanking. Spam filters are smarter. Decision-makers ignore anything that feels templated.</p></FadeIn>
          <FadeIn delay={0.22}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.8,color:"rgba(232,228,222,0.5)",marginBottom:20 }}>The &ldquo;best&rdquo; they offer? A personalized first line. They mention your city, your job title, maybe your latest LinkedIn post. Then the rest of the email is the same copy everyone else gets. That&rsquo;s not personalization. That&rsquo;s decoration.</p></FadeIn>
          <FadeIn delay={0.28}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.8,color:"rgba(232,228,222,0.5)" }}>The companies that win are the ones whose outreach feels like it was written by someone who actually understands the prospect&rsquo;s business. Because it was.</p></FadeIn>
        </div>
      </section>

      {/* ═══ THREE PILLARS ═══ */}
      <section id="why-it-works" className="bl-section bl-section-y" style={{ padding:"120px 40px",position:"relative" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <FadeIn><div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20,textAlign:"center" }}>WHY IT WORKS</div></FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px, 4vw, 44px)",fontWeight:800,lineHeight:1.15,marginBottom:16,textAlign:"center",letterSpacing:"-0.02em",...gHS }}>Three layers. One system.</h2>
          </FadeIn>
          <FadeIn delay={0.15}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:600,margin:"0 auto 64px" }}>Most agencies are good at one thing. We built Bluechainlogic at the intersection of three.</p></FadeIn>

          <div className="bl-grid-3" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20 }}>
            {[
              { num:"01",title:"Engineering",subtitle:"We build the machine.",desc:"Custom code and enrichment engines built from scratch for every client. We write the scripts that crawl, validate, and score your prospects across dozens of data points. And we know how to run high-volume outreach that actually lands in the inbox. Domain health, deliverability, sender reputation.",accent:"rgba(95,168,211,0.5)",accentBg:"rgba(95,168,211,0.04)",accentBorder:"rgba(95,168,211,0.12)" },
              { num:"02",title:"Copywriting",subtitle:"We write what converts.",desc:"Technical data means nothing if the message doesn\u2019t land. We turn deep research into outreach that reads like it was written by a human who genuinely understands the prospect\u2019s business. Because it was. Every word is crafted to start a conversation, not trigger a spam filter.",accent:"#C8963E",accentBg:"rgba(200,150,62,0.04)",accentBorder:"rgba(200,150,62,0.12)" },
              { num:"03",title:"B2B Sales",subtitle:"We know what closes.",desc:"Years of B2B sales experience means we know which signals actually predict buying intent and which ones are noise. We know what data points matter, when to reach out, and how to frame your offer so it lands with the right person at the right moment.",accent:"rgba(139,200,130,0.7)",accentBg:"rgba(139,200,130,0.04)",accentBorder:"rgba(139,200,130,0.12)" },
            ].map((pillar,i)=>{
              const [hovered,setHovered]=useState(false);
              return (
                <FadeIn key={i} delay={i*0.12}>
                  <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{ background:hovered?pillar.accentBg:"rgba(255,255,255,0.015)",border:`1px solid ${hovered?pillar.accentBorder:"rgba(255,255,255,0.04)"}`,borderRadius:16,padding:"44px 32px",height:"100%",display:"flex",flexDirection:"column",transition:"all 0.4s ease" }}>
                    <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:56,fontWeight:800,color:hovered?pillar.accent:"rgba(255,255,255,0.04)",lineHeight:1,letterSpacing:"-0.04em",marginBottom:24,transition:"color 0.4s ease" }}>{pillar.num}</div>
                    <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:24,fontWeight:700,color:"#E8E4DE",marginBottom:6 }}>{pillar.title}</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:pillar.accent,marginBottom:20,letterSpacing:"0.01em" }}>{pillar.subtitle}</div>
                    <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14.5,lineHeight:1.75,color:"rgba(232,228,222,0.4)",flex:1 }}>{pillar.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.4}>
            <div style={{ marginTop:48,textAlign:"center",padding:"28px 0",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"rgba(232,228,222,0.5)" }}>Engineering finds the right prospect. Sales knows the right timing. Copywriting starts the right conversation.</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SIGNALS ═══ */}
      <section className="bl-section bl-section-y" style={{ padding:"100px 40px 120px",position:"relative" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <FadeIn><div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20,textAlign:"center" }}>SIGNAL-BASED TARGETING</div></FadeIn>
          <FadeIn delay={0.1}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px, 4vw, 44px)",fontWeight:800,lineHeight:1.15,marginBottom:16,textAlign:"center",letterSpacing:"-0.02em",...gHS }}>We don&rsquo;t guess who&rsquo;s ready to buy.</h2></FadeIn>
          <FadeIn delay={0.15}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:640,margin:"0 auto 24px" }}>We don&rsquo;t plug you into a template. For every client, we build custom research infrastructure tailored to your ICP, your market, and the signals that matter in your industry.</p></FadeIn>
          <FadeIn delay={0.2}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:640,margin:"0 auto 60px" }}>Custom code. Custom data sources. Custom signal tracking. Everything engineered around how your buyers actually behave. Not a one-size-fits-all playbook.</p></FadeIn>

          {/* Signal examples grid */}
          <div className="bl-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:16,maxWidth:900,margin:"0 auto" }}>
            {[
              { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,150,62,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,label:"Ad copy analysis",detail:"We review their ads, spot weak messaging, and reference specific improvements in outreach" },
              { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,150,62,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,label:"Sales channel mapping",detail:"We map which channels they use and identify gaps where revenue is being left on the table" },
              { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,150,62,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,label:"Market sizing",detail:"We analyze their service area and audience to calculate untapped client potential" },
              { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,150,62,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,label:"Job description scraping",detail:"We parse their open roles to understand internal tools, workflows, and operational gaps" },
              { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,150,62,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,label:"Website feature audit",detail:"We scan their site for missing features and functionality to frame exactly what can improve" },
              { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,150,62,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,label:"DNS & infrastructure check",detail:"We inspect DNS records and tech setup to gauge how outdated their systems are" },
            ].map((s,i)=>(
              <FadeIn key={i} delay={0.25 + i*0.06}>
                <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"20px 22px",display:"flex",alignItems:"flex-start",gap:14 }}>
                  <div style={{ flexShrink:0,marginTop:2,width:18,height:18 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#E8E4DE",marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12.5,lineHeight:1.5,color:"rgba(232,228,222,0.35)" }}>{s.detail}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DIFFERENCE ═══ */}
      <section className="bl-section bl-section-y" style={{ padding:"120px 40px" }}>
        <div style={{ maxWidth:1000,margin:"0 auto" }}>
          <FadeIn><div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20,textAlign:"center" }}>THE DIFFERENCE</div></FadeIn>
          <FadeIn delay={0.1}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px, 4vw, 44px)",fontWeight:800,lineHeight:1.15,marginBottom:60,textAlign:"center",letterSpacing:"-0.02em",...gHS }}>Not another lead gen agency.</h2></FadeIn>
          <div className="bl-grid-2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
            <FadeIn>
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:16,padding:"36px 32px" }}>
                <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:"rgba(232,228,222,0.3)",marginBottom:32 }}>GENERIC AGENCIES</div>
                {["Personalized first line only","Same generic offer to everyone","Spray and pray","Vanity metrics dashboard","Lock you into contracts","Single channel blasts"].map((item,i)=>(
                  <div key={i} style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,color:"rgba(232,228,222,0.25)",padding:"14px 0",borderBottom:i<5?"1px solid rgba(255,255,255,0.03)":"none",textDecoration:"line-through",textDecorationColor:"rgba(232,228,222,0.12)" }}>{item}</div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div style={{ background:"rgba(200,150,62,0.04)",border:"1px solid rgba(200,150,62,0.15)",borderRadius:16,padding:"36px 32px" }}>
                <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:"#C8963E",marginBottom:32 }}>BLUECHAINLOGIC</div>
                {["Personalized first line, entire message, and offer","Custom offer tailored to each prospect\u2019s situation","Signal-triggered, multi-channel timing","Qualified leads in your calendar","Results guarantee or you don\u2019t pay","Whatever channel starts the conversation fastest"].map((item,i)=>(
                  <div key={i} style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"#E8E4DE",padding:"14px 0",borderBottom:i<5?"1px solid rgba(200,150,62,0.08)":"none" }}>{item}</div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ RESULTS ═══ */}
      <section className="bl-section bl-section-y" style={{ padding:"100px 40px 120px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:1000,margin:"0 auto" }}>
          <FadeIn><div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20,textAlign:"center" }}>RESULTS</div></FadeIn>
          <FadeIn delay={0.1}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px, 4vw, 44px)",fontWeight:800,lineHeight:1.15,marginBottom:60,textAlign:"center",letterSpacing:"-0.02em",...gHS }}>Proof, not promises.</h2></FadeIn>
          <div className="bl-grid-2 bl-case-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
            <FadeIn delay={0.1}>
              <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"44px 36px",height:"100%",display:"flex",flexDirection:"column" }}>
                <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:"rgba(232,228,222,0.3)",marginBottom:24 }}>CLIENT CASE</div>
                <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:22,fontWeight:700,color:"#E8E4DE",marginBottom:20 }}>e-tailize</div>
                <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,lineHeight:1.75,color:"rgba(232,228,222,0.45)",marginBottom:32,flex:1 }}>We researched what products each prospect was selling and which marketplaces they were currently on. Then we crafted emails and offers personalized to their exact situation. Not their name. Their business.</p>
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:28 }}>
                  <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:52,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1,...gH }}>&euro;84K</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"rgba(232,228,222,0.5)",marginTop:8 }}>pipeline generated in month one</div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div style={{ background:"rgba(200,150,62,0.03)",border:"1px solid rgba(200,150,62,0.12)",borderRadius:20,padding:"44px 36px",height:"100%",display:"flex",flexDirection:"column" }}>
                <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:"rgba(200,150,62,0.5)",marginBottom:24 }}>CLIENT CASE</div>
                <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:22,fontWeight:700,color:"#E8E4DE",marginBottom:20 }}>Quasarai</div>
                <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,lineHeight:1.75,color:"rgba(232,228,222,0.45)",marginBottom:32,flex:1 }}>We researched every company we reached out to &mdash; what services they provide, what industry they operate in, and which service area they cover. Then we tailored the entire approach in every email to their specific situation. Not just a personalized first line. The full message, custom to their business.</p>
                <div style={{ borderTop:"1px solid rgba(200,150,62,0.1)",paddingTop:28 }}>
                  <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:52,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1,...gH }}>&euro;24K</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"rgba(232,228,222,0.5)",marginTop:8 }}>pipeline in week one</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ GUARANTEE ═══ */}
      <section className="bl-section bl-section-y" style={{ padding:"120px 40px" }}>
        <div style={{ maxWidth:700,margin:"0 auto",textAlign:"center" }}>
          <FadeIn>
            <div className="bl-guarantee" style={{ background:"linear-gradient(135deg,rgba(200,150,62,0.08),rgba(200,150,62,0.02))",border:"1px solid rgba(200,150,62,0.2)",borderRadius:24,padding:"60px 48px" }}>
              <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20 }}>OUR GUARANTEE</div>
              <h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(24px, 3.5vw, 36px)",fontWeight:800,lineHeight:1.2,marginBottom:24,letterSpacing:"-0.02em",...gH }}>36 qualified leads in 90 days<br/>or you don&rsquo;t pay. Period.</h2>
              <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:16,lineHeight:1.75,color:"rgba(232,228,222,0.5)",marginBottom:8 }}>If we don&rsquo;t deliver 36 ICP-matched prospects who have replied positively and expressed genuine interest in your services within 90 days, you pay nothing.</p>
              <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:16,lineHeight:1.75,color:"rgba(232,228,222,0.5)" }}>Not a reduced rate. Not a credit. Free.</p>
              <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#C8963E",marginTop:28 }}>Zero risk. Full upside.</div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ PIPELINE ═══ */}
      <section id="pipeline" className="bl-section bl-section-y" style={{ padding:"120px 40px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:600,height:600,background:"radial-gradient(circle,rgba(200,150,62,0.04) 0%,transparent 70%)",borderRadius:"50%",filter:"blur(100px)",pointerEvents:"none" }}/>
        <div style={{ maxWidth:900,margin:"0 auto",position:"relative" }}>
          <FadeIn><div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20,textAlign:"center" }}>OUR APPROACH</div></FadeIn>
          <FadeIn delay={0.1}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px, 4vw, 44px)",fontWeight:800,lineHeight:1.15,marginBottom:16,textAlign:"center",letterSpacing:"-0.02em",...gHS }}>How We Work With Clients</h2></FadeIn>
          <FadeIn delay={0.15}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:560,margin:"0 auto 80px" }}>A structured, transparent process from first conversation to measurable pipeline growth. Here&rsquo;s exactly what to expect.</p></FadeIn>

          <div style={{ position:"relative" }}>
            <div className="bl-pipeline-line" style={{ position:"absolute",left:"50%",top:0,bottom:0,width:2,background:"linear-gradient(180deg,transparent,rgba(200,150,62,0.2) 10%,rgba(200,150,62,0.2) 90%,transparent)",transform:"translateX(-50%)" }}/>
            {PIPELINE_STEPS.map((step,i)=>{
              const isLeft=i%2===0;
              return (
                <div key={i} style={{ position:"relative",marginBottom:i<PIPELINE_STEPS.length-1?20:0 }}>
                  <ScaleIn delay={i*0.08}>
                    <div className="bl-pipeline-num" style={{ position:"absolute",left:"50%",top:24,transform:"translateX(-50%)",zIndex:2,width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#C8963E,rgba(200,150,62,0.7))",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bricolage Grotesque', serif",fontSize:14,fontWeight:800,color:"#0A0E17",boxShadow:"0 0 24px rgba(200,150,62,0.2), 0 4px 12px rgba(0,0,0,0.3)" }}>{step.num}</div>
                  </ScaleIn>
                  <div className="bl-pipeline-step" style={{ display:"flex",justifyContent:isLeft?"flex-start":"flex-end",paddingLeft:isLeft?0:"calc(50% + 40px)",paddingRight:isLeft?"calc(50% + 40px)":0 }}>
                    <FadeIn delay={i*0.08+0.05} direction={isLeft?"right":"left"}>
                      <div style={{ background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"28px 28px",maxWidth:380,transition:"all 0.35s ease",position:"relative" }}>
                        <div className="bl-pipeline-connector" style={{ position:"absolute",top:38,[isLeft?"right":"left"]:-40,width:38,height:2,background:"rgba(200,150,62,0.15)" }}/>
                        <h3 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:19,fontWeight:700,color:"#E8E4DE",marginBottom:10 }}>{step.title}</h3>
                        <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,lineHeight:1.75,color:"rgba(232,228,222,0.45)",margin:0 }}>{step.desc}</p>
                      </div>
                    </FadeIn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ TECH CAROUSEL ═══ */}
      <section style={{ padding:"120px 0",overflow:"hidden",position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,background:"linear-gradient(180deg, rgba(200,150,62,0.02) 0%, transparent 30%, transparent 70%, rgba(200,150,62,0.02) 100%)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:400,background:"radial-gradient(ellipse,rgba(200,150,62,0.04) 0%,transparent 70%)",filter:"blur(80px)",pointerEvents:"none" }}/>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 40px",position:"relative" }}>
          <FadeIn><div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20,textAlign:"center" }}>OUR STACK</div></FadeIn>
          <FadeIn delay={0.1}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px, 4vw, 44px)",fontWeight:800,lineHeight:1.15,marginBottom:16,textAlign:"center",letterSpacing:"-0.02em",...gHS }}>Technologies We Use</h2></FadeIn>
          <FadeIn delay={0.15}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:560,margin:"0 auto 56px" }}>Custom-built AI infrastructure combined with enterprise-grade tools — so no single platform becomes a bottleneck.</p></FadeIn>
        </div>

        {/* Row 1: AI & Custom Code */}
        <FadeIn delay={0.2}>
          <div className="bl-tech-label" style={{ display:"flex",alignItems:"center",gap:16,maxWidth:1200,margin:"0 auto 8px",padding:"0 40px" }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#C8963E",boxShadow:"0 0 8px rgba(200,150,62,0.5)" }}/>
            <span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.18em",color:"rgba(200,150,62,0.5)",textTransform:"uppercase" }}>AI Models & Custom Code</span>
            <div style={{ flex:1,height:1,background:"linear-gradient(to right,rgba(200,150,62,0.15),transparent)" }}/>
          </div>
        </FadeIn>
        <div style={{ position:"relative",width:"100%",overflow:"hidden",maskImage:"linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)",WebkitMaskImage:"linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)",marginBottom:24,paddingTop:8 }}>
          <div className="tech-track" style={{ display:"flex",gap:10,width:"max-content",animation:"tech-scroll 50s linear infinite" }}>
            {[...Array(3)].flatMap((_,si)=>TECH_ROW_1.map((t,i)=><TechItem key={`r1-${si}-${i}`} name={t.name} color={t.color} logo={t.logo}/>))}
          </div>
        </div>

        {/* Row 2: CRM & Outreach Tools */}
        <FadeIn delay={0.25}>
          <div className="bl-tech-label" style={{ display:"flex",alignItems:"center",gap:16,maxWidth:1200,margin:"0 auto 8px",padding:"0 40px" }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"rgba(95,168,211,0.6)",boxShadow:"0 0 8px rgba(95,168,211,0.4)" }}/>
            <span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.18em",color:"rgba(95,168,211,0.45)",textTransform:"uppercase" }}>CRM & Outreach Integrations</span>
            <div style={{ flex:1,height:1,background:"linear-gradient(to right,rgba(95,168,211,0.12),transparent)" }}/>
          </div>
        </FadeIn>
        <div style={{ position:"relative",width:"100%",overflow:"hidden",maskImage:"linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)",WebkitMaskImage:"linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%)",paddingTop:8 }}>
          <div className="tech-track" style={{ display:"flex",gap:10,width:"max-content",animation:"scroll-right 55s linear infinite" }}>
            {[...Array(3)].flatMap((_,si)=>TECH_ROW_2.map((t,i)=><TechItem key={`r2-${si}-${i}`} name={t.name} color={t.color} logo={t.logo}/>))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="bl-section bl-section-y" style={{ padding:"120px 40px",position:"relative" }}>
        <div style={{ position:"absolute",top:"10%",right:"-10%",width:500,height:500,background:"radial-gradient(circle,rgba(200,150,62,0.03) 0%,transparent 70%)",borderRadius:"50%",filter:"blur(80px)",pointerEvents:"none" }}/>
        <div style={{ maxWidth:780,margin:"0 auto",position:"relative" }}>
          <FadeIn><div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20,textAlign:"center" }}>FAQ</div></FadeIn>
          <FadeIn delay={0.1}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px, 4vw, 44px)",fontWeight:800,lineHeight:1.15,marginBottom:16,textAlign:"center",letterSpacing:"-0.02em",...gHS }}>Frequently Asked Questions</h2></FadeIn>
          <FadeIn delay={0.15}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:500,margin:"0 auto 56px" }}>Everything you need to know about working with Bluechainlogic.</p></FadeIn>
          <div>{FAQ_DATA.map((item,i)=>(<FadeIn key={i} delay={i*0.04}><FAQItem q={item.q} a={item.a} index={i}/></FadeIn>))}</div>
        </div>
      </section>

      {/* ═══ CALENDLY ═══ */}
      <section id="book" className="bl-calendly-outer bl-section-y" style={{ padding:"120px 40px 140px",position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:800,height:400,background:"radial-gradient(ellipse,rgba(200,150,62,0.06) 0%,transparent 70%)",filter:"blur(80px)",pointerEvents:"none" }}/>
        <div style={{ maxWidth:700,margin:"0 auto",position:"relative",textAlign:"center" }}>
          <FadeIn>
            <div style={{ marginBottom:48 }}>
              <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E",marginBottom:20 }}>LET&rsquo;S TALK</div>
              <h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(32px, 5vw, 52px)",fontWeight:800,lineHeight:1.1,marginBottom:20,letterSpacing:"-0.03em",...gH }}>Ready to fill your pipeline?</h2>
              <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",maxWidth:560,margin:"0 auto" }}>We only take on a limited number of partners to maintain research quality and market exclusivity.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div ref={calendlyRef} style={{ minWidth:320,height:700 }}/>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bl-footer" style={{ borderTop:"1px solid rgba(255,255,255,0.05)",padding:"40px",textAlign:"center" }}>
        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"rgba(200,150,62,0.4)" }}>BLUECHAINLOGIC</div>
        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,color:"rgba(232,228,222,0.2)",marginTop:8 }}>Deep-research outbound that converts.</div>
        <div style={{ marginTop:20,display:"flex",justifyContent:"center",gap:24 }}>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:500,color:"rgba(232,228,222,0.25)",textDecoration:"none",transition:"color 0.3s ease",letterSpacing:"0.03em" }}>Terms &amp; Conditions</a>
          <span style={{ color:"rgba(232,228,222,0.1)" }}>&middot;</span>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:500,color:"rgba(232,228,222,0.25)",textDecoration:"none",transition:"color 0.3s ease",letterSpacing:"0.03em" }}>Privacy Policy</a>
        </div>
        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,color:"rgba(232,228,222,0.12)",marginTop:16 }}>&copy; {new Date().getFullYear()} Bluechainlogic. All rights reserved.</div>
      </footer>
    </div>
  );
}
