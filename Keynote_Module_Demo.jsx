import React, { useEffect, useMemo, useRef, useState } from "react";

/*****************************************
 * MrTechSys Keynote Presentation Module
 * React Clickable MVP — Clean & Secure
 *
 * Notes
 * - No external deps (no uuid, no framer-motion) → fewer build issues
 * - Safe localStorage helpers + ID generator fallback
 * - Clickable Texas logo → routes to https://www.mrtechsys.com
 * - Three views: Speaker Upload, Organizer Dashboard, AV Console
 * - Drag-and-drop Run-of-Show, status badges, simple player
 * - Lightweight Self-Tests panel
 *****************************************/

/*****************************\
|* Brand: Texas + Logo  Pill *|
\*****************************/
const TexasLogo = ({ className = "w-8 h-8" }) => (
  <a href="https://www.mrtechsys.com" aria-label="Go to MrTechSys homepage" target="_blank" rel="noopener noreferrer" className="inline-block">
    <svg viewBox="0 0 600 600" className={className} aria-hidden>
      <defs>
        <linearGradient id="golden" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      {/* Recognizable Texas outline (stylized) */}
      <path
        d="M220 40v100h70l20 50h80v70h60v90h-60v60h-70v80h-90v-60h-70v-80h-50v-90h50v-70h60V40z"
        fill="none"
        stroke="url(#golden)"
        strokeWidth="18"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Star near San Antonio */}
      <g transform="translate(300,380) scale(1.4)">
        <path d="M10 0l3 7h8l-6 5 2 7-7-4-7 4 2-7-6-5h8z" fill="#FFD700" />
      </g>
    </svg>
  </a>
);

const BrandPill = () => (
  <div className="fixed right-4 bottom-4 z-40">
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-neutral-900/70 backdrop-blur px-4 py-2 shadow-lg">
      <TexasLogo className="w-6 h-6" />
      <span className="text-xs font-bold tracking-wider text-white/90">Powered by <span className="text-white">MrTechSys</span></span>
    </div>
  </div>
);

