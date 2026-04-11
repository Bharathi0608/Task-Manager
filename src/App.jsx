import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Trash2, Check, Search, Tag, Calendar,
  AlertCircle, X, ChevronDown, Trophy,
  CheckCircle2, Moon, Sun, Target, Rocket,
  Play, Pause, Award, Activity, Gem, Command as CmdIcon, Settings,
  Sparkles, List, Columns, Terminal, Cpu, Star,
  GripVertical, Edit3, Keyboard, HelpCircle, Zap
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence, Reorder, useScroll, useTransform, useSpring } from 'framer-motion';
import confetti from 'canvas-confetti';
import './App.css';

// ── Sound Engine ──────────────────────────────────────────────────────────────
const playBeep = (freq = 440, type = 'sine', duration = 0.1) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

// ── Config ────────────────────────────────────────────────────────────────────
const SECTORS = [
  { name: 'Core',       color: '#6366f1', icon: Activity },
  { name: 'Personal',   color: '#a855f7', icon: Gem },
  { name: 'Tactical',   color: '#ef4444', icon: Target },
  { name: 'Commercial', color: '#10b981', icon: Award },
  { name: 'Logistics',  color: '#94a3b8', icon: Settings },
];
const PRIORITIES = [
  { name: 'Standard',  color: '#3b82f6', level: 1 },
  { name: 'Escalated', color: '#f59e0b', level: 2 },
  { name: 'Critical',  color: '#ef4444', level: 3 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
};
const getDaysLeft = (deadline) => {
  if (!deadline) return null;
  const d = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (d < 0)  return 'Overdue';
  if (d === 0) return 'Due today';
  return `${d}d left`;
};
const deadlineColor = (deadline) => {
  if (!deadline) return 'var(--text-muted)';
  const d = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (d < 0)  return '#ef4444';
  if (d <= 2) return '#f59e0b';
  return '#10b981';
};

// ── EliteSelect ───────────────────────────────────────────────────────────────
const EliteSelect = ({ label, options, value, onChange, icon: Icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="elite-select-root" ref={ref}>
      <label className="elite-label">{label}</label>
      <motion.div className={`elite-trigger ${open ? 'active' : ''}`}
        onClick={() => { setOpen(!open); playBeep(400,'sine',0.05); }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {Icon && <Icon size={14} className="elite-trigger-icon" />}
          <span>{value}</span>
        </div>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)':'none', transition:'0.3s' }} />
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div className="elite-options-box"
            initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:4, scale:1 }}
            exit={{ opacity:0, y:-8, scale:0.95 }}>
            {options.map(o => (
              <motion.div key={o.name}
                className={`elite-option ${value === o.name ? 'selected' : ''}`}
                onClick={() => { onChange(o.name); setOpen(false); playBeep(600,'sine',0.05); }}
                whileHover={{ x: 5, background: 'var(--primary-light)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: o.color||'var(--primary)', flexShrink:0 }} />
                {o.name}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Initialization ────────────────────────────────────────────────────────────
const Initialization = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('BOOTING_SEQUENCER');
  useEffect(() => {
    const steps = [
      { p:20, s:'LOADING_INTERFACE',   d:500 },
      { p:45, s:'CALIBRATING_FEEDS',   d:800 },
      { p:75, s:'SYNCING_TASK_DATA',   d:600 },
      { p:100,s:'SYSTEM_READY',        d:400 },
    ];
    (async () => {
      for (const step of steps) {
        await new Promise(r => setTimeout(r, step.d));
        setProgress(step.p); setStatus(step.s);
      }
      setTimeout(onComplete, 800);
    })();
  }, [onComplete]);
  return (
    <motion.div className="landing-root" exit={{ opacity:0, scale:1.1 }} transition={{ duration:0.8 }}>
      <div className="landing-content">
        <motion.div animate={{ rotate:360 }} transition={{ duration:10, repeat:Infinity, ease:'linear' }} className="landing-logo-ring">
          <Rocket size={60} color="#6366f1" />
        </motion.div>
        <div className="landing-text">
          <h2>INITIALIZING<span>_TASK MANAGER</span></h2>
          <div className="progress-bar">
            <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${progress}%` }} />
          </div>
          <p className="status-text">{status} {progress}%</p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Custom Cursor ─────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const x = useSpring(0, { damping:20, stiffness:200 });
  const y = useSpring(0, { damping:20, stiffness:200 });
  useEffect(() => {
    const h = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return <motion.div className="custom-cursor" style={{ x, y }}><div className="cursor-dot" /></motion.div>;
};

// ── Command Palette ───────────────────────────────────────────────────────────
const CommandPalette = ({ isOpen, onClose, actions }) => {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const filtered = actions.filter(a => a.label.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => { if (isOpen) { setQ(''); setIdx(0); } }, [isOpen]);
  const handleKey = (e) => {
    if (e.key === 'ArrowDown') setIdx(p => (p+1) % filtered.length);
    if (e.key === 'ArrowUp')   setIdx(p => (p-1+filtered.length) % filtered.length);
    if (e.key === 'Enter' && filtered[idx]) { filtered[idx].onSelect(); onClose(); }
    if (e.key === 'Escape') onClose();
  };
  if (!isOpen) return null;
  return (
    <motion.div className="focus-overlay" style={{ background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}>
      <motion.div className="cmd-card" initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} onClick={e => e.stopPropagation()}>
        <div className="cmd-input-header">
          <CmdIcon size={22} color="var(--primary)" />
          <input autoFocus placeholder="Type a command…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={handleKey} />
        </div>
        <div className="cmd-results">
          {filtered.map((a, i) => (
            <div key={a.label} className={`cmd-result-item ${idx===i?'on':''}`}
              onClick={() => { a.onSelect(); onClose(); }} onMouseEnter={() => setIdx(i)}>
              <a.icon size={17} />
              <span>{a.label}</span>
              <span className="hint">{a.hint}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── SubTaskRow ────────────────────────────────────────────────────────────────
const SubTaskRow = ({ node, onToggle, onDelete }) => (
  <motion.div className="subtask-row" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }} layout>
    <div className={`subtask-check ${node.done ? 'done' : ''}`} onClick={onToggle}>
      {node.done && <Check size={9} />}
    </div>
    <span className={`subtask-text ${node.done ? 'done' : ''}`}>{node.text}</span>
    <button className="subtask-del" onClick={onDelete}><X size={11} /></button>
  </motion.div>
);

// ── App Main ──────────────────────────────────────────────────────────────────
function App() {
  const [tasks,       setTasks]       = useState(() => JSON.parse(localStorage.getItem('tasks_global_v12') || '[]'));
  const [initializing,setInitializing]= useState(true);
  const [dark,        setDark]        = useState(() => JSON.parse(localStorage.getItem('dark_mode') ?? 'true'));
  const [view,        setView]        = useState('list');
  const [input,       setInput]       = useState('');
  const [query,       setQuery]       = useState('');
  const [filter,      setFilter]      = useState('all');
  const [focus,       setFocus]       = useState(null);
  const [notif,       setNotif]       = useState(null);
  const [isCmd,       setIsCmd]       = useState(false);
  const [showLogs,    setShowLogs]    = useState(false);
  const [logs,        setLogs]        = useState([{ time: new Date().toLocaleTimeString(), msg:'CONNECTION SECURE', type:'info' }]);
  const [muted,       setMuted]       = useState(false);
  const [adv,         setAdv]         = useState(false);
  // Interactive extras
  const [expandedId,  setExpandedId]  = useState(null);
  const [editingId,   setEditingId]   = useState(null);
  const [editValue,   setEditValue]   = useState('');
  const [subInput,    setSubInput]    = useState({});
  const [searchFocus,   setSearchFocus]   = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  // Form
  const [sector,   setSector]   = useState(SECTORS[0].name);
  const [priority, setPriority] = useState(PRIORITIES[0].name);
  const [deadline, setDeadline] = useState('');

  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);

  const addLog = (msg, type = 'info') =>
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 20));

  const sfx = (f, t, d) => { if (!muted) playBeep(f, t, d); };

  const fTasks = useMemo(() =>
    tasks.filter(t => {
      const ms = t.title.toLowerCase().includes(query.toLowerCase());
      const mf = filter === 'all' || (filter === 'active' && t.status === 'active') || (filter === 'completed' && t.status === 'completed');
      return ms && mf;
    }).sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0) || b.created - a.created),
  [tasks, query, filter]);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overallPct     = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Persist
  useEffect(() => { localStorage.setItem('tasks_global_v12', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('dark_mode', JSON.stringify(dark)); }, [dark]);

  // Global timer + keyboard shortcut
  useEffect(() => {
    const timer = setInterval(() =>
      setTasks(prev => prev.map(t => t.ticking && t.status === 'active' ? { ...t, elapsed:(t.elapsed||0)+1 } : t)), 1000);
    const kb = (e) => { if (e.key==='k' && (e.metaKey||e.ctrlKey)) { e.preventDefault(); setIsCmd(p=>!p); } };
    window.addEventListener('keydown', kb);
    return () => { clearInterval(timer); window.removeEventListener('keydown', kb); };
  }, []);

  // Particle canvas
  useEffect(() => {
    const canv = canvasRef.current;
    if (!canv || initializing) return;
    const ctx = canv.getContext('2d');
    let pts = [], animId;
    const init = () => {
      canv.width = window.innerWidth; canv.height = window.innerHeight;
      pts = Array.from({ length:50 }, () => ({
        x: Math.random()*canv.width, y: Math.random()*canv.height,
        vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4, s:Math.random()*2,
      }));
    };
    init();
    window.addEventListener('resize', init);
    const draw = () => {
      ctx.clearRect(0,0,canv.width,canv.height);
      ctx.fillStyle = 'rgba(99,102,241,0.22)';
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>canv.width)  p.vx*=-1;
        if(p.y<0||p.y>canv.height) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', init); cancelAnimationFrame(animId); };
  }, [dark, initializing]);

  if (initializing) return (
    <AnimatePresence>
      <Initialization onComplete={() => { setInitializing(false); sfx(600,'sine',0.2); addLog('BOOT SUCCESSFUL'); }} />
    </AnimatePresence>
  );

  // ── Task Operations ──────────────────────────────────────────────────────────
  const handleAdd = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const nt = { id:uuidv4(), title:input.trim(), status:'active', created:Date.now(),
      elapsed:0, ticking:false, pinned:false, sector, priority, deadline, nodes:[] };
    setTasks([nt, ...tasks]); setInput(''); setAdv(false);
    sfx(1000,'sine',0.1); addLog(`INITIATED: ${nt.title.slice(0,20)}`, 'success');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const done = t.status === 'active';
      if (done) {
        confetti({ particleCount:160, spread:80, origin:{ y:0.6 } });
        sfx(1500,'square',0.2);
        setNotif('Mission Secured! 🎯'); setTimeout(() => setNotif(null), 3000);
        addLog('OBJECTIVE_SUCCESS', 'success');
      }
      return { ...t, status: done?'completed':'active', ticking:false };
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (expandedId === id) setExpandedId(null);
    sfx(300,'sawtooth',0.1); addLog('TASK_REMOVED', 'warn');
  };

  const togglePin   = (id) => { setTasks(tasks.map(t => t.id===id ? {...t, pinned:!t.pinned} : t)); sfx(800,'sine',0.05); };
  const toggleTimer = (id) => { setTasks(tasks.map(t => t.id===id ? {...t, ticking:!t.ticking} : t)); sfx(600,'sine',0.05); };

  const startEdit = (t) => { setEditingId(t.id); setEditValue(t.title); };
  const saveEdit  = (id) => {
    if (editValue.trim()) { setTasks(tasks.map(t => t.id===id ? {...t, title:editValue.trim()} : t)); addLog('TASK_UPDATED'); }
    setEditingId(null);
  };

  const addSubTask = (taskId) => {
    const text = (subInput[taskId]||'').trim();
    if (!text) return;
    setTasks(tasks.map(t => t.id===taskId ? {...t, nodes:[...(t.nodes||[]), { id:uuidv4(), text, done:false }]} : t));
    setSubInput(p => ({...p, [taskId]:''}));
    sfx(800,'sine',0.05); addLog('SUBTASK_ADDED');
  };
  const toggleSubTask = (tid, nid) =>
    setTasks(tasks.map(t => t.id===tid ? {...t, nodes:(t.nodes||[]).map(n => n.id===nid ? {...n, done:!n.done} : n)} : t));
  const deleteSubTask = (tid, nid) =>
    setTasks(tasks.map(t => t.id===tid ? {...t, nodes:(t.nodes||[]).filter(n => n.id!==nid)} : t));

  const cmdActions = [
    { label:'Switch to List',       icon:List,         hint:'L', onSelect:() => setView('list') },
    { label:'Switch to Kanban',     icon:Columns,      hint:'K', onSelect:() => setView('kanban') },
    { label:'Toggle System Logs',   icon:Terminal,     hint:'T', onSelect:() => setShowLogs(p=>!p) },
    { label:'Toggle Theme',         icon:Moon,         hint:'D', onSelect:() => setDark(p=>!p) },
    { label:'Clear Completed',      icon:CheckCircle2, hint:'C', onSelect:() => setTasks(tasks.filter(t=>t.status!=='completed')) },
    { label:'Toggle Sounds',        icon:Activity,     hint:'M', onSelect:() => setMuted(p=>!p) },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`app-root ${dark ? 'dark-theme' : ''}`}>
      <CustomCursor />
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:-1, pointerEvents:'none' }} />
      <div className="bg-mesh" />

      <AnimatePresence>
        {isCmd && <CommandPalette isOpen={isCmd} onClose={() => setIsCmd(false)} actions={cmdActions} />}
      </AnimatePresence>

      <div className="site-wrapper">

        {/* ── Header ── */}
        <header className="site-header">
          <div className="brand">
            <Sparkles size={30} color="var(--primary)" />
            <span>TASK</span> MANAGER
          </div>
          <div className="nav-actions">
            {/* Progress ring */}
            <div className="hp-ring" title={`${overallPct}% complete`}>
              <svg viewBox="0 0 36 36" width="42" height="42">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--primary)" strokeWidth="3"
                  strokeDasharray={`${overallPct * 0.88} 88`} strokeLinecap="round"
                  transform="rotate(-90 18 18)" style={{ transition:'stroke-dasharray 0.5s ease' }}/>
              </svg>
              <span className="hp-pct">{overallPct}%</span>
            </div>

            {/* List mode */}
            <motion.button
              className={`nav-btn ${view==='list' ? 'mode-active' : ''}`}
              onClick={() => { setView('list'); sfx(500,'sine',0.05); }}
              title="List View"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <List size={19}/>
              {view==='list' && <motion.span className="mode-dot" layoutId="modeDot" />}
            </motion.button>

            {/* Kanban mode */}
            <motion.button
              className={`nav-btn ${view==='kanban' ? 'mode-active' : ''}`}
              onClick={() => { setView('kanban'); sfx(500,'sine',0.05); }}
              title="Kanban View"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <Columns size={19}/>
              {view==='kanban' && <motion.span className="mode-dot" layoutId="modeDot" />}
            </motion.button>

            {/* Terminal / Logs mode */}
            <motion.button
              className={`nav-btn ${showLogs ? 'mode-active logs-active' : ''}`}
              onClick={() => setShowLogs(p => !p)}
              title={showLogs ? 'Hide System Logs' : 'Show System Logs'}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <Terminal size={19}/>
            </motion.button>

            {/* Command Palette */}
            <motion.button
              className={`nav-btn ${isCmd ? 'mode-active' : ''}`}
              onClick={() => setIsCmd(p => !p)}
              title="Command Palette (Ctrl+K)"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <CmdIcon size={19}/>
            </motion.button>

            {/* Theme toggle */}
            <motion.button
              className="theme-toggle"
              onClick={() => setDark(p => !p)}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {dark
                  ? <motion.span key="sun"  initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:0.2 }}>
                      <Sun size={19}/>
                    </motion.span>
                  : <motion.span key="moon" initial={{ rotate:90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-90, opacity:0 }} transition={{ duration:0.2 }}>
                      <Moon size={19}/>
                    </motion.span>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </header>

        {/* ── Hero ── */}
        <motion.section className="hero" style={{ opacity: heroOpacity }}>
          <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}>
            Streamline your <span>flow.</span>
          </motion.h1>
          <p>Elite objective management for technical minds.</p>

          <div className="task-section">
            <form onSubmit={handleAdd} className="task-input-group">
              <input placeholder="Deploy a new mission…" value={input}
                onFocus={() => setAdv(true)} onChange={e => setInput(e.target.value)} />
              <motion.button type="submit" className="btn-add" whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
                <Plus size={16}/> DEPLOY
              </motion.button>
            </form>
            <AnimatePresence>
              {adv && (
                <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
                  <div className="elite-inputs-strip">
                    <EliteSelect label="Sector"   icon={Tag}          options={SECTORS}    value={sector}   onChange={setSector} />
                    <EliteSelect label="Priority" icon={AlertCircle}  options={PRIORITIES} value={priority} onChange={setPriority} />
                    <div className="elite-select-root">
                      <label className="elite-label">Deadline</label>
                      <div className="elite-trigger">
                        <Calendar size={14} className="elite-trigger-icon" />
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                          style={{ background:'transparent', border:'none', color:'inherit', fontSize:'0.85rem', outline:'none', cursor:'pointer' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── Stats ── */}
        <section className="stats-strip">
          {[
            { v: tasks.length,              l:'Total Tasks',  i:Cpu },
            { v: tasks.filter(t=>t.status==='active').length,    l:'In Progress',   i:Target },
            { v: completedCount,            l:'Completed',    i:CheckCircle2 },
            { v: `${overallPct}%`,          l:'Progress',     i:Award },
          ].map((s, i) => (
            <motion.div key={s.l} className="stat-item"
              initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}>
              <h3>{s.v}</h3>
              <p>{s.l}</p>
            </motion.div>
          ))}
        </section>

        {/* ── Search + Filter ── */}
        <div className="search-filter-bar">
          <div className={`search-box ${searchFocus ? 'focused' : ''}`}>
            <Search size={15} />
            <input placeholder="Search missions…" value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)} />
            {query && <button onClick={() => setQuery('')}><X size={13}/></button>}
          </div>
          <div className="filter-tabs">
            {[
              { key:'all',       label:'All',       count: tasks.length },
              { key:'active',    label:'Active',    count: tasks.filter(t=>t.status==='active').length },
              { key:'completed', label:'Done',      count: completedCount },
            ].map(f => (
              <button key={f.key} className={`filter-tab ${filter===f.key?'active':''}`}
                onClick={() => { setFilter(f.key); sfx(500,'sine',0.04); }}>
                {filter===f.key && <motion.span className="filter-tab-bg" layoutId="filterBg" />}
                <span className="filter-tab-label">{f.label}</span>
                <span className={`filter-tab-count ${filter===f.key?'active-count':''}`}>{f.count}</span>
              </button>
            ))}
          </div>

          {/* Keyboard shortcuts hint */}
          <motion.button
            className="shortcuts-btn"
            title="Keyboard Shortcuts"
            onClick={() => setShowShortcuts(p=>!p)}
            whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
          >
            <Keyboard size={15}/>
          </motion.button>
        </div>

        {/* ── List View ── */}
        {view === 'list' ? (
          <section className="task-section">
          <div className="col-title">
            <span>
              {filter === 'all' ? 'ALL OPERATIONS' : filter === 'active' ? 'ACTIVE OPERATIONS' : 'COMPLETED MISSIONS'}
            </span>
            <span>{fTasks.length} task{fTasks.length!==1?'s':''}{query?` · "${query}"`:''}</span>
          </div>

            <Reorder.Group axis="y" values={fTasks} onReorder={setTasks} className="task-list">
              <AnimatePresence mode="popLayout">
                {fTasks.length === 0 && (
                  <motion.div className="empty-state" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                    <Sparkles size={44} color="var(--primary)" style={{ opacity:0.4, marginBottom:'0.75rem' }}/>
                    <p>No missions found. Deploy your first objective!</p>
                  </motion.div>
                )}

                {fTasks.map(t => {
                  const subDone  = (t.nodes||[]).filter(n=>n.done).length;
                  const subTotal = (t.nodes||[]).length;
                  const subPct   = subTotal > 0 ? (subDone/subTotal)*100 : 0;
                  const isExp    = expandedId === t.id;
                  const isEdit   = editingId  === t.id;
                  const pColor   = PRIORITIES.find(p=>p.name===t.priority)?.color || 'var(--primary)';
                  const sColor   = SECTORS.find(s=>s.name===t.sector)?.color    || 'var(--primary)';

                  return (
                    <Reorder.Item key={t.id} value={t}
                      initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, scale:0.9 }}
                      className="task-card">
                      {/* Priority accent bar */}
                      <div className="priority-bar" style={{ background: pColor }} />

                      {/* Main row */}
                      <div className="task-row-main">
                        <div className="drag-handle"><GripVertical size={14}/></div>

                        <motion.div className={`check-mark ${t.status==='completed'?'done':''}`}
                          onClick={() => toggleTask(t.id)}
                          whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}>
                          {t.status==='completed' && <Check size={13}/>}
                        </motion.div>

                        <div className="task-content">
                          {isEdit ? (
                            <input className="inline-edit-input" value={editValue} autoFocus
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(t.id)}
                              onKeyDown={e => { if(e.key==='Enter') saveEdit(t.id); if(e.key==='Escape') setEditingId(null); }} />
                          ) : (
                            <div className={`task-title ${t.status==='completed'?'done':''}`}
                              onDoubleClick={() => startEdit(t)} title="Double-click to edit">
                              {t.pinned && <Star size={11} fill="var(--warning)" color="var(--warning)" style={{ marginRight:5, flexShrink:0 }}/>}
                              {t.title}
                            </div>
                          )}
                          <div className="task-meta">
                            <span style={{ color:sColor, fontWeight:700 }}>{t.sector}</span>
                            <span className="meta-pill" style={{ borderColor:pColor, color:pColor }}>{t.priority}</span>
                            {t.deadline && (
                              <span className="deadline-badge" style={{ color: deadlineColor(t.deadline) }}>
                                <Calendar size={9}/> {getDaysLeft(t.deadline)}
                              </span>
                            )}
                            {t.ticking && (
                              <motion.span className="timer-badge-live" animate={{ opacity:[1,0.5,1] }} transition={{ duration:1.2, repeat:Infinity }}>
                                ⏱ {formatTime(t.elapsed||0)}
                              </motion.span>
                            )}
                            {subTotal > 0 && (
                              <span className="subtask-count">✓ {subDone}/{subTotal}</span>
                            )}
                          </div>
                          {subTotal > 0 && (
                            <div className="subtask-mini-bar">
                              <motion.div className="subtask-mini-fill" animate={{ width:`${subPct}%` }} style={{ background:sColor }}/>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="task-actions">
                          <motion.button className={`action-btn ${t.pinned?'pinned':''}`}
                            onClick={() => togglePin(t.id)} title="Pin task"
                            whileHover={{ scale:1.2 }} whileTap={{ scale:0.85 }}>
                            <Star size={14} fill={t.pinned?'var(--warning)':'none'} color={t.pinned?'var(--warning)':'currentColor'}/>
                          </motion.button>
                          <motion.button className={`action-btn ${t.ticking?'timer-active':''}`}
                            onClick={() => t.status==='active' && toggleTimer(t.id)}
                            title={t.ticking?'Pause timer':'Start timer'}
                            whileHover={{ scale:1.2 }} whileTap={{ scale:0.85 }}>
                            {t.ticking ? <Pause size={14}/> : <Play size={14}/>}
                          </motion.button>
                          <motion.button className="action-btn"
                            onClick={() => setFocus(t)} title="Focus mode"
                            whileHover={{ scale:1.2 }} whileTap={{ scale:0.85 }}>
                            <Target size={14}/>
                          </motion.button>
                          <motion.button className={`action-btn expand-btn ${isExp?'expanded':''}`}
                            onClick={() => { setExpandedId(isExp ? null : t.id); sfx(400,'sine',0.04); }}
                            title="Sub-tasks"
                            whileHover={{ scale:1.2 }} whileTap={{ scale:0.85 }}>
                            <ChevronDown size={14} style={{ transform:isExp?'rotate(180deg)':'none', transition:'0.3s' }}/>
                          </motion.button>
                          <motion.button className="action-btn danger-btn"
                            onClick={() => deleteTask(t.id)} title="Delete task"
                            whileHover={{ scale:1.2 }} whileTap={{ scale:0.85 }}>
                            <Trash2 size={14}/>
                          </motion.button>
                        </div>
                      </div>

                      {/* Expandable sub-tasks panel */}
                      <AnimatePresence>
                        {isExp && (
                          <motion.div className="subtasks-panel"
                            initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                            exit={{ height:0, opacity:0 }} transition={{ duration:0.28 }}>
                            <div className="subtasks-inner">
                              <div className="subtasks-label">
                                <Edit3 size={11}/> SUB-TASKS
                                {subTotal > 0 && <span className="subtask-badge">{subDone}/{subTotal}</span>}
                              </div>
                              <AnimatePresence>
                                {(t.nodes||[]).map(node => (
                                  <SubTaskRow key={node.id} node={node}
                                    onToggle={() => toggleSubTask(t.id, node.id)}
                                    onDelete={() => deleteSubTask(t.id, node.id)} />
                                ))}
                              </AnimatePresence>
                              {subTotal === 0 && <p className="subtasks-empty">No sub-tasks yet.</p>}
                              <div className="subtask-add-row">
                                <input className="subtask-input" placeholder="Add a sub-task…"
                                  value={subInput[t.id]||''}
                                  onChange={e => setSubInput(p => ({...p, [t.id]:e.target.value}))}
                                  onKeyDown={e => e.key==='Enter' && addSubTask(t.id)} />
                                <motion.button className="subtask-add-btn" onClick={() => addSubTask(t.id)}
                                  whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}>
                                  <Plus size={14}/>
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          </section>

        ) : (
          /* ── Kanban View ── */
          <section className="kanban-section">
            {[
              { status:'active',    label:'In Progress', color:'#6366f1' },
              { status:'completed', label:'Secured',     color:'#10b981' },
            ].map(col => (
              <div key={col.status} className="kanban-col">
                <div className="col-title">
                  <span style={{ color:col.color }}>{col.label}</span>
                  <span className="col-count">{tasks.filter(t=>t.status===col.status).length}</span>
                </div>
                <div className="kanban-cards">
                  {tasks.filter(t=>t.status===col.status).map(t => {
                    const subDone  = (t.nodes||[]).filter(n=>n.done).length;
                    const subTotal = (t.nodes||[]).length;
                    return (
                      <motion.div key={t.id} layoutId={t.id} className="kanban-card"
                        whileHover={{ y:-4, boxShadow:'0 12px 40px rgba(0,0,0,0.3)' }}
                        onClick={() => toggleTask(t.id)}>
                        <div className="kc-accent" style={{ background: SECTORS.find(s=>s.name===t.sector)?.color }}/>
                        <span className="kc-title">{t.title}</span>
                        <div className="kc-meta">
                          <span style={{ color:SECTORS.find(s=>s.name===t.sector)?.color, fontSize:'0.7rem', fontWeight:700 }}>{t.sector}</span>
                          {t.deadline && <span style={{ fontSize:'0.65rem', color:deadlineColor(t.deadline) }}>{getDaysLeft(t.deadline)}</span>}
                        </div>
                        {subTotal > 0 && (
                          <div className="kc-progress-bar">
                            <div className="kc-progress-fill" style={{ width:`${(subDone/subTotal)*100}%`, background:col.color }}/>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {tasks.filter(t=>t.status===col.status).length === 0 && (
                    <div className="kanban-empty">Nothing here yet</div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── Focus Overlay ── */}
        <AnimatePresence>
          {focus && (
            <motion.div className="focus-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <button className="close-btn" onClick={() => setFocus(null)}><X size={44}/></button>
              <div style={{ textAlign:'center' }}>
                <motion.div className="focus-timer-display"
                  animate={{ opacity:[1,0.7,1] }} transition={{ duration:2, repeat:Infinity }}>
                  {formatTime(tasks.find(x=>x.id===focus.id)?.elapsed || 0)}
                </motion.div>
                <h2 className="focus-task-title">{focus.title}</h2>
                <p style={{ color:'var(--text-muted)', marginBottom:'2.5rem', fontSize:'0.95rem' }}>
                  Stay focused. One task at a time.
                </p>
                <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
                  <motion.button className="focus-btn" onClick={() => toggleTimer(focus.id)}
                    whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
                    {tasks.find(x=>x.id===focus.id)?.ticking ? <><Pause size={18}/> PAUSE</> : <><Play size={18}/> START TIMER</>}
                  </motion.button>
                  <motion.button className="focus-btn complete" onClick={() => { toggleTask(focus.id); setFocus(null); }}
                    whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}>
                    <Check size={18}/> COMPLETE
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── System Logs ── */}
        <AnimatePresence>
          {showLogs && (
            <motion.div className="logs-panel" initial={{ y:120, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:120, opacity:0 }}>
              <div className="logs-header">
                <span><Terminal size={13}/> SYSTEM LOGS</span>
                <button onClick={() => setShowLogs(false)}><X size={13}/></button>
              </div>
              <div className="logs-body">
                {logs.map((l,i) => (
                  <div key={i} className={`log-entry ${l.type}`}>
                    <span className="log-time">[{l.time}]</span>
                    <span>{l.msg}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Achievement Toast ── */}
        <AnimatePresence>
          {notif && (
            <motion.div className="achievement-toast" initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}>
              <Trophy size={19}/> <span>{notif}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Keyboard Shortcuts Modal ── */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div className="shortcuts-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setShowShortcuts(false)}>
              <motion.div className="shortcuts-card" initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:20 }} onClick={e => e.stopPropagation()}>
                <div className="shortcuts-header">
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    <Keyboard size={20} color="var(--primary)"/>
                    <span>KEYBOARD SHORTCUTS</span>
                  </div>
                  <button onClick={() => setShowShortcuts(false)}><X size={16}/></button>
                </div>
                <div className="shortcuts-grid">
                  {[
                    { keys:['Ctrl','K'],    desc:'Open command palette' },
                    { keys:['Enter'],       desc:'Add new task' },
                    { keys:['Esc'],         desc:'Close any overlay' },
                    { keys:['Double-click'],desc:'Inline edit task title' },
                    { keys:['↑ ↓'],        desc:'Navigate command palette' },
                  ].map((s,i) => (
                    <div key={i} className="shortcut-row">
                      <div className="shortcut-keys">
                        {s.keys.map(k => <kbd key={k} className="shortcut-key">{k}</kbd>)}
                      </div>
                      <span className="shortcut-desc">{s.desc}</span>
                    </div>
                  ))}
                  <div className="shortcuts-divider"/>
                  <div className="shortcut-row" style={{ gridColumn:'1/-1' }}>
                    <Zap size={12} color="var(--primary)"/>
                    <span className="shortcut-desc" style={{ color:'var(--text-muted)' }}>Drag tasks to reorder · Double-click to edit · ⌄ to expand sub-tasks</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Floating Quick-Add FAB ── */}
        <AnimatePresence>
          {!adv && input === '' && (
            <motion.button
              className="fab-btn"
              title="Quick add task"
              onClick={() => { window.scrollTo({ top: 0, behavior:'smooth' }); setTimeout(() => setAdv(true), 400); }}
              initial={{ scale:0, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              exit={{ scale:0, opacity:0 }}
              whileHover={{ scale:1.12, boxShadow:'0 12px 40px rgba(99,102,241,0.6)' }}
              whileTap={{ scale:0.92 }}
            >
              <Plus size={24}/>
            </motion.button>
          )}
        </AnimatePresence>

        <footer style={{ padding:'6rem 0 3rem', textAlign:'center', color:'var(--text-muted)', fontSize:'0.68rem', fontWeight:800, letterSpacing:'1px' }}>
          TASK MANAGER V12 // ALL SYSTEMS SECURE &nbsp;·&nbsp; Press <kbd style={{ background:'var(--surface)', padding:'1px 6px', borderRadius:4, fontSize:'0.65rem' }}>Ctrl+K</kbd> for commands
        </footer>
      </div>
    </div>
  );
}

export default App;
