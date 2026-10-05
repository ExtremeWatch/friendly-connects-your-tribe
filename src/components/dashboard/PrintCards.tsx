import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Format = "tent" | "card" | "poster";
type Theme = "warm" | "minimal";

const formats: { key: Format; label: string; hint: string; page: string; w: number; h: number }[] = [
  { key: "tent", label: "Table tent", hint: "A5 sheet, fold in half", page: "A5 landscape", w: 210, h: 148 },
  { key: "card", label: "Table card", hint: "A6, fits a photo frame", page: "A6 portrait", w: 105, h: 148 },
  { key: "poster", label: "Entrance poster", hint: "A4 for easels or the bar", page: "A4 portrait", w: 210, h: 297 },
];

const themes: Record<Theme, { label: string; bg: string; fg: string; accent: string; head: string; body: string }> = {
  warm: { label: "Classic warm", bg: "#fbf6ef", fg: "#3a2a22", accent: "#d9603b", head: "'Fraunces', Georgia, serif", body: "'Manrope', Arial, sans-serif" },
  minimal: { label: "Modern minimal", bg: "#ffffff", fg: "#111111", accent: "#111111", head: "'Manrope', Arial, sans-serif", body: "'Manrope', Arial, sans-serif" },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function buildHtml(opts: { format: Format; theme: Theme; title: string; headline: string; steps: string; qr: string; link: string }) {
  const f = formats.find((x) => x.key === opts.format)!;
  const t = themes[opts.theme];
  const scale = opts.format === "poster" ? 2.4 : 1;
  const qrSize = opts.format === "poster" ? 130 : 52;
  const panel = `<div class="panel">
    <p class="title">${esc(opts.title)}</p>
    <h1>${esc(opts.headline)}</h1>
    <img src="${opts.qr}" alt="QR code" />
    <ol>${opts.steps.split("\n").filter(Boolean).map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    <p class="link">${esc(opts.link.replace(/^https?:\/\//, ""))}</p>
    <p class="brand">No app needed · Tifkira</p>
  </div>`;
  const body = opts.format === "tent" ? `<div class="tent"><div class="half flip">${panel}</div><div class="half">${panel}</div></div>` : panel;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(opts.title)} — QR cards</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
<style>
@page { size: ${f.page}; margin: 0; }
* { box-sizing: border-box; margin: 0; }
html, body { width: ${f.w}mm; height: ${f.h}mm; background: ${t.bg}; color: ${t.fg}; font-family: ${t.body}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.panel { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: ${8 * scale}mm; gap: ${2.5 * scale}mm; border: ${opts.theme === "warm" ? `1.2mm solid ${t.accent}` : "0"}; }
.title { font-size: ${9 * scale}pt; letter-spacing: .12em; text-transform: uppercase; font-weight: 700; color: ${t.accent}; }
h1 { font-family: ${t.head}; font-weight: 600; font-size: ${18 * scale}pt; line-height: 1.1; }
img { width: ${qrSize}mm; height: ${qrSize}mm; }
ol { list-style: none; padding: 0; font-size: ${8 * scale}pt; line-height: 1.5; }
li::before { content: counter(list-item) ". "; font-weight: 700; color: ${t.accent}; }
.link { font-size: ${8 * scale}pt; font-weight: 700; }
.brand { font-size: ${6 * scale}pt; opacity: .6; }
.tent { width: 100%; height: 100%; display: flex; }
.half { width: 50%; height: 100%; }
.flip { transform: rotate(180deg); border-right: 0.3mm dashed ${t.fg}33; }
</style></head><body>${body}</body></html>`;
}

export function PrintCards({ eventName, link }: { eventName: string; link: string }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("tent");
  const [theme, setTheme] = useState<Theme>("warm");
  const [title, setTitle] = useState(eventName);
  const [headline, setHeadline] = useState("Share your photos with us!");
  const [steps, setSteps] = useState("Scan the QR code with your phone camera\nAdd your name\nUpload your photos & videos");
  const [qr, setQr] = useState("");

  useEffect(() => setTitle(eventName), [eventName]);
  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, { width: 1200, margin: 1, color: { dark: theme === "warm" ? "#3a2a22" : "#000000", light: "#00000000" } }).then(setQr).catch(() => setQr(""));
  }, [link, theme]);

  const html = useMemo(() => (qr ? buildHtml({ format, theme, title, headline, steps, qr, link }) : ""), [format, theme, title, headline, steps, qr, link]);
  const f = formats.find((x) => x.key === format)!;
  const previewW = 320;
  const pxPerMm = 3.78;
  const zoom = previewW / (f.w * pxPerMm);

  function print() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Printer /> Print table cards</Button></DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Print table cards & signs</DialogTitle>
          <DialogDescription>Pick a size and style, then print or save as PDF.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-5">
            <div>
              <Label>Size</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {formats.map((x) => <button key={x.key} type="button" onClick={() => setFormat(x.key)} className={`rounded-md border p-3 text-left text-sm ${format === x.key ? "border-primary bg-secondary" : "hover:bg-muted"}`}><span className="block font-semibold">{x.label}</span><span className="text-xs text-muted-foreground">{x.hint}</span></button>)}
              </div>
            </div>
            <div>
              <Label>Style</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.keys(themes) as Theme[]).map((k) => <button key={k} type="button" onClick={() => setTheme(k)} className={`rounded-md border p-3 text-left text-sm font-semibold ${theme === k ? "border-primary bg-secondary" : "hover:bg-muted"}`}>{themes[k].label}</button>)}
              </div>
            </div>
            <div><Label htmlFor="pc-title">Event title</Label><Input id="pc-title" className="mt-2" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label htmlFor="pc-head">Headline</Label><Input id="pc-head" className="mt-2" value={headline} maxLength={80} onChange={(e) => setHeadline(e.target.value)} /></div>
            <div><Label htmlFor="pc-steps">Instructions (one per line)</Label><Textarea id="pc-steps" className="mt-2" rows={3} value={steps} maxLength={300} onChange={(e) => setSteps(e.target.value)} /></div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="overflow-hidden rounded-md border shadow-sm" style={{ width: previewW, height: f.h * pxPerMm * zoom }}>
              {html && <iframe title="Card preview" srcDoc={html} style={{ width: f.w * pxPerMm, height: f.h * pxPerMm, transform: `scale(${zoom})`, transformOrigin: "top left", border: 0 }} />}
            </div>
            <p className="text-xs text-muted-foreground">{f.page}{format === "tent" ? " — fold along the dashed line" : ""}</p>
            <Button className="w-full" onClick={print} disabled={!html}><Printer /> Print / save PDF</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
