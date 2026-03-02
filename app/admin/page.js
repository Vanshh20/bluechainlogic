"use client";
import { useState, useEffect, useCallback } from "react";

const gH = { background:"linear-gradient(135deg, #E8E4DE 0%, #C8963E 50%, #E8E4DE 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" };

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [storedPw, setStoredPw] = useState("");

  /* Client data */
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  /* New client form */
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [lastLink, setLastLink] = useState(null);

  /* Detail view */
  const [selected, setSelected] = useState(null);

  /* Notification */
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const headers = useCallback(() => ({ "Content-Type": "application/json", "x-admin-password": storedPw }), [storedPw]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/submissions", { headers: headers() });
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setClients(data.clients || []);
    } catch { showToast("Failed to load clients", "error"); }
    setLoading(false);
  }, [headers]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStoredPw(password);
    /* Test the password by hitting the submissions endpoint */
    const res = await fetch("/api/admin/submissions", { headers: { "x-admin-password": password } });
    if (res.ok) { setAuthed(true); } else { showToast("Wrong password", "error"); setPassword(""); }
  };

  useEffect(() => { if (authed) fetchClients(); }, [authed, fetchClients]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    setGenerating(true);
    setLastLink(null);
    try {
      const res = await fetch("/api/admin/generate-link", { method: "POST", headers: headers(), body: JSON.stringify({ clientName: newName, email: newEmail }) });
      const data = await res.json();
      if (data.success) {
        setLastLink(data);
        setNewName(""); setNewEmail("");
        showToast(data.emailSent ? `Link sent to ${newEmail}` : "Link created (email failed — copy manually)");
        fetchClients();
      } else { showToast(data.error || "Failed", "error"); }
    } catch { showToast("Network error", "error"); }
    setGenerating(false);
  };

  const handleResend = async (id) => {
    try {
      const res = await fetch("/api/admin/resend-link", { method: "POST", headers: headers(), body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.success) {
        showToast(data.emailSent ? "New link sent!" : "Link regenerated (email failed — copy from table)");
        fetchClients();
      } else { showToast(data.error || "Failed", "error"); }
    } catch { showToast("Network error", "error"); }
  };

  const copyLink = (token) => {
    const link = `${window.location.origin}/onboard/${token}`;
    navigator.clipboard.writeText(link);
    showToast("Link copied!");
  };

  /* ═══ STYLES ═══ */
  const pageStyle = { background:"#0A0E17",color:"#E8E4DE",minHeight:"100vh",fontFamily:"'Instrument Sans', sans-serif" };
  const inputStyle = { width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#E8E4DE",fontSize:14,outline:"none",fontFamily:"inherit" };
  const btnGold = { padding:"12px 24px",background:"linear-gradient(135deg,#C8963E,#E0B860)",color:"#0A0E17",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer" };
  const btnGhost = { padding:"8px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"rgba(232,228,222,0.5)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" };
  const card = { background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"28px 24px" };

  /* ═══ LOGIN GATE ═══ */
  if (!authed) return (
    <div style={{ ...pageStyle,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ maxWidth:380,width:"100%",textAlign:"center" }}>
        <div style={{ fontSize:12,fontWeight:700,letterSpacing:"0.2em",color:"#C8963E",marginBottom:32 }}>BLUECHAINLOGIC</div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:28,fontWeight:800,marginBottom:8,...gH }}>Admin Dashboard</h1>
        <p style={{ fontSize:14,color:"rgba(232,228,222,0.4)",marginBottom:32 }}>Enter your password to continue.</p>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ ...inputStyle,marginBottom:16,textAlign:"center" }} autoFocus />
          <button type="submit" style={{ ...btnGold,width:"100%" }}>Login →</button>
        </form>
        {toast && <div style={{ marginTop:16,padding:"10px 16px",background:toast.type==="error"?"rgba(255,80,80,0.1)":"rgba(200,150,62,0.1)",border:`1px solid ${toast.type==="error"?"rgba(255,80,80,0.2)":"rgba(200,150,62,0.2)"}`,borderRadius:8,fontSize:13,color:toast.type==="error"?"#ff5050":"#C8963E" }}>{toast.msg}</div>}
      </div>
    </div>
  );

  /* ═══ STATUS HELPERS ═══ */
  const statusColor = (s) => s === "completed" ? "#4CAF50" : s === "pending" ? "#C8963E" : "#5B9BF4";
  const statusLabel = (s) => s === "completed" ? "Completed" : s === "pending" ? "Pending" : "In Progress";
  const isExpired = (c) => c.status !== "completed" && new Date(c.expires_at) < new Date();
  const timeAgo = (d) => { if (!d) return "—"; const s = Math.floor((Date.now()-new Date(d))/1000); if(s<60) return "just now"; if(s<3600) return `${Math.floor(s/60)}m ago`; if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

  /* ═══ MAIN DASHBOARD ═══ */
  return (
    <div style={pageStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        input:focus{border-color:rgba(200,150,62,0.4)!important;box-shadow:0 0 0 3px rgba(200,150,62,0.08)!important}
        input::placeholder{color:rgba(232,228,222,0.2)}
        .admin-row:hover{background:rgba(255,255,255,0.02)!important}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0A0E17}::-webkit-scrollbar-thumb{background:rgba(200,150,62,0.3);border-radius:3px}
        @media(max-width:768px){.admin-table-wrap{overflow-x:auto}.admin-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Toast */}
      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:200,padding:"12px 20px",background:toast.type==="error"?"rgba(255,80,80,0.15)":"rgba(200,150,62,0.15)",border:`1px solid ${toast.type==="error"?"rgba(255,80,80,0.3)":"rgba(200,150,62,0.3)"}`,borderRadius:10,fontSize:13,fontWeight:600,color:toast.type==="error"?"#ff6b6b":"#C8963E",backdropFilter:"blur(12px)" }}>{toast.msg}</div>}

      {/* Nav */}
      <nav style={{ borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"0 32px" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:64 }}>
          <div style={{ fontSize:12,fontWeight:700,letterSpacing:"0.2em",color:"#C8963E" }}>BLUECHAINLOGIC</div>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <span style={{ fontSize:12,color:"rgba(232,228,222,0.3)" }}>Admin</span>
            <button onClick={()=>{setAuthed(false);setStoredPw("");}} style={{ ...btnGhost,fontSize:11 }}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"32px 32px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:28,fontWeight:800,...gH,marginBottom:4 }}>Client Onboarding</h1>
          <p style={{ fontSize:14,color:"rgba(232,228,222,0.35)" }}>{clients.length} total · {clients.filter(c=>c.status==="completed").length} completed · {clients.filter(c=>c.status==="pending").length} pending</p>
        </div>

        <div className="admin-grid" style={{ display:"grid",gridTemplateColumns:"380px 1fr",gap:24,alignItems:"start" }}>

          {/* ── LEFT: New Client Form ── */}
          <div style={{ position:"sticky",top:24 }}>
            <div style={card}>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.15em",color:"#C8963E",marginBottom:20 }}>NEW ONBOARDING LINK</div>
              <form onSubmit={handleGenerate} style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <input type="text" placeholder="Client name" value={newName} onChange={e=>setNewName(e.target.value)} style={inputStyle} />
                <input type="email" placeholder="Client email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} style={inputStyle} />
                <button type="submit" disabled={generating||!newName||!newEmail} style={{ ...btnGold,opacity:generating||!newName||!newEmail?0.5:1,cursor:generating||!newName||!newEmail?"not-allowed":"pointer" }}>{generating ? "Generating..." : "Generate & Send →"}</button>
              </form>

              {lastLink && (
                <div style={{ marginTop:16,padding:"14px 16px",background:"rgba(200,150,62,0.06)",border:"1px solid rgba(200,150,62,0.12)",borderRadius:8 }}>
                  <div style={{ fontSize:11,fontWeight:600,color:"rgba(200,150,62,0.6)",marginBottom:6 }}>{lastLink.emailSent ? "✓ EMAIL SENT" : "⚠ EMAIL FAILED — COPY LINK"}</div>
                  <div style={{ fontSize:12,color:"rgba(232,228,222,0.5)",wordBreak:"break-all",marginBottom:8 }}>{lastLink.link}</div>
                  <button onClick={()=>{navigator.clipboard.writeText(lastLink.link);showToast("Copied!");}} style={btnGhost}>Copy link</button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Clients Table ── */}
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.15em",color:"rgba(232,228,222,0.3)" }}>ALL CLIENTS</div>
              <button onClick={fetchClients} style={btnGhost}>{loading ? "Loading..." : "↻ Refresh"}</button>
            </div>

            {clients.length === 0 && !loading && (
              <div style={{ ...card,textAlign:"center",padding:"60px 32px" }}>
                <div style={{ fontSize:36,marginBottom:16,opacity:0.3 }}>📋</div>
                <div style={{ fontSize:15,color:"rgba(232,228,222,0.35)" }}>No clients yet. Generate your first onboarding link.</div>
              </div>
            )}

            <div className="admin-table-wrap" style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {clients.map(c => (
                <div key={c.id} className="admin-row" onClick={()=>setSelected(selected?.id===c.id?null:c)} style={{ ...card,padding:"16px 20px",cursor:"pointer",transition:"background 0.2s",borderColor:selected?.id===c.id?"rgba(200,150,62,0.2)":"rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                    {/* Status dot */}
                    <div style={{ width:8,height:8,borderRadius:"50%",background:isExpired(c)?"#ff5050":statusColor(c.status),boxShadow:`0 0 8px ${isExpired(c)?"rgba(255,80,80,0.4)":`${statusColor(c.status)}44`}`,flexShrink:0 }}/>

                    {/* Info */}
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:2 }}>
                        <span style={{ fontSize:14,fontWeight:600,color:"#E8E4DE" }}>{c.client_name}</span>
                        <span style={{ fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4,background:isExpired(c)?"rgba(255,80,80,0.1)":"rgba(255,255,255,0.04)",color:isExpired(c)?"#ff6b6b":statusColor(c.status) }}>{isExpired(c)?"Expired":statusLabel(c.status)}</span>
                      </div>
                      <div style={{ fontSize:12,color:"rgba(232,228,222,0.3)" }}>{c.email} · Created {timeAgo(c.created_at)}{c.submitted_at ? ` · Submitted ${timeAgo(c.submitted_at)}` : ""}</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex",gap:8,flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>copyLink(c.token)} style={btnGhost} title="Copy link">📋</button>
                      {c.status !== "completed" && <button onClick={()=>handleResend(c.id)} style={btnGhost} title="Resend link">🔄</button>}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selected?.id === c.id && c.status === "completed" && (
                    <div style={{ marginTop:16,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.05)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                      {[
                        { label:"Timeline", value:c.timeline || "—" },
                        { label:"Company", value:c.company_name || "—" },
                        { label:"Website", value:c.company_website || "—" },
                        { label:"CRM", value:c.crm_used || "—" },
                        { label:"Calendar", value:c.calendar_link || "—" },
                        { label:"Senders", value:(() => { try { return JSON.parse(c.senders)?.map(s=>`${s.firstName} ${s.lastName}`).join(", ") } catch { return c.senders || "—" } })() },
                      ].map((f,i) => (
                        <div key={i}>
                          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"rgba(200,150,62,0.4)",marginBottom:2 }}>{f.label}</div>
                          <div style={{ fontSize:13,color:"rgba(232,228,222,0.6)",wordBreak:"break-all" }}>{f.value}</div>
                        </div>
                      ))}
                      {c.elevator_pitch && (
                        <div style={{ gridColumn:"1/-1" }}>
                          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"rgba(200,150,62,0.4)",marginBottom:2 }}>ELEVATOR PITCH</div>
                          <div style={{ fontSize:13,color:"rgba(232,228,222,0.6)",lineHeight:1.6 }}>{c.elevator_pitch}</div>
                        </div>
                      )}
                      {c.icp && (
                        <div style={{ gridColumn:"1/-1" }}>
                          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"rgba(200,150,62,0.4)",marginBottom:2 }}>ICP</div>
                          <div style={{ fontSize:13,color:"rgba(232,228,222,0.6)",lineHeight:1.6 }}>{c.icp}</div>
                        </div>
                      )}
                      {c.additional_notes && (
                        <div style={{ gridColumn:"1/-1" }}>
                          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:"rgba(200,150,62,0.4)",marginBottom:2 }}>NOTES</div>
                          <div style={{ fontSize:13,color:"rgba(232,228,222,0.6)",lineHeight:1.6 }}>{c.additional_notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