/*********************\
|* Minimal Design Kit *|
\*********************/
const Pill = ({ children, className = "" }) => (
  <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold tracking-wide ${className}`}>{children}</div>
);

const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const base = "rounded-xl px-4 py-2 font-semibold transition active:scale-[.98]";
  const variants = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
    ghost: "bg-transparent hover:bg-neutral-800/40 text-white",
    outline: "border border-white/20 text-white hover:bg-white/10",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-neutral-900/60 backdrop-blur border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
    {subtitle && <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>}
  </div>
);

/******************\
|* Safe Utilities  *|
\******************/
const STORAGE_KEY = "mts-keynote-demo";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function safeGetLocal(key) {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSetLocal(key, val) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, val); } catch { /* noop */ }
}

/******************\
|* Mock Data Layer *|
\******************/
const seedData = {
  event: {
    id: "evt-2025-demo",
    name: "MrTechSys Summit 2025",
    venue: "Riverwalk Convention Center, San Antonio, TX",
    code: "MTS-SUMMIT-25",
    date: "2025-11-03",
  },
  sessions: [
    { id: generateId(), title: "Opening Remarks", speaker: "Eric Zepeda", status: "uploaded", notes: "Welcome + agenda", assets: [{ name: "opening.pdf", type: "pdf" }], duration: 10 },
    { id: generateId(), title: "AI in the Field: Zero-Downtime Ops", speaker: "Clancy (maybe)", status: "missing", notes: "TBD", assets: [], duration: 25 },
    { id: generateId(), title: "Texas-Scale Cloud Modernization", speaker: "Juan (Keynote)", status: "needs-fix", notes: "Embedded video too large", assets: [{ name: "keynote.pptx", type: "pptx" }], duration: 35 },
  ],
  roster: [
    { id: generateId(), name: "Eric Zepeda", email: "eric@mrtechsys.com" },
    { id: generateId(), name: "Juan CEO", email: "juan@org.com" },
    { id: generateId(), name: "Clancy (Twin)", email: "clancy@shadow.gov" },
  ],
};

function loadState() {
  const raw = safeGetLocal(STORAGE_KEY);
  if (!raw) return seedData;
  try { return JSON.parse(raw); } catch { return seedData; }
}
function saveState(state) {
  safeSetLocal(STORAGE_KEY, JSON.stringify(state));
}

/*********************\
|* Utility Components *|
\*********************/
const Badge = ({ status }) => {
  const map = {
    uploaded: { text: "UPLOADED", cls: "bg-emerald-500/20 text-emerald-300" },
    missing: { text: "MISSING", cls: "bg-rose-500/20 text-rose-300" },
    "needs-fix": { text: "NEEDS FIX", cls: "bg-amber-500/20 text-amber-300" },
  }[status] || { text: status, cls: "bg-neutral-700 text-neutral-200" };
  return <Pill className={map.cls}>{map.text}</Pill>;
};

const Empty = ({ title = "Nothing here yet", subtitle = "Add or upload to get started." }) => (
  <Card className="p-10 flex flex-col items-center justify-center text-center">
    <TexasLogo className="w-10 h-10 mb-4" />
    <h4 className="text-lg font-semibold text-white">{title}</h4>
    <p className="text-sm text-neutral-400 mt-1 max-w-md">{subtitle}</p>
  </Card>
);

/****************\
|* Speaker View *|
\****************/
function SpeakerPortal({ state, setState }) {
  const [email, setEmail] = useState("");
  const [appliedTemplate, setAppliedTemplate] = useState(true);
  const [selectedSession, setSelectedSession] = useState("");

  const mySessions = useMemo(() => state.sessions, [state.sessions]);

  function sanitizeName(name){
    return name.replace(/[^a-z0-9._-]/gi, "_").slice(0,200);
  }

  function handleUpload(files) {
    if (!selectedSession) return;
    const f = Array.from(files).map(f => ({ name: sanitizeName(f.name), type: f.name.split(".").pop() }));
    const next = { ...state };
    const idx = next.sessions.findIndex(s => s.id === selectedSession);
    if (idx >= 0) {
      next.sessions[idx].assets = [...(next.sessions[idx].assets||[]), ...f];
      next.sessions[idx].status = "uploaded";
      if (appliedTemplate) next.sessions[idx].notes = (next.sessions[idx].notes || "") + " | Applied MrTechSys Template";
      saveState(next);
      setState(next);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <SectionTitle title="Upload your presentation" subtitle="Drag & drop your deck, videos, or PDFs. Your A/V team will see it instantly." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className="text-sm text-neutral-300">Your email (for receipts)</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" className="mt-1 w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-sm text-neutral-300">Session</label>
              <select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white">
                <option value="">Select your session</option>
                {mySessions.map(s=> (
                  <option key={s.id} value={s.id}>{s.title} — {s.speaker}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <input id="tmpl" checked={appliedTemplate} onChange={()=>setAppliedTemplate(v=>!v)} type="checkbox" className="accent-emerald-500"/>
            <label htmlFor="tmpl" className="text-sm text-neutral-300">Apply MrTechSys keynote template automatically</label>
          </div>

          <DropZone onFiles={handleUpload} disabled={!selectedSession} />

          <div className="mt-6 flex items-center gap-3">
            <Badge status={selectedSession ? "uploaded" : "missing"} />
            <span className="text-sm text-neutral-400">You’ll get an email receipt with a QR backup link.</span>
          </div>
        </Card>
      </div>
      <div>
        <Card className="p-6">
          <SectionTitle title="Tips" subtitle="Make event day smooth." />
          <ul className="space-y-3 text-sm text-neutral-300">
            <li>• Prefer <span className="font-semibold">PDF</span> exports for bulletproof rendering.</li>
            <li>• Keep videos under <span className="font-semibold">200MB</span>; use MP4/H.264.</li>
            <li>• Fonts: convert text to outlines in critical title slides.</li>
            <li>• Test your deck with the built-in preview once uploaded.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function DropZone({ onFiles, disabled }) {
  const [active, setActive] = useState(false);
  const inputRef = useRef(null);
  return (
    <div
      onDragOver={(e)=>{e.preventDefault(); if(!disabled) setActive(true);}}
      onDragLeave={()=>setActive(false)}
      onDrop={(e)=>{e.preventDefault(); setActive(false); if(disabled) return; onFiles(e.dataTransfer.files);}}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${active?"border-emerald-400 bg-emerald-400/10":"border-white/15 bg-neutral-950/40"} ${disabled?"opacity-50 cursor-not-allowed":"cursor-pointer"}`}
      onClick={()=>!disabled && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e)=>onFiles(e.target.files)} />
      <TexasLogo className="w-12 h-12 mb-3" />
      <p className="text-white font-semibold">Drag & drop files here</p>
      <p className="text-neutral-400 text-sm">or click to browse</p>
    </div>
  );
}

