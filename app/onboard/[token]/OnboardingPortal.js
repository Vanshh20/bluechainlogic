"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ── Gradient heading helpers ── */
const gH = { background: "linear-gradient(135deg, #E8E4DE 0%, #C8963E 50%, #E8E4DE 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };
const gHS = { background: "linear-gradient(135deg, #E8E4DE 20%, rgba(200,150,62,0.7) 80%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };

/* ── Shared styles ── */
const cardStyle = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "36px 32px" };
const goldCardStyle = { background: "rgba(200,150,62,0.04)", border: "1px solid rgba(200,150,62,0.15)", borderRadius: 16, padding: "36px 32px" };
const inputStyle = { width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#E8E4DE", fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, outline: "none", transition: "border-color 0.3s ease, box-shadow 0.3s ease" };
const inputLabelStyle = { fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(232,228,222,0.6)", marginBottom: 8, display: "block" };

const STEPS = [
  { id: "welcome", label: "Welcome", icon: "👋" },
  { id: "timeline", label: "Timeline", icon: "⚡" },
  { id: "godaddy", label: "Domains", icon: "🌐" },
  { id: "zapmail", label: "Email", icon: "📨" },
  { id: "vayne", label: "Warm-Up", icon: "🔥" },
  { id: "anymailfinder", label: "Enrichment", icon: "🔍" },
  { id: "instantly", label: "Sending", icon: "🚀" },
  { id: "senders", label: "Senders", icon: "✉️" },
  { id: "photos", label: "Photos", icon: "📷" },
  { id: "company", label: "Company", icon: "🏢" },
  { id: "review", label: "Review", icon: "✓" },
];

/* ═══════════════════════ PROGRESS BAR ═══════════════════════ */
function ProgressBar({ currentStep, totalSteps, stepLabels, onStepClick }) {
  const pct = (currentStep / (totalSteps - 1)) * 100;
  return (
    <div style={{ position: "sticky", top: 72, zIndex: 90, background: "rgba(10,14,23,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "12px 40px 14px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ position: "relative", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #C8963E, #E0B860)", borderRadius: 3, transition: "width 0.6s cubic-bezier(.16,1,.3,1)", boxShadow: "0 0 12px rgba(200,150,62,0.3)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {stepLabels.map((s, i) => {
            const isActive = i === currentStep, isCompleted = i < currentStep;
            return (
              <div key={i} onClick={() => i <= currentStep && onStepClick(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: i <= currentStep ? "pointer" : "default", opacity: i <= currentStep ? 1 : 0.35, transition: "opacity 0.3s" }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: isActive ? "linear-gradient(135deg,#C8963E,rgba(200,150,62,0.7))" : isCompleted ? "rgba(200,150,62,0.2)" : "rgba(255,255,255,0.04)",
                  border: isActive ? "none" : isCompleted ? "1px solid rgba(200,150,62,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isCompleted ? 10 : 11,
                  color: isActive ? "#0A0E17" : isCompleted ? "#C8963E" : "rgba(232,228,222,0.3)",
                  fontWeight: 800, transition: "all 0.4s ease",
                  boxShadow: isActive ? "0 0 12px rgba(200,150,62,0.3)" : "none"
                }}>{isCompleted ? "✓" : s.icon}</div>
                <span className="progress-label" style={{
                  fontFamily: "'Instrument Sans', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                  color: isActive ? "#C8963E" : isCompleted ? "rgba(200,150,62,0.5)" : "rgba(232,228,222,0.2)",
                  whiteSpace: "nowrap", transition: "color 0.3s"
                }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ NAV BUTTONS ═══════════════════════ */
function StepNav({ onBack, onNext, nextLabel = "Continue →", nextDisabled = false, showBack = true }) {
  return (
    <div style={{ display: "flex", justifyContent: showBack ? "space-between" : "center", gap: 16, marginTop: 48 }}>
      {showBack && <button onClick={onBack} style={{ padding: "14px 28px", fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(232,228,222,0.5)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, cursor: "pointer", transition: "all 0.3s", minWidth: 120 }}>← Back</button>}
      <button onClick={onNext} disabled={nextDisabled} style={{
        padding: "14px 36px", fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, fontWeight: 600,
        color: nextDisabled ? "rgba(10,14,23,0.4)" : "#0A0E17",
        background: nextDisabled ? "rgba(200,150,62,0.3)" : "linear-gradient(135deg,#C8963E,#E0B860)",
        border: "none", borderRadius: 10, cursor: nextDisabled ? "not-allowed" : "pointer",
        transition: "all 0.3s", letterSpacing: "0.02em", minWidth: 200,
        boxShadow: nextDisabled ? "none" : "0 4px 24px rgba(200,150,62,0.25), 0 0 0 1px rgba(200,150,62,0.3)",
      }}>{nextLabel}</button>
    </div>
  );
}

/* ═══════════════════════ INSTRUCTION STEP ═══════════════════════ */
function InstructionStep({ number, text, highlight }) {
  const parts = text.split(/(Admin permissions|Admin)/g);
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(200,150,62,0.1)", border: "1px solid rgba(200,150,62,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', serif", fontSize: 14, fontWeight: 800, color: "#C8963E", flexShrink: 0 }}>{number}</div>
      <div style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, lineHeight: 1.8, color: "rgba(232,228,222,0.55)", paddingTop: 6 }}>
        {parts.map((p, i) => p === "Admin permissions" || p === "Admin" ? <strong key={i} style={{ color: "#E8E4DE", fontWeight: 700 }}>{p}</strong> : p)}
        {highlight && <span style={{ display: "block", marginTop: 4, color: "#C8963E", fontWeight: 600, fontSize: 16 }}>{highlight}</span>}
      </div>
    </div>
  );
}

/* ═══════════════════════ DOMAIN PREVIEW ═══════════════════════ */
function DomainExamples() {
  const examples = ["go-yourdomain.com", "get-yourdomain.com", "join-yourdomain.com", "try-yourdomain.com", "meet-yourdomain.com"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {examples.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "rgba(200,150,62,0.04)", border: "1px solid rgba(200,150,62,0.12)", borderRadius: 10 }}>
          <code style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, fontWeight: 600, color: "rgba(232,228,222,0.6)", letterSpacing: "0.01em" }}>{d}</code>
        </div>
      ))}
      <div style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, color: "rgba(232,228,222,0.25)", marginTop: 4, lineHeight: 1.6 }}>…and similar variations. Use prefixes like <strong style={{ color: "rgba(232,228,222,0.4)" }}>go-, get-, join-, try-, meet-, hello-, start-</strong> followed by your domain name.</div>
    </div>
  );
}

/* ═══════════════════════ STAGGER WRAPPER ═══════════════════════
   Uses a key to force remount so CSS animations replay on every step visit */
function Stagger({ children, stepKey, delay = 0 }) {
  return (
    <div key={stepKey} style={{ animation: `fadeInUp 0.6s cubic-bezier(.16,1,.3,1) ${delay}s both` }}>
      {children}
    </div>
  );
}

