'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Download, Film, Gauge, Github, Layers3, Play, Plus, Sparkles, WandSparkles, Zap } from 'lucide-react';

type Ratio = '16:9' | '1:1' | '9:16';
type Background = 'Green Screen #00b140' | 'Solid Black' | 'Solid White';

const defaults = `<!doctype html>
<html><head><style>
  *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}
  body{display:grid;place-items:center;background:#00b140;font-family:Arial,sans-serif}
  .orb{width:180px;height:180px;border-radius:50%;background:linear-gradient(135deg,#dfff9a,#a7f34d 50%,#406e18);box-shadow:0 25px 50px #123d1b66;animation:float 3s ease-in-out infinite alternate}
  @keyframes float{to{transform:translateY(-32px) rotate(180deg);filter:hue-rotate(25deg)}}
</style></head><body><div class="orb"></div></body></html>`;

function ratioClass(ratio: Ratio) {
  return ratio === '16:9' ? 'aspect-video w-full max-w-[760px]' : ratio === '1:1' ? 'aspect-square w-full max-w-[560px]' : 'aspect-[9/16] h-[560px] max-w-[315px]';
}

export default function Home() {
  const [concept, setConcept] = useState('Coin dollar spinning slowly');
  const [ratio, setRatio] = useState<Ratio>('16:9');
  const [duration, setDuration] = useState('10s');
  const [background, setBackground] = useState<Background>('Green Screen #00b140');
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState(defaults);
  const [previewCode, setPreviewCode] = useState(defaults);
  const [fps, setFps] = useState('30');
  const [resolution, setResolution] = useState('1080p');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');

  const generatedPrompt = useMemo(() => prompt || `You are a senior motion designer. Create a SINGLE self-contained HTML file using Three.js or CSS animations for the following concept: ${concept}. Aspect Ratio: ${ratio}. Duration: ${duration}. Background: ${background}. Ensure it is highly detailed, renders beautifully, and loops seamlessly.`, [prompt, concept, ratio, duration, background]);

  const createPrompt = () => setPrompt(`You are a senior motion designer. Create a SINGLE self-contained HTML file using Three.js or CSS animations for the following concept: ${concept || 'an abstract motion graphic'}. Aspect Ratio: ${ratio}. Duration: ${duration}. Background: ${background}. Ensure it is highly detailed, renders beautifully, and loops seamlessly.`);
  const copyPrompt = async () => { await navigator.clipboard?.writeText(generatedPrompt); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const runMotion = () => { setPreviewCode(code || defaults); document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  const exportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true); setProgress(0); setExportMessage('Preparing render context…');
    const seconds = Number.parseInt(duration, 10) || 10;
    const canvas = document.createElement('canvas');
    const isPortrait = ratio === '9:16';
    const isSquare = ratio === '1:1';
    canvas.width = resolution === '4K' ? (isPortrait ? 2160 : 3840) : (isPortrait ? 1080 : 1920);
    canvas.height = resolution === '4K' ? (isPortrait ? 3840 : isSquare ? 3840 : 2160) : (isPortrait ? 1920 : isSquare ? 1080 : 1080);
    const ctx = canvas.getContext('2d');
    if (!ctx) { setIsExporting(false); return; }
    const stream = canvas.captureStream(Number(fps));
    const mime = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') ? 'video/mp4;codecs=avc1' : 'video/webm;codecs=vp9';
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: resolution === '4K' ? 24000000 : 10000000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    const ended = new Promise<void>(resolve => { recorder.onstop = () => resolve(); });
    recorder.start();
    const started = performance.now();
    const draw = (now: number) => {
      const elapsed = Math.min((now - started) / 1000, seconds);
      const t = elapsed / seconds;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#101b20'); gradient.addColorStop(.48, '#182f25'); gradient.addColorStop(1, '#080b10');
      ctx.fillStyle = background === 'Solid Black' ? '#000' : background === 'Solid White' ? '#fff' : gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const size = Math.min(canvas.width, canvas.height) * .22; const x = canvas.width * (.5 + Math.sin(t * Math.PI * 2) * .18); const y = canvas.height * (.5 + Math.cos(t * Math.PI * 4) * .08);
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * Math.PI * 4); const orb = ctx.createLinearGradient(-size, -size, size, size); orb.addColorStop(0, '#e5ffae'); orb.addColorStop(.5, '#a7f34d'); orb.addColorStop(1, '#416e1d'); ctx.fillStyle = orb; ctx.shadowColor = '#a7f34d88'; ctx.shadowBlur = size * .35; ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = background === 'Solid White' ? '#11151d' : '#f5f7fa'; ctx.font = `600 ${Math.max(24, canvas.width / 48)}px Arial`; ctx.fillText('MOTIONGEN', canvas.width * .06, canvas.height * .1); ctx.globalAlpha = .55; ctx.font = `${Math.max(16, canvas.width / 80)}px Arial`; ctx.fillText(concept.toUpperCase(), canvas.width * .06, canvas.height * .94); ctx.globalAlpha = 1;
      const value = Math.round(t * 100); setProgress(value); setExportMessage(`Rendering frame ${value}% · ${fps} FPS · ${resolution}`);
      if (elapsed < seconds) requestAnimationFrame(draw); else { recorder.stop(); }
    };
    requestAnimationFrame(draw); await ended;
    const blob = new Blob(chunks, { type: mime }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `motiongen-${Date.now()}.${mime.startsWith('video/mp4') ? 'mp4' : 'webm'}`; anchor.click(); URL.revokeObjectURL(url);
    setProgress(100); setExportMessage(mime.startsWith('video/mp4') ? 'Export complete — MP4 downloaded.' : 'Export complete — WebM downloaded (your browser does not support MP4 recording).'); setTimeout(() => setIsExporting(false), 700);
  };

  return <main className="noise min-h-screen overflow-hidden"><header className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 lg:px-10"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#a7f34d] text-[#10150d]"><Layers3 size={20} strokeWidth={2.5} /></div><span className="text-lg font-bold tracking-[-.04em]">Motion<span className="text-[#a7f34d]">Gen</span></span><span className="ml-2 hidden rounded-full border border-[#29313c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#8590a1] sm:block">Studio beta</span></div><div className="flex items-center gap-4 text-sm text-[#8b96a8]"><span className="hidden items-center gap-2 sm:flex"><span className="h-2 w-2 rounded-full bg-[#a7f34d] shadow-[0_0_10px_#a7f34d]" /> Local-first rendering</span><Github size={18} /></div></header>
  <section className="grid-bg border-y border-[#1d232e]"><div className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10 lg:py-20"><div className="max-w-3xl"><div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#a7f34d]"><Sparkles size={15} /> AI motion graphics pipeline</div><h1 className="text-5xl font-semibold leading-[.98] tracking-[-.07em] text-white md:text-7xl">From a thought<br /><span className="text-[#a7f34d]">to a moving picture.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-[#8b96a8]">Brief your idea. Generate a precise prompt. Paste the result. Preview and export your motion graphic — without leaving your browser.</p></div><div className="mt-12 grid max-w-3xl grid-cols-3 gap-5 border-t border-[#262e3a] pt-5 text-xs uppercase tracking-[.14em] text-[#637084]"><div><b className="mb-1 block text-2xl tracking-[-.05em] text-[#e8edf2]">01</b>Brief</div><div><b className="mb-1 block text-2xl tracking-[-.05em] text-[#e8edf2]">02</b>Render</div><div><b className="mb-1 block text-2xl tracking-[-.05em] text-[#e8edf2]">03</b>Export</div></div></div></section>
  <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-8 lg:grid-cols-[.88fr_1.12fr] lg:px-10 lg:py-10"><section className="rounded-2xl border border-[#242b38] bg-[#11151d] p-6 lg:p-8"><div className="mb-8 flex items-start justify-between"><div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#a7f34d]"><span className="grid h-6 w-6 place-items-center rounded-md bg-[#a7f34d] text-[#10150d]">01</span> The brief</div><h2 className="text-2xl font-semibold tracking-[-.04em]">Shape your direction</h2></div><WandSparkles className="text-[#697587]" size={22} /></div><label className="mb-2 block text-xs font-bold uppercase tracking-[.13em] text-[#8b96a8]">Animation concept</label><textarea value={concept} onChange={e => setConcept(e.target.value)} rows={4} className="mb-7 w-full resize-none rounded-xl border border-[#2a3341] bg-[#0b0e14] p-4 text-sm leading-6 text-white placeholder:text-[#566274]" placeholder="Describe your animation idea…" /><div className="grid gap-4 sm:grid-cols-3"><Field label="Aspect ratio"><select value={ratio} onChange={e => setRatio(e.target.value as Ratio)}>{['16:9','1:1','9:16'].map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Duration"><select value={duration} onChange={e => setDuration(e.target.value)}>{['5s','10s','15s'].map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Background"><select value={background} onChange={e => setBackground(e.target.value as Background)}><option>Green Screen #00b140</option><option>Solid Black</option><option>Solid White</option></select></Field></div><button onClick={createPrompt} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#a7f34d] py-3.5 text-sm font-bold text-[#11160c] transition hover:bg-[#c5ff82]"><Zap size={17} fill="currentColor" /> Generate system prompt</button><div className="mt-8 border-t border-[#242b38] pt-6"><div className="mb-3 flex items-center justify-between"><label className="text-xs font-bold uppercase tracking-[.13em] text-[#8b96a8]">Generated prompt</label><button onClick={copyPrompt} className="flex items-center gap-1.5 text-xs font-semibold text-[#a7f34d]">{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? 'Copied' : 'Copy'}</button></div><textarea readOnly value={generatedPrompt} rows={7} className="w-full resize-none rounded-xl border border-[#242b38] bg-[#0b0e14] p-4 text-xs leading-5 text-[#aeb8c7]" /></div></section>
  <section className="rounded-2xl border border-[#242b38] bg-[#11151d] p-6 lg:p-8"><div className="mb-8 flex items-start justify-between"><div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#a7f34d]"><span className="grid h-6 w-6 place-items-center rounded-md bg-[#a7f34d] text-[#10150d]">02</span> The renderer</div><h2 className="text-2xl font-semibold tracking-[-.04em]">Bring it to life</h2></div><Film className="text-[#697587]" size={22} /></div><div className="mb-6 flex items-center justify-between"><label className="text-xs font-bold uppercase tracking-[.13em] text-[#8b96a8]">Paste LLM HTML</label><button onClick={() => setCode(defaults)} className="flex items-center gap-1 text-xs text-[#7f8b9e] hover:text-white"><Plus size={14} /> Load example</button></div><textarea value={code} onChange={e => setCode(e.target.value)} className="h-48 w-full resize-y rounded-xl border border-[#2a3341] bg-[#0b0e14] p-4 font-mono text-xs leading-5 text-[#b8c3d2]" spellCheck={false} /><button onClick={runMotion} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#506129] bg-[#19230f] py-3 text-sm font-bold text-[#c7ff8b] transition hover:bg-[#253617]"><Play size={16} fill="currentColor" /> Run motion</button><div id="preview" className="mt-8 border-t border-[#242b38] pt-6"><div className="mb-3 flex items-center justify-between"><label className="text-xs font-bold uppercase tracking-[.13em] text-[#8b96a8]">Live preview</label><span className="flex items-center gap-2 text-[11px] text-[#748094]"><span className="h-1.5 w-1.5 rounded-full bg-[#a7f34d]" /> sandboxed iframe</span></div><div className="grid min-h-[270px] place-items-center rounded-xl bg-[#080a0e] p-4"><iframe title="Motion preview" srcDoc={previewCode} sandbox="allow-scripts" className={`${ratioClass(ratio)} rounded-lg border border-[#3a4654] bg-black shadow-2xl`} /></div></div><div className="mt-7 border-t border-[#242b38] pt-6"><div className="mb-4 flex items-center justify-between"><div><label className="text-xs font-bold uppercase tracking-[.13em] text-[#8b96a8]">Export settings</label><p className="mt-1 text-xs text-[#637084]">Capture a local render from the canvas</p></div><Gauge size={19} className="text-[#697587]" /></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Frame rate"><select value={fps} onChange={e => setFps(e.target.value)}>{['24','30','60'].map(x => <option key={x}>{x} FPS</option>)}</select></Field><Field label="Resolution"><select value={resolution} onChange={e => setResolution(e.target.value)}><option>1080p</option><option>4K</option></select></Field></div>{isExporting && <div className="mt-5"><div className="mb-2 flex justify-between text-xs text-[#aeb8c7]"><span>{exportMessage}</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#252d38]"><div className="h-full rounded-full bg-[#a7f34d] transition-[width] duration-150" style={{ width: `${progress}%` }} /></div></div>}{!isExporting && exportMessage && <p className="mt-4 text-xs text-[#a7f34d]">{exportMessage}</p>}<button disabled={isExporting} onClick={exportVideo} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-[#101319] transition hover:bg-[#dce3e9] disabled:cursor-wait disabled:opacity-50"><Download size={17} /> {isExporting ? 'Rendering…' : 'Export MP4'}</button></div></section></div><footer className="mx-auto flex max-w-[1400px] items-center justify-between px-6 pb-10 text-xs text-[#566274] lg:px-10"><span>MotionGen © 2026</span><span className="flex items-center gap-1.5"><Sparkles size={12} /> Crafted for the curious</span></footer></main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.12em] text-[#697587]">{label}</span><span className="relative block [&>select]:w-full [&>select]:appearance-none [&>select]:rounded-lg [&>select]:border [&>select]:border-[#2a3341] [&>select]:bg-[#0b0e14] [&>select]:px-3 [&>select]:py-2.5 [&>select]:text-xs [&>select]:text-[#dce3eb]">{children}</span></label>; }