/******************\
|* Organizer View *|
\******************/
function OrganizerDashboard({ state, setState }) {
  const [query, setQuery] = useState("");
  const sessions = useMemo(() => state.sessions.filter(s=> [s.title, s.speaker].join(" ").toLowerCase().includes(query.toLowerCase())), [state.sessions, query]);

  function onDragStart(e, id){ e.dataTransfer.setData("text/plain", id); }
  function onDrop(e, targetId){
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;
    const next = { ...state };
    const arr = [...next.sessions];
    const sIdx = arr.findIndex(s=>s.id===sourceId);
    const tIdx = arr.findIndex(s=>s.id===targetId);
    if (sIdx<0 || tIdx<0) return;
    const [moved] = arr.splice(sIdx,1);
    arr.splice(tIdx,0,moved);
    next.sessions = arr;
    saveState(next); setState(next);
  }

  const statusCounts = useMemo(()=> ({
    uploaded: state.sessions.filter(s=>s.status==="uploaded").length,
    missing: state.sessions.filter(s=>s.status==="missing").length,
    needsFix: state.sessions.filter(s=>s.status==="needs-fix").length,
  }),[state.sessions]);

  function markNeedsFix(id){ const next={...state}; const i=next.sessions.findIndex(s=>s.id===id); if(i>-1){ next.sessions[i].status="needs-fix"; saveState(next); setState(next);} }
  function markUploaded(id){ const next={...state}; const i=next.sessions.findIndex(s=>s.id===id); if(i>-1){ next.sessions[i].status="uploaded"; saveState(next); setState(next);} }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <SectionTitle title="Run of Show" subtitle="Drag to reorder. Status indicators update in real-time as speakers upload." />
          <div className="mb-4 flex items-center gap-3">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search sessions or speakers…" className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500" />
            <Button variant="outline" onClick={()=>{ saveState(seedData); window.location.reload(); }}>Reset</Button>
          </div>
          {sessions.length===0 ? <Empty title="No sessions match" subtitle="Try another query or reset."/> : (
            <ul className="space-y-3">
              {sessions.map(s=> (
                <li key={s.id}
                    draggable
                    onDragStart={(e)=>onDragStart(e,s.id)}
                    onDragOver={(e)=>e.preventDefault()}
                    onDrop={(e)=>onDrop(e,s.id)}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h4 className="truncate text-white font-semibold">{s.title}</h4>
                        <p className="text-sm text-neutral-400 truncate">{s.speaker} • {s.duration} min</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge status={s.status} />
                        <Button variant="ghost" onClick={()=>markNeedsFix(s.id)}>Flag</Button>
                        <Button variant="ghost" onClick={()=>markUploaded(s.id)}>Mark Uploaded</Button>
                      </div>
                    </div>
                    {s.assets?.length>0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {s.assets.map((a, i)=> (
                          <Pill key={i} className="bg-white/5 text-neutral-200">{a.name}</Pill>
                        ))}
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="p-6">
          <SectionTitle title="Event Health" subtitle="Automatic checks as files arrive." />
          <div className="grid grid-cols-3 gap-3 text-center">
            <Card className="p-4">
              <div className="text-3xl font-black text-emerald-400">{statusCounts.uploaded}</div>
              <div className="text-xs text-neutral-400 mt-1">Uploaded</div>
            </Card>
            <Card className="p-4">
              <div className="text-3xl font-black text-amber-400">{statusCounts.needsFix}</div>
              <div className="text-xs text-neutral-400 mt-1">Needs Fix</div>
            </Card>
            <Card className="p-4">
              <div className="text-3xl font-black text-rose-400">{statusCounts.missing}</div>
              <div className="text-xs text-neutral-400 mt-1">Missing</div>
            </Card>
          </div>
        </Card>
        <SelfTestPanel />
      </div>
    </div>
  );
}

/***************\
|* AV Console  *|
\***************/
function AVConsole({ state }) {
  const [activeId, setActiveId] = useState(null);
  const active = useMemo(()=> state.sessions.find(s=>s.id===activeId) || null, [state.sessions, activeId]);
  const [isFull, setIsFull] = useState(false);
  const playerRef = useRef(null);

  async function toggleFull(){
    const el = playerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFull(true);
      } else {
        await document.exitFullscreen();
        setIsFull(false);
      }
    } catch {}
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle title="Presentation Player" subtitle="Optimized for ballroom booths. Use Fullscreen." />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={toggleFull}>{isFull?"Exit Fullscreen":"Enter Fullscreen"}</Button>
            </div>
          </div>
          <div ref={playerRef} className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
            {!active && (
              <div className="absolute inset-0 grid place-items-center">
                <Empty title="Select a session to play" subtitle="Your selected deck appears here for projection." />
              </div>
            )}
            {active && <FakeSlides session={active} />}
          </div>
        </Card>
      </div>
      <div>
        <Card className="p-4">
          <SectionTitle title="Agenda (Tap to Play)" />
          <div className="space-y-2 xl:max-h-[70vh] overflow-auto pr-2">
            {state.sessions.map(s=> (
              <button key={s.id} onClick={()=>setActiveId(s.id)}
                className={`w-full text-left rounded-xl border px-3 py-3 transition ${activeId===s.id?"border-emerald-500 bg-emerald-500/10":"border-white/10 hover:bg-white/5"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-white font-semibold">{s.title}</div>
                    <div className="text-xs text-neutral-400 truncate">{s.speaker}</div>
                  </div>
                  <Badge status={s.status} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function FakeSlides({ session }){
  const slides = useMemo(()=> makeSlidesForSession(session), [session]);
  const [idx, setIdx] = useState(0);
  function prev(){ setIdx(i=> Math.max(0, i-1)); }
  function next(){ setIdx(i=> Math.min(slides.length-1, i+1)); }

  useEffect(()=>{
    function onKey(e){ if(e.key==="ArrowRight") next(); if(e.key==="ArrowLeft") prev(); }
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  },[slides.length]);

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 grid place-items-center transition-opacity duration-200">
        <div className="w-[92%] h-[88%] rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-950 to-neutral-900 p-10 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              {slides[idx].title}
            </h2>
            <TexasLogo className="w-10 h-10" />
          </div>
          <p className="mt-6 text-neutral-300 text-lg leading-relaxed max-w-4xl">{slides[idx].body}</p>
          <div className="mt-auto flex items-center justify-between">
            <div className="text-neutral-400 text-sm">{session.title} • {session.speaker}</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={prev}>&larr; Prev</Button>
              <Pill className="bg-white/10 text-white">{idx+1} / {slides.length}</Pill>
              <Button variant="ghost" onClick={next}>Next &rarr;</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function makeSlidesForSession(session){
  const copy = [
    {
      title: "MrTechSys Keynote",
      body: "Texas-rooted cloud simplicity. Ditch USB chaos. Upload in advance, auto-check compatibility, and play from a secure AV console.",
    },
    {
      title: "Speaker Upload Portal",
      body: "Speakers drag & drop decks (PPTX/PDF/MP4). Optional auto-apply of the MrTechSys template harmonizes branding across the event.",
    },
    {
      title: "Organizer Run-of-Show",
      body: "Live status for every session: Uploaded, Needs Fix, Missing. Drag to reorder. Preview assets and trigger auto-transcode for large videos.",
    },
    {
      title: "Ballroom-Ready Playback",
      body: "Full-screen player with offline cache. AV techs tap a session and go. Notes sync to a presenter phone or tablet.",
    },
    {
      title: "{sessionTitle}",
      body: `Featuring: ${session.speaker}. Assets: ${session.assets?.map(a=>a.name).join(", ") || "(pending)"}. Notes: ${session.notes || "(none)"}.`,
    },
  ];
  copy[4].title = session.title.length>36? session.title.slice(0,33)+"…": session.title;
  return copy;
}

/*******************\
|* Self-Test Panel  *|
\*******************/
function runSelfTests(){
  const results = [];
  // Test 1: generateId uniqueness & format
  const ids = new Set();
  let ok = true;
  for (let i=0;i<100;i++){ const id=generateId(); if(ids.has(id)) ok=false; ids.add(id); }
  results.push({name: "generateId uniqueness (100)", pass: ok});

  // Test 2: slides shape
  const s = { title: "Test Session", speaker: "Tester", assets: [{name:"a.pdf"}], notes: "n" };
  const slides = makeSlidesForSession(s);
  results.push({name: "makeSlidesForSession count", pass: Array.isArray(slides) && slides.length===5});
  results.push({name: "slide 5 includes session data", pass: /Tester/.test(slides[4].body)});

  // Test 3: localStorage round-trip (best-effort)
  const key = "_selftest_";
  let roundTrip = true;
  try { safeSetLocal(key, JSON.stringify({x:1})); roundTrip = safeGetLocal(key) !== null; } catch { roundTrip = false; }
  results.push({name: "localStorage available", pass: roundTrip});

  return results;
}

function SelfTestPanel(){
  const [open, setOpen] = useState(false);
  const results = useMemo(()=> runSelfTests(), []);
  const passed = results.filter(r=>r.pass).length;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <SectionTitle title="Self-Tests" subtitle="Lightweight checks to catch obvious issues in demos." />
        <Button variant="outline" onClick={()=>setOpen(o=>!o)}>{open?"Hide":"Show"}</Button>
      </div>
      <div className="text-sm text-neutral-300 mb-2">Passed {passed}/{results.length} checks.</div>
      {open && (
        <ul className="space-y-2 text-sm">
          {results.map((r,i)=> (
            <li key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 ${r.pass?"bg-emerald-500/10 text-emerald-300":"bg-rose-500/10 text-rose-300"}`}>
              <span>{r.name}</span>
              <span className="font-semibold">{r.pass?"PASS":"FAIL"}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/***************\
|* App Chrome  *|
\***************/
const Tab = ({ id, active, setActive, icon, label }) => (
  <button onClick={()=>setActive(id)} className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${active===id?"bg-white/10 text-white":"text-neutral-300 hover:bg-white/5"}`}>
    <span className="opacity-80">{icon}</span>
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

function Header({ active, setActive, event }){
  return (
    <div className="sticky top-0 z-30 backdrop-blur bg-neutral-950/70 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TexasLogo className="w-8 h-8" />
          <div>
            <div className="text-white font-black tracking-tight leading-none">MrTechSys Keynote</div>
            <div className="text-[11px] text-neutral-400">{event.name} • {event.venue}</div>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Tab id="speaker" active={active} setActive={setActive} label="Speaker Upload" icon={"🎤"} />
          <Tab id="organizer" active={active} setActive={setActive} label="Organizer" icon={"🗂️"} />
          <Tab id="av" active={active} setActive={setActive} label="AV Console" icon={"🎛️"} />
        </nav>
      </div>
    </div>
  );
}

function Hero(){
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none" aria-hidden>
        {/* Soft circuitry background via SVG paths */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="c" x1="0" x2="1"><stop offset="0%" stopColor="#00f5d4" /><stop offset="100%" stopColor="#ffd166" /></linearGradient>
          </defs>
          {[...Array(16)].map((_,i)=> (
            <path key={i} d={`M${20+i*60},0 v${200+Math.random()*200} q10,10 20,0 v${200+Math.random()*200}`} stroke="url(#c)" strokeOpacity=".3" strokeWidth="1" fill="none"/>
          ))}
        </svg>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Presenters! Ditch the USB scramble.</h1>
            <p className="mt-3 text-neutral-300 max-w-2xl">Cloud-first keynote management for hotels, conference centers, and AV teams. Speakers upload. Organizers orchestrate. AV presses play.</p>
            <div className="mt-5 flex items-center gap-3">
              <Pill className="bg-emerald-500/15 text-emerald-300">Offline-ready PWA</Pill>
              <Pill className="bg-white/10 text-white">Auto checks & transcode</Pill>
              <Pill className="bg-white/10 text-white">QR backups</Pill>
            </div>
          </div>
          <div className="hidden md:block">
            <Card className="p-4">
              <div className="text-sm text-neutral-300">Event Code</div>
              <div className="text-2xl font-black text-white tracking-widest">MTS-SUMMIT-25</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [state, setState] = useState(seedData);
  const [active, setActive] = useState("speaker");

  useEffect(()=>{
    const s = loadState();
    setState(s);
  },[]);

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      <Header active={active} setActive={setActive} event={state.event} />
      <Hero />

      <main className="mx-auto max-w-7xl px-4 pb-28 space-y-8">
        {active==="speaker" && <SpeakerPortal state={state} setState={setState} />}
        {active==="organizer" && <OrganizerDashboard state={state} setState={setState} />}
        {active==="av" && <AVConsole state={state} />}
      </main>

      <BrandPill />

      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-7xl px-4 text-xs text-neutral-400 flex items-center justify-between">
          <div>© {new Date().getFullYear()} MrTechSys — Keynote Presentation Module (Demo)</div>
          <div className="opacity-80">React • Tailwind • No external libs</div>
        </div>
      </footer>
    </div>
  );
}