/* ═══════════════════════ SOFTWARE SUB-NAV ═══════════════════════ */
function SoftwareSubNav({ activeIndex }) {
  const labels = ["Domains", "Email", "Warm-Up", "Enrichment", "Sending"];
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
      <div style={{ display: "inline-flex", gap: 6 }}>
        {labels.map((l, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <div key={i} style={{
              padding: "5px 14px", borderRadius: 100,
              fontFamily: "'Instrument Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
              background: isActive ? "rgba(200,150,62,0.15)" : isDone ? "rgba(200,150,62,0.06)" : "rgba(255,255,255,0.03)",
              color: isActive ? "#C8963E" : isDone ? "rgba(200,150,62,0.5)" : "rgba(232,228,222,0.25)",
              border: `1px solid ${isActive ? "rgba(200,150,62,0.25)" : isDone ? "rgba(200,150,62,0.1)" : "rgba(255,255,255,0.04)"}`
            }}>{isDone ? "✓" : (i + 1) + "."} {l}</div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════ CONFIRM MODAL ═══════════════════════ */
function ConfirmModal({ open, onConfirm, onCancel, toolName }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onCancel}>
      <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)" }}/>
      <div onClick={e=>e.stopPropagation()} style={{
        position:"relative",maxWidth:480,width:"100%",
        background:"linear-gradient(135deg,rgba(16,20,32,0.98),rgba(10,14,23,0.98))",
        border:"1px solid rgba(200,150,62,0.2)",borderRadius:20,padding:"44px 36px",
        boxShadow:"0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(200,150,62,0.05)",
        animation:"fadeInUp 0.3s cubic-bezier(.16,1,.3,1) both"
      }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:40,marginBottom:20 }}>🔑</div>
          <h3 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:22,fontWeight:800,color:"#E8E4DE",marginBottom:12,lineHeight:1.3 }}>Before we move on...</h3>
          <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,lineHeight:1.7,color:"rgba(232,228,222,0.55)",marginBottom:8 }}>
            Did you grant us <strong style={{ color:"#E8E4DE" }}>{toolName === "GoDaddy" ? "Delegate Access" : "Admin access"}</strong> on <strong style={{ color:"#C8963E" }}>{toolName}</strong>?
          </p>
          <div style={{ padding:"14px 20px",background:"rgba(200,150,62,0.08)",border:"1px solid rgba(200,150,62,0.15)",borderRadius:10,marginBottom:28 }}>
            <code style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:16,fontWeight:700,color:"#C8963E",letterSpacing:"0.01em" }}>Noah@bluechainlogic.com</code>
          </div>
          <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.35)",marginBottom:28,lineHeight:1.6 }}>
            Without admin access we cannot configure your {toolName === "GoDaddy" ? "domains and DNS records" : toolName === "Zapmail" ? "email accounts" : toolName === "Vayne.io" ? "email warm-up and deliverability" : toolName === "AnyMailFinder" ? "lead enrichment and email finding" : "campaigns and deliverability"}. This will block your launch.
          </div>
          <div style={{ display:"flex",gap:12 }}>
            <button onClick={onCancel} style={{
              flex:1,padding:"14px 20px",fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,
              color:"rgba(232,228,222,0.5)",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",
              borderRadius:10,cursor:"pointer",transition:"all 0.3s"
            }}>Not yet — go back</button>
            <button onClick={onConfirm} style={{
              flex:1,padding:"14px 20px",fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,
              color:"#0A0E17",background:"linear-gradient(135deg,#C8963E,#E0B860)",border:"none",
              borderRadius:10,cursor:"pointer",transition:"all 0.3s",
              boxShadow:"0 4px 20px rgba(200,150,62,0.25)"
            }}>Yes, access granted ✓</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function BluechainlogicOnboarding({ token }) {
  /* ── Token validation state ── */
  const [authState, setAuthState] = useState("loading"); /* loading | valid | expired | completed | invalid | error */
  const [clientName, setClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) { setAuthState("invalid"); return; }
    fetch(`/api/validate-token?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setAuthState("valid");
          if (data.clientName) setClientName(data.clientName);
        } else {
          setAuthState(data.reason === "expired" ? "expired" : data.reason === "completed" ? "completed" : "invalid");
        }
      })
      .catch(() => setAuthState("error"));
  }, [token]);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);
  /* key increments on every step change to force stagger animation replays */
  const [animKey, setAnimKey] = useState(0);

  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [senderNames, setSenderNames] = useState([{ firstName: "", lastName: "" }]);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [icp, setIcp] = useState("");
  const [crmUsed, setCrmUsed] = useState("");
  const [calendarLink, setCalendarLink] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const goTo = useCallback((t) => {
    if (t === step || isTransitioning) return;
    setDirection(t > step ? "forward" : "backward");
    setIsTransitioning(true);
    /* Fade out first, then switch step */
    setTimeout(() => {
      setStep(t);
      setAnimKey(k => k + 1);
      window.scrollTo({ top: 0, behavior: "instant" });
      /* Allow fade-in to start */
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  }, [step, isTransitioning]);

  const next = () => goTo(Math.min(step + 1, STEPS.length - 1));
  const nextWithCheck = () => {
    if (step >= 2 && step <= 6) { setShowAdminModal(true); return; }
    next();
  };
  const confirmAdmin = () => { setShowAdminModal(false); next(); };
  const cancelAdmin = () => setShowAdminModal(false);
  const back = () => goTo(Math.max(step - 1, 0));

  const addSender = () => setSenderNames(p => [...p, { firstName: "", lastName: "" }]);
  const removeSender = (i) => setSenderNames(p => p.filter((_, idx) => idx !== i));
  const updateSender = (i, f, v) => { const u = [...senderNames]; u[i][f] = v; setSenderNames(u); };
  const handlePhotoUpload = (e) => { Array.from(e.target.files).forEach(file => { const r = new FileReader(); r.onload = (ev) => setUploadedPhotos(p => [...p, { name: file.name, url: ev.target.result }]); r.readAsDataURL(file); }); };
  const removePhoto = (i) => setUploadedPhotos(p => p.filter((_, idx) => idx !== i));

  const hasSenders = senderNames.some(s => s.firstName && s.lastName);
  const hasCompany = companyName && elevatorPitch && icp;

  /* ── Submit to API ── */
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          timeline: selectedTimeline,
          senders: senderNames.filter(s => s.firstName),
          photos: uploadedPhotos.map(p => ({ name: p.name })),
          company: { name: companyName, website: companyWebsite, elevatorPitch, icp, crmUsed, calendarLink, additionalNotes },
        }),
      });
      const data = await res.json();
      if (data.success) { setSubmitted(true); } else { alert("Something went wrong. Please try again or contact Noah@bluechainlogic.com"); }
    } catch { alert("Network error. Please try again."); }
    setSubmitting(false);
  };

  /* Simple cross-fade: container fades out during transition, fades in after step change */
  const contentOpacity = isTransitioning ? 0 : 1;
  const contentTransform = isTransitioning ? (direction === "forward" ? "translateY(-20px)" : "translateY(20px)") : "translateY(0)";

  const sk = animKey; /* shorthand for stagger key */

  /* ═══ GATE SCREENS ═══ */
  const gateStyle = { background:"#0A0E17",color:"#E8E4DE",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:40 };
  const gateCard = { maxWidth:480,textAlign:"center" };

  if (authState === "loading") return (
    <div style={gateStyle}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={gateCard}>
        <div style={{ width:40,height:40,border:"3px solid rgba(200,150,62,0.15)",borderTopColor:"#C8963E",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 24px" }}/>
        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,color:"rgba(232,228,222,0.5)" }}>Verifying your access...</div>
      </div>
    </div>
  );

  if (authState === "invalid") return (
    <div style={gateStyle}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={gateCard}>
        <div style={{ width:64,height:64,borderRadius:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(232,228,222,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:32,fontWeight:800,marginBottom:16,...gHS }}>Access Denied</h1>
        <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:16,lineHeight:1.7,color:"rgba(232,228,222,0.45)",marginBottom:32 }}>This onboarding link is invalid or doesn't exist. If you believe this is an error, please reach out to your account manager.</p>
        <a href="mailto:Noah@bluechainlogic.com" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#C8963E",textDecoration:"none" }}>Contact Noah@bluechainlogic.com →</a>
      </div>
    </div>
  );

  if (authState === "expired") return (
    <div style={gateStyle}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={gateCard}>
        <div style={{ width:64,height:64,borderRadius:16,background:"rgba(200,150,62,0.06)",border:"1px solid rgba(200,150,62,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8963E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:32,fontWeight:800,marginBottom:16,...gHS }}>Link Expired</h1>
        <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:16,lineHeight:1.7,color:"rgba(232,228,222,0.45)",marginBottom:32 }}>This onboarding link has expired. Please contact us and we'll send you a fresh link right away.</p>
        <a href="mailto:Noah@bluechainlogic.com" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#C8963E",textDecoration:"none" }}>Request new link →</a>
      </div>
    </div>
  );

  if (authState === "completed") return (
    <div style={gateStyle}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={gateCard}>
        <div style={{ width:64,height:64,borderRadius:16,background:"rgba(76,175,80,0.08)",border:"1px solid rgba(76,175,80,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:32,fontWeight:800,marginBottom:16,...gHS }}>Already Completed</h1>
        <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:16,lineHeight:1.7,color:"rgba(232,228,222,0.45)",marginBottom:32 }}>This onboarding has already been submitted. If you need to make changes, reach out to your account manager.</p>
        <a href="mailto:Noah@bluechainlogic.com" style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#C8963E",textDecoration:"none" }}>Contact Noah@bluechainlogic.com →</a>
      </div>
    </div>
  );

  if (authState === "error") return (
    <div style={gateStyle}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={gateCard}>
        <div style={{ width:64,height:64,borderRadius:16,background:"rgba(255,165,0,0.06)",border:"1px solid rgba(255,165,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:32,fontWeight:800,marginBottom:16,...gHS }}>Something went wrong</h1>
        <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:16,lineHeight:1.7,color:"rgba(232,228,222,0.45)",marginBottom:32 }}>We couldn't verify your access. Please try refreshing the page or contact us if the issue persists.</p>
        <button onClick={()=>window.location.reload()} style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#0A0E17",background:"linear-gradient(135deg,#C8963E,#E0B860)",padding:"12px 28px",borderRadius:8,border:"none",cursor:"pointer" }}>Try again</button>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={gateStyle}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');@keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ ...gateCard,animation:"fadeInUp 0.6s cubic-bezier(.16,1,.3,1) both" }}>
        <div style={{ width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,rgba(200,150,62,0.15),rgba(200,150,62,0.05))",border:"1px solid rgba(200,150,62,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8963E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:36,fontWeight:800,marginBottom:16,...gH }}>You're all set!</h1>
        <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.55)",marginBottom:12 }}>Your onboarding has been submitted successfully.</p>
        <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,lineHeight:1.7,color:"rgba(232,228,222,0.35)" }}>We'll review everything and reach out within 24 hours to kick things off. Keep an eye on your inbox.</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0A0E17", color: "#E8E4DE", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(200,150,62,0.3);color:#fff}
        body{background:#0A0E17}
        @keyframes gradient-shift{0%{background-position:0% center}50%{background-position:100% center}100%{background-position:0% center}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 30px rgba(200,150,62,0.08),0 0 60px rgba(200,150,62,0.04)}50%{box-shadow:0 0 40px rgba(200,150,62,0.15),0 0 80px rgba(200,150,62,0.08)}}
        @keyframes pulse-glow{0%,100%{opacity:0.4}50%{opacity:0.8}}
        .hero-heading-animated{background:linear-gradient(90deg,#E8E4DE 0%,#C8963E 25%,#E8E4DE 50%,#C8963E 75%,#E8E4DE 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradient-shift 8s ease infinite}
        .onboard-input:focus{border-color:rgba(200,150,62,0.4)!important;box-shadow:0 0 0 3px rgba(200,150,62,0.08)!important}
        .onboard-input::placeholder{color:rgba(232,228,222,0.2)}
        .timeline-card{cursor:pointer;transition:all 0.4s ease}
        .timeline-card:hover{transform:translateY(-4px);border-color:rgba(200,150,62,0.25)!important}
        .photo-upload-zone{cursor:pointer;transition:all 0.3s ease}
        .photo-upload-zone:hover{border-color:rgba(200,150,62,0.3)!important;background:rgba(200,150,62,0.04)!important}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0A0E17}::-webkit-scrollbar-thumb{background:rgba(200,150,62,0.3);border-radius:3px}
        .grain-overlay{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.022;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-repeat:repeat;background-size:180px}
        @media(max-width:768px){
          .timeline-grid{grid-template-columns:1fr!important}
          .sender-row{flex-direction:column!important}
          .photo-grid{grid-template-columns:repeat(2,1fr)!important}
          .step-content{padding:90px 20px 60px!important}
          .progress-label{display:none}
        }
        @media(max-width:480px){.step-content{padding:80px 16px 48px!important}}
      `}</style>
      <div className="grain-overlay"/>

      {/* NAV */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(10,14,23,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"0 40px" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:72 }}>
          <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.25em",color:"#C8963E" }}>BLUECHAINLOGIC</div>
          <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:500,color:"rgba(232,228,222,0.5)",display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:"#4CAF50",boxShadow:"0 0 8px rgba(76,175,80,0.5)" }}/>Client Onboarding
          </div>
        </div>
      </nav>

      <ProgressBar currentStep={step} totalSteps={STEPS.length} stepLabels={STEPS} onStepClick={goTo}/>

      {/* ═══ STEP CONTENT — single container with cross-fade ═══ */}
      <div style={{
        opacity: contentOpacity,
        transform: contentTransform,
        transition: "opacity 0.3s ease, transform 0.3s ease",
        minHeight: "calc(100vh - 180px)",
      }}>

        {/* ═══ 0 — WELCOME ═══ */}
        {step === 0 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:700,margin:"0 auto",textAlign:"center" }}>
              <Stagger stepKey={sk} delay={0.05}>
                <div style={{ display:"inline-flex",alignItems:"center",gap:10,padding:"8px 20px",background:"rgba(200,150,62,0.08)",border:"1px solid rgba(200,150,62,0.15)",borderRadius:100,marginBottom:32 }}>
                  <span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.15em",color:"#C8963E" }}>WELCOME ABOARD</span>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.12}>
                <h1 className="hero-heading-animated" style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(36px, 5vw, 64px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:24 }}>Let's get you set up.</h1>
              </Stagger>
              <Stagger stepKey={sk} delay={0.19}>
                <p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:"clamp(16px, 2vw, 19px)",lineHeight:1.7,color:"rgba(232,228,222,0.55)",maxWidth:560,margin:"0 auto 48px" }}>This onboarding portal walks you through everything we need to launch your campaigns. Takes about 10 minutes.</p>
              </Stagger>
              <Stagger stepKey={sk} delay={0.26}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,maxWidth:600,margin:"0 auto 48px" }}>
                  {[{icon:"🌐",label:"Buy domains & tools",time:"~7 min"},{icon:"✉️",label:"Configure identity",time:"~3 min"},{icon:"🏢",label:"Brief us",time:"~2 min"}].map((item,i)=>(
                    <div key={i} style={{ ...cardStyle,padding:"24px 16px",textAlign:"center" }}>
                      <div style={{ fontSize:28,marginBottom:10 }}>{item.icon}</div>
                      <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#E8E4DE",marginBottom:4 }}>{item.label}</div>
                      <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,color:"rgba(232,228,222,0.3)" }}>{item.time}</div>
                    </div>
                  ))}
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.33}>
                <StepNav onNext={next} nextLabel="Let's begin →" showBack={false}/>
              </Stagger>
            </div>
          </div>
        )}

        {/* ═══ 1 — TIMELINE ═══ */}
        {step === 1 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:900,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 1 OF 10</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.12}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>How fast do you want to move?</h2></Stagger>
              <Stagger stepKey={sk} delay={0.19}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:560,margin:"0 auto 48px" }}>Same quality. The only difference is speed.</p></Stagger>

              <Stagger stepKey={sk} delay={0.26}>
                <div className="timeline-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
                  {/* Standard */}
                  <div className="timeline-card" onClick={()=>setSelectedTimeline("standard")} style={{ ...cardStyle,padding:"40px 32px",height:"100%",display:"flex",flexDirection:"column",borderColor:selectedTimeline==="standard"?"rgba(200,150,62,0.5)":"rgba(255,255,255,0.04)",boxShadow:selectedTimeline==="standard"?"0 0 40px rgba(200,150,62,0.08)":"none",opacity:selectedTimeline==="fastlane"?0.55:1,transition:"all 0.4s ease" }}>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.18em",color:"rgba(232,228,222,0.25)",marginBottom:24,textTransform:"uppercase" }}>Standard Setup</div>
                    <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:48,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1,color:"rgba(232,228,222,0.5)",marginBottom:8 }}>~3 weeks</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"rgba(232,228,222,0.35)",marginBottom:24 }}>until first emails are sent</div>
                    <div style={{ flex:1 }}>
                      {["Domain warm-up (14–21 days)","Standard infrastructure build","Full research & copy development","Deliverability optimization"].map((item,i)=>(<div key={i} style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,color:"rgba(232,228,222,0.35)",padding:"10px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.03)":"none",display:"flex",alignItems:"center",gap:10 }}><span style={{ color:"rgba(200,150,62,0.3)",fontSize:8 }}>●</span>{item}</div>))}
                    </div>
                    <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:22,fontWeight:700,color:"rgba(232,228,222,0.5)",marginTop:24,paddingTop:24,borderTop:"1px solid rgba(255,255,255,0.04)" }}>Included in retainer</div>
                    {selectedTimeline==="standard"&&<div style={{ marginTop:16,padding:"10px 16px",background:"rgba(200,150,62,0.1)",borderRadius:8,fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:600,color:"#C8963E",textAlign:"center" }}>✓ Selected</div>}
                  </div>
                  {/* Fast Lane */}
                  <div className="timeline-card" onClick={()=>setSelectedTimeline("fastlane")} style={{
                    padding:"40px 32px",height:"100%",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",cursor:"pointer",
                    background:"linear-gradient(165deg, rgba(200,150,62,0.08) 0%, rgba(200,150,62,0.03) 40%, rgba(200,150,62,0.06) 100%)",
                    border: selectedTimeline==="fastlane" ? "2px solid rgba(200,150,62,0.6)" : "1px solid rgba(200,150,62,0.25)",
                    borderRadius:16,
                    boxShadow: selectedTimeline==="fastlane"
                      ? "0 0 50px rgba(200,150,62,0.15), 0 0 100px rgba(200,150,62,0.06), inset 0 1px 0 rgba(200,150,62,0.15)"
                      : "0 0 30px rgba(200,150,62,0.06), 0 0 60px rgba(200,150,62,0.03), inset 0 1px 0 rgba(200,150,62,0.1)",
                    animation: selectedTimeline!=="fastlane" ? "pulse-glow 4s ease-in-out infinite" : "none",
                    transition:"all 0.4s ease",
                    transform: selectedTimeline==="fastlane" ? "scale(1.02)" : "scale(1)"
                  }}>
                    {/* Shimmer border effect */}
                    <div style={{ position:"absolute",inset:-1,borderRadius:17,padding:1,background:"linear-gradient(90deg, transparent 0%, rgba(200,150,62,0.3) 25%, rgba(224,184,96,0.5) 50%, rgba(200,150,62,0.3) 75%, transparent 100%)",backgroundSize:"200% 100%",animation:"shimmer 4s linear infinite",WebkitMask:"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",WebkitMaskComposite:"xor",maskComposite:"exclude",pointerEvents:"none",opacity:0.6 }}/>
                    <div style={{ position:"absolute",top:16,right:16,padding:"6px 14px",background:"linear-gradient(135deg,#C8963E,#E0B860)",borderRadius:6,fontFamily:"'Instrument Sans', sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"#0A0E17",boxShadow:"0 2px 12px rgba(200,150,62,0.3)" }}>RECOMMENDED</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.18em",color:"#C8963E",marginBottom:24,textTransform:"uppercase" }}>⚡ Fast Lane</div>
                    <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:48,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1,background:"linear-gradient(135deg, #E8E4DE 0%, #C8963E 50%, #E0B860 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8 }}>~3 days</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"rgba(232,228,222,0.6)",marginBottom:24 }}>until first emails are sent</div>
                    <div style={{ flex:1 }}>
                      {["Pre-warmed domains ready to go","Enrichment infrastructure built immediately","Full research & copy development","Deliverability optimization","Skip 2–3 week warm-up queue","We clear our schedule to fast-track your launch"].map((item,i)=>(<div key={i} style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,color:"rgba(232,228,222,0.65)",padding:"10px 0",borderBottom:i<5?"1px solid rgba(200,150,62,0.08)":"none",display:"flex",alignItems:"center",gap:10 }}><span style={{ color:"#C8963E",fontSize:8 }}>●</span>{item}</div>))}
                    </div>
                    <div style={{ marginTop:24,paddingTop:24,borderTop:"1px solid rgba(200,150,62,0.15)" }}>
                      <div style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:22,fontWeight:700,color:"#E8E4DE" }}>$1,500 <span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:500,color:"rgba(232,228,222,0.4)" }}>one-time</span></div>
                      <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.4)",marginTop:4 }}>Added to first invoice · results 18 days faster</div>
                    </div>
                    {selectedTimeline==="fastlane"&&<div style={{ marginTop:16,padding:"10px 16px",background:"rgba(200,150,62,0.2)",borderRadius:8,fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:600,color:"#C8963E",textAlign:"center",boxShadow:"inset 0 0 20px rgba(200,150,62,0.05)" }}>⚡ Selected — we'll start immediately</div>}
                  </div>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.33}><StepNav onBack={back} onNext={next} nextDisabled={!selectedTimeline}/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 2 — GODADDY: DOMAINS ═══ */}
        {step === 2 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:660,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 2 OF 10 · SOFTWARE</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.08}><SoftwareSubNav activeIndex={0}/></Stagger>
              <Stagger stepKey={sk} delay={0.14}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Purchase Sending Domains</h2></Stagger>
              <Stagger stepKey={sk} delay={0.2}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:600,margin:"0 auto 40px" }}>We use secondary domains to protect your primary domain's reputation. Each domain holds 3 email accounts — so you'll need <strong style={{ color:"#E8E4DE" }}>10 domains for 30 accounts</strong> or <strong style={{ color:"#E8E4DE" }}>16 domains for 50 accounts</strong>.</p></Stagger>

              <Stagger stepKey={sk} delay={0.26}>
                <a href="https://godaddy.com?ref=bluechainlogic" target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"16px 24px",fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"#0A0E17",background:"linear-gradient(135deg,#FF6600,#FF8533)",borderRadius:10,textDecoration:"none",textAlign:"center",boxShadow:"0 4px 20px rgba(255,102,0,0.2)",marginBottom:32 }}>Purchase Domains on GoDaddy →</a>
              </Stagger>

              <Stagger stepKey={sk} delay={0.3}>
                <div style={{ ...cardStyle,padding:"32px 28px" }}>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.15em",color:"#C8963E",marginBottom:24 }}>SETUP INSTRUCTIONS</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
                    <InstructionStep number="1" text="Go to GoDaddy.com and purchase your sending domains (10 for 30 accounts, 16 for 50). See the naming examples below for inspiration." />
                    <InstructionStep number="2" text='Once purchased, go to your GoDaddy Account Settings → Delegate Access.' />
                    <InstructionStep number="3" text='Click "Invite to Access", enter our details, and select the "Products & Domains" access level:' highlight="Noah@bluechainlogic.com" />
                    <InstructionStep number="4" text="That's it — this gives us access to all your domains at once. We'll handle DNS records (SPF, DKIM, DMARC) and nameserver configuration from there." />
                  </div>
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.36}>
                <div style={{ marginTop:32,marginBottom:32 }}>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.15em",color:"#C8963E",marginBottom:14 }}>DOMAIN NAMING EXAMPLES</div>
                  <DomainExamples/>
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.42}>
                <div style={{ marginTop:20,padding:"20px 24px",background:"rgba(255,165,0,0.04)",border:"1px solid rgba(255,165,0,0.12)",borderRadius:12,display:"flex",gap:14,alignItems:"flex-start" }}>
                  <div style={{ fontSize:20,flexShrink:0 }}>⚠️</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,lineHeight:1.7,color:"rgba(232,228,222,0.55)" }}><strong style={{ color:"#E8E4DE" }}>Why this matters:</strong> Without delegate access to your GoDaddy account, we cannot configure email authentication (DNS records). Your emails will land in spam and we can't launch campaigns.</div>
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.46}><StepNav onBack={back} onNext={nextWithCheck} nextLabel="Domains purchased — Next →"/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 3 — ZAPMAIL ═══ */}
        {step === 3 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:660,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 3 OF 10 · SOFTWARE</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.08}><SoftwareSubNav activeIndex={1}/></Stagger>
              <Stagger stepKey={sk} delay={0.14}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Set Up Email Accounts</h2></Stagger>
              <Stagger stepKey={sk} delay={0.2}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:600,margin:"0 auto 40px" }}>Zapmail creates and manages your sending mailboxes. Follow the instructions for your plan below.</p></Stagger>

              <Stagger stepKey={sk} delay={0.26}>
                <a href="https://zapmail.ai?ref=bluechainlogic" target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"16px 24px",fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"#0A0E17",background:"linear-gradient(135deg,#4285F4,#5B9BF4)",borderRadius:10,textDecoration:"none",textAlign:"center",boxShadow:"0 4px 20px rgba(66,133,244,0.2)",marginBottom:32 }}>Create an Account on Zapmail →</a>
              </Stagger>

              {/* ── 30 Email Accounts ── */}
              <Stagger stepKey={sk} delay={0.3}>
                <div style={{ ...goldCardStyle,padding:"32px 28px",marginBottom:24 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
                    <div style={{ padding:"4px 12px",background:"linear-gradient(135deg,#C8963E,#E0B860)",borderRadius:6,fontFamily:"'Instrument Sans', sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"#0A0E17" }}>30 ACCOUNTS</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#E8E4DE" }}>Standard Setup — $99/mo</div>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
                    <InstructionStep number="1" text="Sign up for Zapmail and log into the dashboard." />
                    <InstructionStep number="2" text='Purchase the 30 Email Account plan ($99/mo). This is all you need — it includes 30 Google Workspace mailboxes.' />
                    <InstructionStep number="3" text='Go to Settings → Team, click "Invite Member" and add us with Admin permissions:' highlight="Noah@bluechainlogic.com" />
                    <InstructionStep number="4" text="We'll handle the rest — connecting your GoDaddy domains and creating mailboxes for each sender." />
                  </div>
                </div>
              </Stagger>

              {/* ── 50 Email Accounts ── */}
              <Stagger stepKey={sk} delay={0.36}>
                <div style={{ ...cardStyle,padding:"32px 28px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
                    <div style={{ padding:"4px 12px",background:"rgba(255,255,255,0.08)",borderRadius:6,fontFamily:"'Instrument Sans', sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"rgba(232,228,222,0.6)" }}>50 ACCOUNTS</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#E8E4DE" }}>Expanded Setup</div>
                  </div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.4)",lineHeight:1.7,marginBottom:20 }}>For 50 accounts you'll set up 35 Google Workspace + 15 Outlook accounts across two providers inside Zapmail.</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.15em",color:"#4285F4",marginBottom:-8 }}>GOOGLE WORKSPACE (35 ACCOUNTS)</div>
                    <InstructionStep number="1" text="In the Zapmail dashboard, purchase the 30 Google Workspace email accounts plan." />
                    <InstructionStep number="2" text='Then navigate to Email Accounts in the left sidebar and purchase 5 extra Google Workspace email accounts.' />
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.15em",color:"#0078D4",marginTop:8,marginBottom:-8 }}>OUTLOOK (15 ACCOUNTS)</div>
                    <InstructionStep number="3" text='Click the toggle in the top-right corner to switch to Outlook. Click "See Plans" → "Buy New Plan" → select the Starter plan ($39/mo — includes 10 accounts).' />
                    <InstructionStep number="4" text='Navigate to Email Accounts in the left sidebar and purchase 5 extra Outlook email accounts.' />
                    <div style={{ height:1,background:"rgba(255,255,255,0.06)",margin:"4px 0" }}/>
                    <InstructionStep number="5" text='Go to Settings → Team, click "Invite Member" and add us with Admin permissions:' highlight="Noah@bluechainlogic.com" />
                    <InstructionStep number="6" text="We'll connect your domains and set up all 50 mailboxes across both providers." />
                  </div>
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.42}>
                <div style={{ marginTop:20,padding:"20px 24px",background:"rgba(255,165,0,0.04)",border:"1px solid rgba(255,165,0,0.12)",borderRadius:12,display:"flex",gap:14,alignItems:"flex-start" }}>
                  <div style={{ fontSize:20,flexShrink:0 }}>⚠️</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,lineHeight:1.7,color:"rgba(232,228,222,0.55)" }}><strong style={{ color:"#E8E4DE" }}>Why this matters:</strong> Without admin access to Zapmail, we cannot create or manage your sending mailboxes. This blocks the entire campaign setup.</div>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.46}><StepNav onBack={back} onNext={nextWithCheck} nextLabel="Zapmail set up — Next →"/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 4 — VAYNE.IO: WARM-UP ═══ */}
        {step === 4 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:660,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 4 OF 10 · SOFTWARE</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.08}><SoftwareSubNav activeIndex={2}/></Stagger>
              <Stagger stepKey={sk} delay={0.14}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Set Up Email Warm-Up</h2></Stagger>
              <Stagger stepKey={sk} delay={0.2}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:600,margin:"0 auto 40px" }}>Vayne.io warms up your email accounts to build sender reputation and maximize deliverability. Your plan depends on how many email accounts you purchased on Zapmail.</p></Stagger>

              <Stagger stepKey={sk} delay={0.26}>
                <a href="https://vayne.io" target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"16px 24px",fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"#0A0E17",background:"linear-gradient(135deg,#E05252,#F47A7A)",borderRadius:10,textDecoration:"none",textAlign:"center",boxShadow:"0 4px 20px rgba(224,82,82,0.2)",marginBottom:32 }}>Create an Account on Vayne.io →</a>
              </Stagger>

              {/* ── 30 Email Accounts → Freelancer Plan ── */}
              <Stagger stepKey={sk} delay={0.3}>
                <div style={{ ...goldCardStyle,padding:"32px 28px",marginBottom:24 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
                    <div style={{ padding:"4px 12px",background:"linear-gradient(135deg,#C8963E,#E0B860)",borderRadius:6,fontFamily:"'Instrument Sans', sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"#0A0E17" }}>30 ACCOUNTS</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#E8E4DE" }}>Freelancer Plan</div>
                  </div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.4)",lineHeight:1.7,marginBottom:20 }}>If you purchased <strong style={{ color:"#E8E4DE" }}>30 email accounts</strong> on Zapmail, you need the <strong style={{ color:"#C8963E" }}>Freelancer plan</strong> on Vayne.io.</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
                    <InstructionStep number="1" text="Go to Vayne.io and create your account." />
                    <InstructionStep number="2" text='Navigate to the Pricing page and purchase the Freelancer plan — this covers warm-up for up to 30 email accounts.' />
                    <InstructionStep number="3" text='Once subscribed, go to Settings → Team (or Workspace), click "Invite Member" and add us with Admin permissions:' highlight="Noah@bluechainlogic.com" />
                    <InstructionStep number="4" text="We'll connect your Zapmail accounts and configure the warm-up schedules to build your sender reputation." />
                  </div>
                </div>
              </Stagger>

              {/* ── 50 Email Accounts → Starter Package ── */}
              <Stagger stepKey={sk} delay={0.36}>
                <div style={{ ...cardStyle,padding:"32px 28px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
                    <div style={{ padding:"4px 12px",background:"rgba(255,255,255,0.08)",borderRadius:6,fontFamily:"'Instrument Sans', sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"rgba(232,228,222,0.6)" }}>50 ACCOUNTS</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#E8E4DE" }}>Starter Package</div>
                  </div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.4)",lineHeight:1.7,marginBottom:20 }}>If you purchased <strong style={{ color:"#E8E4DE" }}>50 email accounts</strong> on Zapmail, you need the <strong style={{ color:"#C8963E" }}>Starter package</strong> on Vayne.io to cover all your mailboxes.</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
                    <InstructionStep number="1" text="Go to Vayne.io and create your account." />
                    <InstructionStep number="2" text='Navigate to the Pricing page and purchase the Starter package — this covers warm-up for up to 50 email accounts.' />
                    <InstructionStep number="3" text='Once subscribed, go to Settings → Team (or Workspace), click "Invite Member" and add us with Admin permissions:' highlight="Noah@bluechainlogic.com" />
                    <InstructionStep number="4" text="We'll connect all 50 of your Zapmail accounts and configure warm-up schedules across the board." />
                  </div>
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.42}>
                <div style={{ marginTop:20,padding:"20px 24px",background:"rgba(255,165,0,0.04)",border:"1px solid rgba(255,165,0,0.12)",borderRadius:12,display:"flex",gap:14,alignItems:"flex-start" }}>
                  <div style={{ fontSize:20,flexShrink:0 }}>⚠️</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,lineHeight:1.7,color:"rgba(232,228,222,0.55)" }}><strong style={{ color:"#E8E4DE" }}>Why this matters:</strong> Without admin access to Vayne.io, we cannot configure email warm-up for your accounts. Poor warm-up means poor deliverability — your emails will land in spam instead of the inbox.</div>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.46}><StepNav onBack={back} onNext={nextWithCheck} nextLabel="Vayne.io set up — Next →"/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 5 — ANYMAILFINDER: ENRICHMENT ═══ */}
        {step === 5 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:660,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 5 OF 10 · SOFTWARE</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.08}><SoftwareSubNav activeIndex={3}/></Stagger>
              <Stagger stepKey={sk} delay={0.14}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Set Up Lead Enrichment</h2></Stagger>
              <Stagger stepKey={sk} delay={0.2}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:600,margin:"0 auto 40px" }}>AnyMailFinder finds and verifies email addresses for your target prospects. Your plan depends on the volume of outreach based on the number of email accounts you set up.</p></Stagger>

              <Stagger stepKey={sk} delay={0.26}>
                <a href="https://anymailfinder.com/?via=noah-hoekendijk" target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"16px 24px",fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"#0A0E17",background:"linear-gradient(135deg,#10B981,#34D399)",borderRadius:10,textDecoration:"none",textAlign:"center",boxShadow:"0 4px 20px rgba(16,185,129,0.2)",marginBottom:32 }}>Create an Account on AnyMailFinder →</a>
              </Stagger>

              {/* ── 30 Email Accounts → 5k credits/month ── */}
              <Stagger stepKey={sk} delay={0.3}>
                <div style={{ ...goldCardStyle,padding:"32px 28px",marginBottom:24 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
                    <div style={{ padding:"4px 12px",background:"linear-gradient(135deg,#C8963E,#E0B860)",borderRadius:6,fontFamily:"'Instrument Sans', sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"#0A0E17" }}>30 ACCOUNTS</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#E8E4DE" }}>5,000 Credits / Month</div>
                  </div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.4)",lineHeight:1.7,marginBottom:20 }}>If you set up <strong style={{ color:"#E8E4DE" }}>30 email accounts</strong>, you need the <strong style={{ color:"#C8963E" }}>5,000 credits per month</strong> plan on AnyMailFinder to keep your lead pipeline full.</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
                    <InstructionStep number="1" text="Click the button above to go to AnyMailFinder and create your account." />
                    <InstructionStep number="2" text='Navigate to the Pricing / Plans page and purchase the 5,000 credits per month plan.' />
                    <InstructionStep number="3" text='Once subscribed, go to your Account Settings → API Keys, copy your API key and send it to us at:' highlight="Noah@bluechainlogic.com" />
                    <InstructionStep number="4" text="Alternatively, if there is a Team or Workspace feature, invite us with Admin permissions using the email above. We'll integrate it with your campaign infrastructure." />
                  </div>
                </div>
              </Stagger>

              {/* ── 50 Email Accounts → 10k credits/month ── */}
              <Stagger stepKey={sk} delay={0.36}>
                <div style={{ ...cardStyle,padding:"32px 28px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
                    <div style={{ padding:"4px 12px",background:"rgba(255,255,255,0.08)",borderRadius:6,fontFamily:"'Instrument Sans', sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"rgba(232,228,222,0.6)" }}>50 ACCOUNTS</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,color:"#E8E4DE" }}>10,000 Credits / Month</div>
                  </div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.4)",lineHeight:1.7,marginBottom:20 }}>If you set up <strong style={{ color:"#E8E4DE" }}>50 email accounts</strong>, you need the <strong style={{ color:"#C8963E" }}>10,000 credits per month</strong> plan on AnyMailFinder to handle the higher outreach volume.</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
                    <InstructionStep number="1" text="Click the button above to go to AnyMailFinder and create your account." />
                    <InstructionStep number="2" text='Navigate to the Pricing / Plans page and purchase the 10,000 credits per month plan.' />
                    <InstructionStep number="3" text='Once subscribed, go to your Account Settings → API Keys, copy your API key and send it to us at:' highlight="Noah@bluechainlogic.com" />
                    <InstructionStep number="4" text="Alternatively, if there is a Team or Workspace feature, invite us with Admin permissions using the email above. We'll integrate it with your full 50-account campaign setup." />
                  </div>
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.42}>
                <div style={{ marginTop:20,padding:"20px 24px",background:"rgba(255,165,0,0.04)",border:"1px solid rgba(255,165,0,0.12)",borderRadius:12,display:"flex",gap:14,alignItems:"flex-start" }}>
                  <div style={{ fontSize:20,flexShrink:0 }}>⚠️</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,lineHeight:1.7,color:"rgba(232,228,222,0.55)" }}><strong style={{ color:"#E8E4DE" }}>Why this matters:</strong> Without access to AnyMailFinder, we cannot find and verify prospect email addresses. This directly limits the number of leads we can reach and slows down your campaign results.</div>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.46}><StepNav onBack={back} onNext={nextWithCheck} nextLabel="AnyMailFinder set up — Next →"/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 6 — INSTANTLY ═══ */}
        {step === 6 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:660,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 6 OF 10 · SOFTWARE</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.08}><SoftwareSubNav activeIndex={4}/></Stagger>
              <Stagger stepKey={sk} delay={0.14}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Connect Sending Platform</h2></Stagger>
              <Stagger stepKey={sk} delay={0.2}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:560,margin:"0 auto 40px" }}>The final tool. Instantly runs your campaigns — inbox rotation, warm-up, sequencing, and analytics.</p></Stagger>

              <Stagger stepKey={sk} delay={0.26}>
                <a href="https://instantly.ai?ref=bluechainlogic" target="_blank" rel="noopener noreferrer" style={{ display:"block",padding:"16px 24px",fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"#0A0E17",background:"linear-gradient(135deg,#5B5FC7,#7B7FE7)",borderRadius:10,textDecoration:"none",textAlign:"center",boxShadow:"0 4px 20px rgba(91,95,199,0.2)",marginBottom:32 }}>Get Instantly — Hypergrowth Plan ($97/mo) →</a>
              </Stagger>

              <Stagger stepKey={sk} delay={0.3}>
                <div style={{ ...cardStyle,padding:"32px 28px" }}>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.15em",color:"#C8963E",marginBottom:24 }}>SETUP INSTRUCTIONS</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
                    <InstructionStep number="1" text="Create your Instantly account and choose the Hypergrowth plan." />
                    <InstructionStep number="2" text='Go to Settings → Workspace → Members in the left sidebar.' />
                    <InstructionStep number="3" text='Click "Invite Member" and add us with Admin permissions:' highlight="Noah@bluechainlogic.com" />
                    <InstructionStep number="4" text="That's it. We'll connect your Zapmail accounts, configure warm-up, and build your campaign sequences." />
                  </div>
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.36}>
                <div style={{ marginTop:20,padding:"20px 24px",background:"rgba(255,165,0,0.04)",border:"1px solid rgba(255,165,0,0.12)",borderRadius:12,display:"flex",gap:14,alignItems:"flex-start" }}>
                  <div style={{ fontSize:20,flexShrink:0 }}>⚠️</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,lineHeight:1.7,color:"rgba(232,228,222,0.55)" }}><strong style={{ color:"#E8E4DE" }}>Why this matters:</strong> Without admin access to Instantly, we cannot manage campaigns, monitor deliverability, or optimize outreach.</div>
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.4}>
                <div style={{ marginTop:20,padding:"20px 24px",...goldCardStyle,borderRadius:12,display:"flex",gap:14,alignItems:"flex-start" }}>
                  <div style={{ fontSize:20,flexShrink:0 }}>🎉</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,lineHeight:1.7,color:"rgba(232,228,222,0.55)" }}><strong style={{ color:"#E8E4DE" }}>Software done!</strong> All five tools are set up. Now let's configure your sender identity, photos, and brief us on your business.</div>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.44}><StepNav onBack={back} onNext={nextWithCheck} nextLabel="All software done — Continue →"/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 7 — SENDERS ═══ */}
        {step === 7 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:600,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 7 OF 10</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.12}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Sender Identity</h2></Stagger>
              <Stagger stepKey={sk} delay={0.19}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:500,margin:"0 auto 48px" }}>What name(s) should your emails be sent from? This is what prospects see in their inbox.</p></Stagger>
              <Stagger stepKey={sk} delay={0.26}>
                <div style={{ ...cardStyle,padding:"40px 32px" }}>
                  {senderNames.map((sender,i)=>(
                    <div key={i} style={{ marginBottom:i<senderNames.length-1?24:0 }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                        <span style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:14,fontWeight:700,color:"rgba(200,150,62,0.6)" }}>Sender {String(i+1).padStart(2,"0")}</span>
                        {senderNames.length>1&&<button onClick={()=>removeSender(i)} style={{ background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:6,padding:"4px 12px",color:"rgba(255,80,80,0.6)",fontFamily:"'Instrument Sans', sans-serif",fontSize:12,cursor:"pointer" }}>Remove</button>}
                      </div>
                      <div className="sender-row" style={{ display:"flex",gap:12 }}>
                        <div style={{ flex:1 }}><label style={inputLabelStyle}>First Name</label><input className="onboard-input" type="text" placeholder="e.g. Noah" value={sender.firstName} onChange={e=>updateSender(i,"firstName",e.target.value)} style={inputStyle}/></div>
                        <div style={{ flex:1 }}><label style={inputLabelStyle}>Last Name</label><input className="onboard-input" type="text" placeholder="e.g. van der Berg" value={sender.lastName} onChange={e=>updateSender(i,"lastName",e.target.value)} style={inputStyle}/></div>
                      </div>
                      {i<senderNames.length-1&&<div style={{ borderBottom:"1px solid rgba(255,255,255,0.04)",marginTop:24 }}/>}
                    </div>
                  ))}
                  <button onClick={addSender} style={{ marginTop:24,width:"100%",padding:"14px",background:"rgba(200,150,62,0.06)",border:"1px dashed rgba(200,150,62,0.2)",borderRadius:10,color:"#C8963E",fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:600,cursor:"pointer" }}>+ Add another sender</button>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.3}><div style={{ marginTop:14,fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.3)",textAlign:"center" }}>We recommend using 1 sending name.</div></Stagger>
              <Stagger stepKey={sk} delay={0.33}><StepNav onBack={back} onNext={next} nextDisabled={!hasSenders}/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 8 — PHOTOS ═══ */}
        {step === 8 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:600,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 8 OF 10</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.12}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Profile Photos</h2></Stagger>
              <Stagger stepKey={sk} delay={0.19}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:500,margin:"0 auto 48px" }}>Upload professional headshot(s) for the email accounts. One per sender is ideal.</p></Stagger>
              <Stagger stepKey={sk} delay={0.26}>
                <div style={{ ...cardStyle,padding:"40px 32px" }}>
                  <label className="photo-upload-zone" style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 32px",border:"2px dashed rgba(255,255,255,0.08)",borderRadius:14,background:"rgba(255,255,255,0.01)",textAlign:"center",cursor:"pointer" }}>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display:"none" }}/>
                    <div style={{ fontSize:36,marginBottom:16,opacity:0.4 }}>📷</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:15,fontWeight:600,color:"rgba(232,228,222,0.6)",marginBottom:8 }}>Click to upload photos</div>
                    <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.3)" }}>PNG, JPG, or WEBP · Professional headshots preferred</div>
                  </label>
                  {uploadedPhotos.length>0&&(
                    <div className="photo-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:24 }}>
                      {uploadedPhotos.map((photo,i)=>(
                        <div key={i} style={{ position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)",aspectRatio:"1/1" }}>
                          <img src={photo.url} alt={photo.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                          <button onClick={()=>removePhoto(i)} style={{ position:"absolute",top:8,right:8,width:28,height:28,borderRadius:8,background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
                          <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"8px 12px",background:"linear-gradient(transparent,rgba(0,0,0,0.8))" }}>
                            <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,color:"rgba(255,255,255,0.7)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{photo.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.3}>
                <div style={{ marginTop:16,padding:"14px 18px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10 }}>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:600,color:"rgba(232,228,222,0.5)",marginBottom:4 }}>📸 Photo tips</div>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.3)",lineHeight:1.7 }}>Professional headshot with good lighting. Avoid logos, group photos, or casual images. A clear face photo increases open rates by up to 30%.</div>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.33}><StepNav onBack={back} onNext={next} nextLabel={uploadedPhotos.length>0?"Continue →":"Skip for now →"}/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 9 — COMPANY ═══ */}
        {step === 9 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:600,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>STEP 9 OF 10</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.12}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Company Brief</h2></Stagger>
              <Stagger stepKey={sk} delay={0.19}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:500,margin:"0 auto 48px" }}>Help us understand your business so we can craft outreach that converts.</p></Stagger>
              <Stagger stepKey={sk} delay={0.26}>
                <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                  <div style={{ ...cardStyle,padding:"32px 28px" }}>
                    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
                      <div><label style={inputLabelStyle}>Company Name *</label><input className="onboard-input" type="text" placeholder="e.g. Acme Solutions B.V." value={companyName} onChange={e=>setCompanyName(e.target.value)} style={inputStyle}/></div>
                      <div><label style={inputLabelStyle}>Website</label><input className="onboard-input" type="url" placeholder="https://acmesolutions.com" value={companyWebsite} onChange={e=>setCompanyWebsite(e.target.value)} style={inputStyle}/></div>
                      <div><label style={inputLabelStyle}>Elevator Pitch * <span style={{ color:"rgba(232,228,222,0.25)",fontWeight:400 }}>— 2–3 sentences</span></label><textarea className="onboard-input" placeholder="We help [audience] achieve [outcome] by [method]." value={elevatorPitch} onChange={e=>setElevatorPitch(e.target.value)} rows={4} style={{ ...inputStyle,resize:"vertical",minHeight:100 }}/></div>
                      <div><label style={inputLabelStyle}>Ideal Customer Profile * <span style={{ color:"rgba(232,228,222,0.25)",fontWeight:400 }}>— Who do we reach out to?</span></label><textarea className="onboard-input" placeholder="Industry, company size, job titles, geography, pain points..." value={icp} onChange={e=>setIcp(e.target.value)} rows={4} style={{ ...inputStyle,resize:"vertical",minHeight:100 }}/></div>
                    </div>
                  </div>
                  <div style={{ ...cardStyle,padding:"32px 28px" }}>
                    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
                      <div><label style={inputLabelStyle}>CRM You're Using</label><input className="onboard-input" type="text" placeholder="e.g. HubSpot, Salesforce, Pipedrive..." value={crmUsed} onChange={e=>setCrmUsed(e.target.value)} style={inputStyle}/></div>
                      <div><label style={inputLabelStyle}>Calendar Link</label><input className="onboard-input" type="url" placeholder="https://calendly.com/you/30min" value={calendarLink} onChange={e=>setCalendarLink(e.target.value)} style={inputStyle}/></div>
                      <div><label style={inputLabelStyle}>Anything else?</label><textarea className="onboard-input" placeholder="Previous outbound experience, competitors, markets to avoid..." value={additionalNotes} onChange={e=>setAdditionalNotes(e.target.value)} rows={3} style={{ ...inputStyle,resize:"vertical",minHeight:80 }}/></div>
                    </div>
                  </div>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.33}><StepNav onBack={back} onNext={next} nextLabel="Review & Submit →" nextDisabled={!hasCompany}/></Stagger>
            </div>
          </div>
        )}

        {/* ═══ 10 — REVIEW ═══ */}
        {step === 10 && (
          <div className="step-content" style={{ padding:"120px 40px 100px" }}>
            <div style={{ maxWidth:600,margin:"0 auto" }}>
              <Stagger stepKey={sk} delay={0.05}><div style={{ textAlign:"center",marginBottom:8 }}><span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"#C8963E" }}>FINAL STEP</span></div></Stagger>
              <Stagger stepKey={sk} delay={0.12}><h2 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,lineHeight:1.15,textAlign:"center",letterSpacing:"-0.02em",...gHS,marginBottom:16 }}>Review & Submit</h2></Stagger>
              <Stagger stepKey={sk} delay={0.19}><p style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:17,lineHeight:1.7,color:"rgba(232,228,222,0.45)",textAlign:"center",maxWidth:500,margin:"0 auto 48px" }}>Here's everything. Click any row to edit.</p></Stagger>

              <Stagger stepKey={sk} delay={0.26}>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {[
                    { label:"Timeline",value:selectedTimeline==="fastlane"?"⚡ Fast Lane (~3 days)":selectedTimeline==="standard"?"Standard (~3 weeks)":"—",done:!!selectedTimeline,to:1 },
                    { label:"Domains (GoDaddy)",value:"Sending domains purchased",done:true,to:2,note:"Ensure admin access granted" },
                    { label:"Email (Zapmail)",value:"Email accounts",done:true,to:3,note:"Ensure admin access granted" },
                    { label:"Warm-Up (Vayne.io)",value:"Email warm-up",done:true,to:4,note:"Ensure admin access granted" },
                    { label:"Enrichment (AnyMailFinder)",value:"Lead enrichment",done:true,to:5,note:"Ensure admin access granted" },
                    { label:"Sending (Instantly)",value:"Campaign platform",done:true,to:6,note:"Ensure admin access granted" },
                    { label:"Senders",value:senderNames.filter(s=>s.firstName).map(s=>`${s.firstName} ${s.lastName}`).join(", ")||"—",done:hasSenders,to:7 },
                    { label:"Photos",value:uploadedPhotos.length>0?`${uploadedPhotos.length} photo(s)`:"None yet",done:uploadedPhotos.length>0,to:8 },
                    { label:"Company",value:companyName||"—",done:hasCompany,to:9 },
                  ].map((item,i)=>(
                    <div key={i} onClick={()=>goTo(item.to)} style={{ display:"flex",alignItems:"center",gap:14,padding:"16px 20px",background:item.done?"rgba(200,150,62,0.04)":"rgba(255,255,255,0.02)",border:`1px solid ${item.done?"rgba(200,150,62,0.12)":"rgba(255,255,255,0.05)"}`,borderRadius:12,cursor:"pointer",transition:"all 0.3s" }}>
                      <div style={{ width:26,height:26,borderRadius:7,background:item.done?"linear-gradient(135deg,#C8963E,rgba(200,150,62,0.7))":"rgba(255,255,255,0.04)",border:item.done?"none":"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:item.done?"#0A0E17":"rgba(232,228,222,0.2)",fontWeight:800,flexShrink:0 }}>{item.done?"✓":""}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,fontWeight:600,letterSpacing:"0.1em",color:"rgba(200,150,62,0.5)",marginBottom:1 }}>{item.label}</div>
                        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:14,fontWeight:500,color:item.done?"#E8E4DE":"rgba(232,228,222,0.3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{item.value}</div>
                        {item.note&&<div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,color:"rgba(232,228,222,0.2)",marginTop:1 }}>{item.note}</div>}
                      </div>
                      <span style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,color:"rgba(232,228,222,0.15)",flexShrink:0 }}>Edit →</span>
                    </div>
                  ))}
                </div>
              </Stagger>

              <Stagger stepKey={sk} delay={0.33}>
                <div style={{ marginTop:32 }}>
                  <button onClick={handleSubmit} disabled={submitting} style={{ width:"100%",padding:"18px 36px",fontFamily:"'Instrument Sans', sans-serif",fontSize:16,fontWeight:600,color:submitting?"rgba(10,14,23,0.5)":"#0A0E17",background:submitting?"rgba(200,150,62,0.4)":"linear-gradient(135deg,#C8963E,#E0B860)",borderRadius:12,border:"none",cursor:submitting?"not-allowed":"pointer",transition:"all 0.3s",letterSpacing:"0.02em",boxShadow:submitting?"none":"0 4px 24px rgba(200,150,62,0.25), 0 0 0 1px rgba(200,150,62,0.3)" }}>{submitting ? "Submitting..." : "Submit Onboarding →"}</button>
                  <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:13,color:"rgba(232,228,222,0.25)",marginTop:12,textAlign:"center" }}>We'll review and reach out within 24 hours.</div>
                </div>
              </Stagger>
              <Stagger stepKey={sk} delay={0.36}>
                <div style={{ display:"flex",justifyContent:"center",marginTop:20 }}>
                  <button onClick={back} style={{ padding:"10px 20px",fontFamily:"'Instrument Sans', sans-serif",fontSize:13,fontWeight:500,color:"rgba(232,228,222,0.4)",background:"transparent",border:"none",cursor:"pointer" }}>← Back</button>
                </div>
              </Stagger>
            </div>
          </div>
        )}
      </div>

      {/* ADMIN CONFIRM MODAL */}
      <ConfirmModal
        open={showAdminModal}
        onConfirm={confirmAdmin}
        onCancel={cancelAdmin}
        toolName={step === 2 ? "GoDaddy" : step === 3 ? "Zapmail" : step === 4 ? "Vayne.io" : step === 5 ? "AnyMailFinder" : "Instantly"}
      />

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)",padding:40,textAlign:"center" }}>
        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.2em",color:"rgba(200,150,62,0.4)" }}>BLUECHAINLOGIC</div>
        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:12,color:"rgba(232,228,222,0.2)",marginTop:8 }}>Deep-research outbound that converts.</div>
        <div style={{ fontFamily:"'Instrument Sans', sans-serif",fontSize:11,color:"rgba(232,228,222,0.12)",marginTop:16 }}>© {new Date().getFullYear()} Bluechainlogic. All rights reserved.</div>
      </footer>
    </div>
  );
}
