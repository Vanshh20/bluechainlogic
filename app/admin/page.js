"use client";
import { useState, useEffect, useCallback } from "react";

const gH = { background:"linear-gradient(135deg, #E8E4DE 0%, #C8963E 50%, #E8E4DE 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" };

/* ── SVG Icons ── */
const Icon = ({ children, size = 18, color = "rgba(232,228,222,0.4)", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
);
const LockIcon = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>;
const EyeIcon = (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Icon>;
const EyeOffIcon = (p) => <Icon {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></Icon>;
const PlusIcon = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const SendIcon = (p) => <Icon {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>;
const RefreshIcon = (p) => <Icon {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Icon>;
const CopyIcon = (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>;
const LinkIcon = (p) => <Icon {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Icon>;
const UsersIcon = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const CheckCircleIcon = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
const ClockIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const AlertIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>;
const ChevronDownIcon = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>;
const LogOutIcon = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>;
const InboxIcon = (p) => <Icon {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></Icon>;

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [storedPw, setStoredPw] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [lastLink, setLastLink] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
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
    setLoginError(false);
    const res = await fetch("/api/admin/submissions", { headers: { "x-admin-password": password } });
    if (res.ok) { setStoredPw(password); setAuthed(true); }
    else { setLoginError(true); setPassword(""); }
  };

  useEffect(() => { if (authed) fetchClients(); }, [authed, fetchClients]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    setGenerating(true); setLastLink(null);
    try {
      const res = await fetch("/api/admin/generate-link", { method: "POST", headers: headers(), body: JSON.stringify({ clientName: newName, email: newEmail }) });
      const data = await res.json();
      if (data.success) { setLastLink(data); setNewName(""); setNewEmail(""); showToast(data.emailSent ? "Link sent to " + newEmail : "Link created — email failed, copy manually"); fetchClients(); }
      else { showToast(data.error || "Failed", "error"); }
    } catch { showToast("Network error", "error"); }
    setGenerating(false);
  };

  const handleResend = async (id) => {
    try {
      const res = await fetch("/api/admin/resend-link", { method: "POST", headers: headers(), body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.success) { showToast(data.emailSent ? "New link sent" : "Link regenerated — copy from table"); fetchClients(); }
      else { showToast(data.error || "Failed", "error"); }
    } catch { showToast("Network error", "error"); }
  };

  const copyLink = (token) => { navigator.clipboard.writeText(window.location.origin + "/onboard/" + token); showToast("Link copied"); };

  const isExpired = (c) => c.status !== "completed" && new Date(c.expires_at) < new Date();
  const timeAgo = (d) => { if (!d) return "\u2014"; const s = Math.floor((Date.now()-new Date(d))/1000); if(s<60) return "just now"; if(s<3600) return Math.floor(s/60)+"m ago"; if(s<86400) return Math.floor(s/3600)+"h ago"; return Math.floor(s/86400)+"d ago"; };
  const filteredClients = filter === "all" ? clients : filter === "expired" ? clients.filter(isExpired) : clients.filter(c => c.status === filter && !isExpired(c));
  const counts = { all: clients.length, pending: clients.filter(c=>c.status==="pending"&&!isExpired(c)).length, completed: clients.filter(c=>c.status==="completed").length, expired: clients.filter(isExpired).length };

  if (!authed) return (
    <div style={{ background:"#0A0E17",color:"#E8E4DE",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Instrument Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}input:focus{border-color:rgba(200,150,62,0.4)!important;box-shadow:0 0 0 3px rgba(200,150,62,0.06)!important}input::placeholder{color:rgba(232,228,222,0.18)}`}</style>
      <div style={{ maxWidth:400,width:"100%",padding:"0 24px",animation:"fadeInUp 0.5s cubic-bezier(.16,1,.3,1) both" }}>
        <div style={{ textAlign:"center",marginBottom:48 }}>
          <div style={{ width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,rgba(200,150,62,0.12),rgba(200,150,62,0.04))",border:"1px solid rgba(200,150,62,0.15)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}><LockIcon size={24} color="#C8963E" /></div>
          <div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.25em",color:"rgba(200,150,62,0.5)",marginBottom:12 }}>BLUECHAINLOGIC</div>
          <h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:28,fontWeight:800,...gH,marginBottom:8 }}>Admin Dashboard</h1>
          <p style={{ fontSize:14,color:"rgba(232,228,222,0.3)" }}>Enter your password to continue</p>
        </div>
        <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"32px 28px",animation:loginError?"shake 0.4s ease":"none" }}>
          <form onSubmit={handleLogin}>
            <label style={{ fontSize:12,fontWeight:600,color:"rgba(232,228,222,0.4)",marginBottom:8,display:"block",letterSpacing:"0.05em" }}>Password</label>
            <div style={{ position:"relative",marginBottom:20 }}>
              <input type={showPassword?"text":"password"} placeholder="Enter admin password" value={password} onChange={e=>{setPassword(e.target.value);setLoginError(false);}} style={{ width:"100%",padding:"14px 48px 14px 16px",background:"rgba(255,255,255,0.04)",border:"1px solid "+(loginError?"rgba(255,80,80,0.4)":"rgba(255,255,255,0.08)"),borderRadius:10,color:"#E8E4DE",fontSize:15,outline:"none",fontFamily:"inherit",transition:"border-color 0.3s",textAlign:"left" }} autoFocus />
              <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4,display:"flex" }}>{showPassword?<EyeOffIcon size={18} color="rgba(232,228,222,0.3)"/>:<EyeIcon size={18} color="rgba(232,228,222,0.3)"/>}</button>
            </div>
            {loginError && <div style={{ fontSize:13,color:"rgba(255,80,80,0.7)",marginBottom:16,display:"flex",alignItems:"center",gap:8 }}><AlertIcon size={14} color="rgba(255,80,80,0.7)" /> Incorrect password</div>}
            <button type="submit" disabled={!password} style={{ width:"100%",padding:"14px 24px",background:password?"linear-gradient(135deg,#C8963E,#E0B860)":"rgba(200,150,62,0.2)",color:password?"#0A0E17":"rgba(10,14,23,0.4)",border:"none",borderRadius:10,fontSize:15,fontWeight:600,cursor:password?"pointer":"not-allowed",transition:"all 0.3s",fontFamily:"inherit",boxShadow:password?"0 4px 20px rgba(200,150,62,0.2)":"none" }}>Sign in</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:"#0A0E17",color:"#E8E4DE",minHeight:"100vh",fontFamily:"'Instrument Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}input:focus,textarea:focus{border-color:rgba(200,150,62,0.4)!important;box-shadow:0 0 0 3px rgba(200,150,62,0.06)!important}input::placeholder{color:rgba(232,228,222,0.18)}.admin-row{transition:all 0.2s ease}.admin-row:hover{border-color:rgba(255,255,255,0.1)!important;background:rgba(255,255,255,0.025)!important}.admin-btn{transition:all 0.2s ease}.admin-btn:hover{background:rgba(255,255,255,0.06)!important;border-color:rgba(255,255,255,0.12)!important}.filter-tab{transition:all 0.2s ease;cursor:pointer}.filter-tab:hover{color:rgba(232,228,222,0.6)!important}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(200,150,62,0.2);border-radius:3px}@media(max-width:768px){.admin-layout{grid-template-columns:1fr!important}.admin-sidebar{position:static!important}}`}</style>

      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:200,padding:"14px 20px",background:toast.type==="error"?"rgba(255,60,60,0.08)":"rgba(200,150,62,0.08)",border:"1px solid "+(toast.type==="error"?"rgba(255,60,60,0.2)":"rgba(200,150,62,0.2)"),borderRadius:10,fontSize:13,fontWeight:500,color:toast.type==="error"?"#ff6b6b":"#C8963E",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",gap:10,animation:"fadeInUp 0.3s ease" }}>{toast.type==="error"?<AlertIcon size={15} color="#ff6b6b"/>:<CheckCircleIcon size={15} color="#C8963E"/>}{toast.msg}</div>}

      <nav style={{ borderBottom:"1px solid rgba(255,255,255,0.04)",padding:"0 32px",background:"rgba(10,14,23,0.8)",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}><span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.2em",color:"#C8963E" }}>BLUECHAINLOGIC</span><span style={{ width:1,height:16,background:"rgba(255,255,255,0.06)" }}/><span style={{ fontSize:12,fontWeight:600,color:"rgba(232,228,222,0.25)",letterSpacing:"0.05em" }}>Admin</span></div>
          <button onClick={()=>{setAuthed(false);setStoredPw("");}} className="admin-btn" style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,color:"rgba(232,228,222,0.4)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit" }}><LogOutIcon size={14} color="rgba(232,228,222,0.35)"/> Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1280,margin:"0 auto",padding:"28px 32px 80px" }}>
        <div style={{ marginBottom:28,display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16 }}>
          <div><h1 style={{ fontFamily:"'Bricolage Grotesque', serif",fontSize:24,fontWeight:800,...gH,marginBottom:4 }}>Client Onboarding</h1><p style={{ fontSize:13,color:"rgba(232,228,222,0.25)" }}>Manage onboarding links and track submissions</p></div>
          <div style={{ display:"flex",gap:6 }}>
            {[{key:"all",label:"All",count:counts.all},{key:"pending",label:"Pending",count:counts.pending},{key:"completed",label:"Completed",count:counts.completed},{key:"expired",label:"Expired",count:counts.expired}].map(f=>(<button key={f.key} className="filter-tab" onClick={()=>setFilter(f.key)} style={{ padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"inherit",border:"1px solid",cursor:"pointer",background:filter===f.key?"rgba(200,150,62,0.08)":"transparent",borderColor:filter===f.key?"rgba(200,150,62,0.2)":"rgba(255,255,255,0.04)",color:filter===f.key?"#C8963E":"rgba(232,228,222,0.3)" }}>{f.label} <span style={{ opacity:0.5 }}>{f.count}</span></button>))}
          </div>
        </div>

        <div className="admin-layout" style={{ display:"grid",gridTemplateColumns:"360px 1fr",gap:24,alignItems:"start" }}>
          <div className="admin-sidebar" style={{ position:"sticky",top:88,display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"24px 22px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
                <div style={{ width:32,height:32,borderRadius:8,background:"rgba(200,150,62,0.08)",border:"1px solid rgba(200,150,62,0.15)",display:"flex",alignItems:"center",justifyContent:"center" }}><PlusIcon size={15} color="#C8963E"/></div>
                <div><div style={{ fontSize:14,fontWeight:600,color:"#E8E4DE" }}>New Onboarding</div><div style={{ fontSize:11,color:"rgba(232,228,222,0.25)" }}>Generate link and send email</div></div>
              </div>
              <form onSubmit={handleGenerate} style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <input type="text" placeholder="Client name" value={newName} onChange={e=>setNewName(e.target.value)} style={{ width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"#E8E4DE",fontSize:14,outline:"none",fontFamily:"inherit",transition:"all 0.3s" }}/>
                <input type="email" placeholder="Client email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} style={{ width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"#E8E4DE",fontSize:14,outline:"none",fontFamily:"inherit",transition:"all 0.3s" }}/>
                <button type="submit" disabled={generating||!newName||!newEmail} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 20px",background:(!newName||!newEmail)?"rgba(200,150,62,0.15)":"linear-gradient(135deg,#C8963E,#E0B860)",color:(!newName||!newEmail)?"rgba(10,14,23,0.3)":"#0A0E17",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:(!newName||!newEmail)?"not-allowed":"pointer",fontFamily:"inherit",transition:"all 0.3s",boxShadow:(newName&&newEmail)?"0 2px 16px rgba(200,150,62,0.15)":"none" }}><SendIcon size={14} color={(!newName||!newEmail)?"rgba(10,14,23,0.3)":"#0A0E17"}/>{generating?"Sending...":"Generate & Send"}</button>
              </form>
              {lastLink && (<div style={{ marginTop:14,padding:"12px 14px",background:"rgba(200,150,62,0.04)",border:"1px solid rgba(200,150,62,0.1)",borderRadius:8 }}><div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>{lastLink.emailSent?<CheckCircleIcon size={13} color="#4CAF50"/>:<AlertIcon size={13} color="#FFA500"/>}<span style={{ fontSize:11,fontWeight:600,color:lastLink.emailSent?"#4CAF50":"#FFA500" }}>{lastLink.emailSent?"Email sent":"Email failed — copy link"}</span></div><div style={{ fontSize:11,color:"rgba(232,228,222,0.35)",wordBreak:"break-all",lineHeight:1.5,marginBottom:8 }}>{lastLink.link}</div><button onClick={()=>{navigator.clipboard.writeText(lastLink.link);showToast("Copied");}} className="admin-btn" style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"rgba(232,228,222,0.5)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}><CopyIcon size={12} color="rgba(232,228,222,0.4)"/> Copy link</button></div>)}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[{label:"Total",value:counts.all,icon:<UsersIcon size={15} color="rgba(232,228,222,0.3)"/>},{label:"Completed",value:counts.completed,icon:<CheckCircleIcon size={15} color="#4CAF50"/>},{label:"Pending",value:counts.pending,icon:<ClockIcon size={15} color="#C8963E"/>},{label:"Expired",value:counts.expired,icon:<AlertIcon size={15} color="#ff6b6b"/>}].map((s,i)=>(<div key={i} style={{ padding:"14px 16px",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10 }}><div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>{s.icon}<span style={{ fontSize:10,fontWeight:600,color:"rgba(232,228,222,0.25)",letterSpacing:"0.08em" }}>{s.label.toUpperCase()}</span></div><div style={{ fontSize:22,fontWeight:700,color:"#E8E4DE",fontFamily:"'Bricolage Grotesque', serif" }}>{s.value}</div></div>))}
            </div>
          </div>

          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
              <div style={{ fontSize:12,fontWeight:600,color:"rgba(232,228,222,0.2)",letterSpacing:"0.08em" }}>{filteredClients.length} CLIENT{filteredClients.length!==1?"S":""}</div>
              <button onClick={fetchClients} className="admin-btn" style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,color:"rgba(232,228,222,0.35)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}><RefreshIcon size={12} color="rgba(232,228,222,0.3)"/>{loading?"Loading...":"Refresh"}</button>
            </div>
            {filteredClients.length===0&&!loading&&(<div style={{ background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:14,textAlign:"center",padding:"64px 32px" }}><InboxIcon size={36} color="rgba(232,228,222,0.12)"/><div style={{ fontSize:15,color:"rgba(232,228,222,0.25)",marginTop:16 }}>{filter==="all"?"No clients yet":"No clients match this filter"}</div></div>)}
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {filteredClients.map(c=>{const expired=isExpired(c);const statusDot=expired?"#ff5050":c.status==="completed"?"#4CAF50":"#C8963E";const isOpen=selected?.id===c.id;return(
                <div key={c.id} className="admin-row" onClick={()=>setSelected(isOpen?null:c)} style={{ background:"rgba(255,255,255,0.015)",border:"1px solid "+(isOpen?"rgba(200,150,62,0.15)":"rgba(255,255,255,0.04)"),borderRadius:12,cursor:"pointer",overflow:"hidden" }}>
                  <div style={{ padding:"14px 18px",display:"flex",alignItems:"center",gap:14 }}>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:statusDot,boxShadow:"0 0 8px "+statusDot+"44",flexShrink:0 }}/>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}><span style={{ fontSize:14,fontWeight:600,color:"#E8E4DE" }}>{c.client_name}</span><span style={{ fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:4,background:expired?"rgba(255,80,80,0.08)":c.status==="completed"?"rgba(76,175,80,0.08)":"rgba(200,150,62,0.08)",color:expired?"#ff6b6b":c.status==="completed"?"#4CAF50":"#C8963E",letterSpacing:"0.03em" }}>{expired?"Expired":c.status==="completed"?"Completed":"Pending"}</span></div>
                      <div style={{ fontSize:12,color:"rgba(232,228,222,0.2)" }}>{c.email} · {timeAgo(c.created_at)}{c.submitted_at?" · Submitted "+timeAgo(c.submitted_at):""}</div>
                    </div>
                    <div style={{ display:"flex",gap:6,flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>copyLink(c.token)} className="admin-btn" title="Copy link" style={{ width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:7,cursor:"pointer" }}><CopyIcon size={13} color="rgba(232,228,222,0.35)"/></button>
                      {c.status!=="completed"&&<button onClick={()=>handleResend(c.id)} className="admin-btn" title="Resend link" style={{ width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:7,cursor:"pointer" }}><RefreshIcon size={13} color="rgba(232,228,222,0.35)"/></button>}
                    </div>
                    <ChevronDownIcon size={14} color="rgba(232,228,222,0.15)" style={{ transform:isOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s" }}/>
                  </div>
                  {isOpen&&c.status==="completed"&&(<div style={{ padding:"0 18px 18px",borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:16 }}><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>{[{label:"Timeline",value:c.timeline||"\u2014"},{label:"Email Accounts",value:c.email_accounts?c.email_accounts+" accounts":"\u2014"},{label:"Company",value:c.company_name||"\u2014"},{label:"Website",value:c.company_website||"\u2014"},{label:"CRM",value:c.crm_used||"\u2014"},{label:"Calendar",value:c.calendar_link||"\u2014"},{label:"Senders",value:(()=>{try{return JSON.parse(c.senders)?.map(s=>s.firstName+" "+s.lastName).join(", ")}catch{return c.senders||"\u2014"}})()}].map((f,i)=>(<div key={i} style={{ padding:"10px 12px",background:"rgba(255,255,255,0.015)",borderRadius:8,border:"1px solid rgba(255,255,255,0.03)" }}><div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.08em",color:"rgba(200,150,62,0.35)",marginBottom:3 }}>{f.label.toUpperCase()}</div><div style={{ fontSize:13,color:"rgba(232,228,222,0.55)",wordBreak:"break-all",lineHeight:1.4 }}>{f.value}</div></div>))}{(c.vayne_email||c.anymailfinder_email)&&(<div style={{ gridColumn:"1/-1",marginTop:4 }}><div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.08em",color:"rgba(200,150,62,0.5)",marginBottom:10 }}>ACCOUNT CREDENTIALS</div><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>{c.vayne_email&&(<div style={{ padding:"12px 14px",background:"rgba(224,82,82,0.04)",borderRadius:8,border:"1px solid rgba(224,82,82,0.12)" }}><div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:"rgba(224,82,82,0.6)",marginBottom:8 }}>VAYNE.IO</div><div style={{ display:"flex",flexDirection:"column",gap:6 }}><div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}><div><div style={{ fontSize:9,fontWeight:600,color:"rgba(232,228,222,0.25)",marginBottom:1 }}>EMAIL</div><div style={{ fontSize:13,color:"rgba(232,228,222,0.6)",wordBreak:"break-all" }}>{c.vayne_email}</div></div><button onClick={(e)=>{e.stopPropagation();navigator.clipboard.writeText(c.vayne_email);showToast("Email copied");}} className="admin-btn" style={{ width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,cursor:"pointer",flexShrink:0 }}><CopyIcon size={11} color="rgba(232,228,222,0.35)"/></button></div><div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}><div><div style={{ fontSize:9,fontWeight:600,color:"rgba(232,228,222,0.25)",marginBottom:1 }}>PASSWORD</div><div style={{ fontSize:13,color:"rgba(232,228,222,0.6)",fontFamily:"monospace" }}>{c.vayne_password}</div></div><button onClick={(e)=>{e.stopPropagation();navigator.clipboard.writeText(c.vayne_password);showToast("Password copied");}} className="admin-btn" style={{ width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,cursor:"pointer",flexShrink:0 }}><CopyIcon size={11} color="rgba(232,228,222,0.35)"/></button></div></div></div>)}{c.anymailfinder_email&&(<div style={{ padding:"12px 14px",background:"rgba(16,185,129,0.04)",borderRadius:8,border:"1px solid rgba(16,185,129,0.12)" }}><div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:"rgba(16,185,129,0.6)",marginBottom:8 }}>ANYMAILFINDER</div><div style={{ display:"flex",flexDirection:"column",gap:6 }}><div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}><div><div style={{ fontSize:9,fontWeight:600,color:"rgba(232,228,222,0.25)",marginBottom:1 }}>EMAIL</div><div style={{ fontSize:13,color:"rgba(232,228,222,0.6)",wordBreak:"break-all" }}>{c.anymailfinder_email}</div></div><button onClick={(e)=>{e.stopPropagation();navigator.clipboard.writeText(c.anymailfinder_email);showToast("Email copied");}} className="admin-btn" style={{ width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,cursor:"pointer",flexShrink:0 }}><CopyIcon size={11} color="rgba(232,228,222,0.35)"/></button></div><div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}><div><div style={{ fontSize:9,fontWeight:600,color:"rgba(232,228,222,0.25)",marginBottom:1 }}>PASSWORD</div><div style={{ fontSize:13,color:"rgba(232,228,222,0.6)",fontFamily:"monospace" }}>{c.anymailfinder_password}</div></div><button onClick={(e)=>{e.stopPropagation();navigator.clipboard.writeText(c.anymailfinder_password);showToast("Password copied");}} className="admin-btn" style={{ width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,cursor:"pointer",flexShrink:0 }}><CopyIcon size={11} color="rgba(232,228,222,0.35)"/></button></div></div></div>)}</div></div>)}{c.elevator_pitch&&(<div style={{ gridColumn:"1/-1",padding:"10px 12px",background:"rgba(255,255,255,0.015)",borderRadius:8,border:"1px solid rgba(255,255,255,0.03)" }}><div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.08em",color:"rgba(200,150,62,0.35)",marginBottom:3 }}>ELEVATOR PITCH</div><div style={{ fontSize:13,color:"rgba(232,228,222,0.55)",lineHeight:1.6 }}>{c.elevator_pitch}</div></div>)}{c.icp&&(<div style={{ gridColumn:"1/-1",padding:"10px 12px",background:"rgba(255,255,255,0.015)",borderRadius:8,border:"1px solid rgba(255,255,255,0.03)" }}><div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.08em",color:"rgba(200,150,62,0.35)",marginBottom:3 }}>ICP</div><div style={{ fontSize:13,color:"rgba(232,228,222,0.55)",lineHeight:1.6 }}>{c.icp}</div></div>)}{c.additional_notes&&(<div style={{ gridColumn:"1/-1",padding:"10px 12px",background:"rgba(255,255,255,0.015)",borderRadius:8,border:"1px solid rgba(255,255,255,0.03)" }}><div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.08em",color:"rgba(200,150,62,0.35)",marginBottom:3 }}>NOTES</div><div style={{ fontSize:13,color:"rgba(232,228,222,0.55)",lineHeight:1.6 }}>{c.additional_notes}</div></div>)}</div></div>)}
                  {isOpen&&c.status!=="completed"&&(<div style={{ padding:"0 18px 18px",borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:16 }}><div style={{ display:"flex",alignItems:"center",gap:10 }}><LinkIcon size={14} color="rgba(232,228,222,0.25)"/><span style={{ fontSize:12,color:"rgba(232,228,222,0.3)",wordBreak:"break-all" }}>{window.location.origin}/onboard/{c.token}</span></div><div style={{ fontSize:12,color:"rgba(232,228,222,0.2)",marginTop:8 }}>{expired?"This link has expired. Click the refresh button to regenerate.":"Expires "+new Date(c.expires_at).toLocaleDateString()}</div></div>)}
                </div>
              );})}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
