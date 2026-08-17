"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, FileText, Loader2, Mail, RotateCcw, Sparkles, Trash2, Wand2 } from "lucide-react";
import PosterCanvas, { POSTER_HEIGHT, POSTER_WIDTH } from "./PosterCanvas";
import { EMPTY_JOB, extractJob, SAMPLE_JD, type ExtractedJob } from "@/lib/job-poster";
import { site } from "@/data/site";

const inputClass =
  "w-full rounded-xl border border-border-glass bg-surface-2 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-faint focus:border-accent focus:bg-tint";

type Source = "local" | "ai";

export default function JobPosterStudio() {
  const [jdText, setJdText] = useState(SAMPLE_JD);
  const [emailsInput, setEmailsInput] = useState("");
  const [draft, setDraft] = useState<ExtractedJob>(() => extractJob(SAMPLE_JD));
  const [source, setSource] = useState<Source>("local");
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(0.4);

  const posterRef = useRef<HTMLDivElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const touchedRef = useRef<Set<string>>(new Set());

  const parsedEmails = useMemo(
    () =>
      emailsInput
        .split(/[\n,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    [emailsInput]
  );

  const posterData: ExtractedJob = useMemo(
    () => ({ ...draft, emails: parsedEmails }),
    [draft, parsedEmails]
  );

  const mergeIntoDraft = useCallback((next: ExtractedJob) => {
    setDraft((prev) => {
      const touched = touchedRef.current;
      return {
        title: touched.has("title") ? prev.title : next.title,
        companyType: touched.has("companyType") ? prev.companyType : next.companyType,
        deadline: touched.has("deadline") ? prev.deadline : next.deadline,
        responsibilities: touched.has("responsibilities") ? prev.responsibilities : next.responsibilities,
        requirements: touched.has("requirements") ? prev.requirements : next.requirements,
        emails: next.emails,
      };
    });
    setEmailsInput((prev) => (prev.trim() ? prev : next.emails.join("\n")));
  }, []);

  const runExtraction = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const local = extractJob(text);
      mergeIntoDraft(local);
      setSource("local");
      try {
        const res = await fetch("/api/job-poster/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.source === "ai" && json?.data) {
          mergeIntoDraft(json.data);
          setSource("ai");
        }
      } catch {
        /* AI unavailable, keep the local extraction */
      }
    },
    [mergeIntoDraft]
  );

  // Real-time extraction: debounced on every keystroke in the JD box.
  useEffect(() => {
    const t = setTimeout(() => runExtraction(jdText), 450);
    return () => clearTimeout(t);
  }, [jdText, runExtraction]);

  // Fit the 1080×1350 canvas into the preview pane.
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;
    const update = () => {
      setScale(Math.min(el.clientWidth / POSTER_WIDTH, el.clientHeight / POSTER_HEIGHT));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const setField = useCallback((key: keyof ExtractedJob, value: string | string[]) => {
    touchedRef.current.add(key);
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const loadSample = () => {
    touchedRef.current.clear();
    setEmailsInput("");
    setJdText(SAMPLE_JD);
    runExtraction(SAMPLE_JD);
  };

  const clearAll = () => {
    touchedRef.current.clear();
    setJdText("");
    setEmailsInput("");
    setDraft(EMPTY_JOB);
    setSource("local");
  };

  const exportPng = async () => {
    const node = posterRef.current;
    if (!node || exporting) return;
    setExporting(true);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(node, {
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const slug = (posterData.title || "job-poster")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const link = document.createElement("a");
      link.download = `${slug || "job-poster"}-poster.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Poster export failed:", err);
      alert("Export failed, please try again (see console for details).");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10">
      {/* ─── Page header ─── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-index">Free Tool · 01</p>
          <h1 className="section-title">Job Poster Generator</h1>
          <p className="section-subtitle">
            Paste a job description. The AI extracts the title, deadline, responsibilities &amp; requirements, then
            exports a crisp 1080×1350 poster ready for LinkedIn or Facebook.
          </p>
        </div>
        <button
          onClick={exportPng}
          disabled={exporting}
          className="btn btn-primary"
          aria-label="Download high-resolution poster as PNG"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {exporting ? "Rendering…" : "Download High-Res PNG"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* ─── Left: inputs ─── */}
        <div className="glass-card self-start p-6 lg:sticky lg:top-28">
          <div className="space-y-6">
            <div>
              <label htmlFor="jd-text" className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-accent-light" />
                Job Description
                <span className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={loadSample}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-glass px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" /> Sample
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-glass px-2.5 py-1 text-xs text-muted transition-colors hover:border-red-400/50 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                </span>
              </label>
              <textarea
                id="jd-text"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={12}
                spellCheck={false}
                placeholder="Paste the full job description here…"
                className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
              />
              <button
                type="button"
                onClick={() => runExtraction(jdText)}
                className="btn btn-primary mt-3 w-full"
              >
                <Wand2 className="h-4 w-4" />
                Generate Poster
              </button>
              <p className="mt-1.5 text-xs text-muted">
                Parsed automatically as you type, <em>or</em> let Gemini refine the extraction when an API key is configured.
              </p>
            </div>

            <div>
              <label htmlFor="emails" className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Mail className="h-4 w-4 text-accent-light" />
                Email Addresses
                <span className="ml-auto text-xs font-normal text-muted">one per line · optional</span>
              </label>
              <textarea
                id="emails"
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                rows={3}
                spellCheck={false}
                placeholder={"career@company.com\nhr@company.com"}
                className={`${inputClass} resize-y font-mono text-[13px]`}
              />
            </div>

            <div className="border-t border-border-glass pt-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-accent-light" />
                  Extracted &amp; Editable
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    source === "ai"
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border-border-glass bg-surface-2 text-muted"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${source === "ai" ? "bg-emerald-400" : "bg-gray-500"}`}
                  />
                  {source === "ai" ? "Refined by AI" : "Parsed locally"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-title" className="mb-1.5 block text-xs text-muted">
                    Title
                  </label>
                  <input
                    id="f-title"
                    value={draft.title}
                    onChange={(e) => setField("title", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="f-company" className="mb-1.5 block text-xs text-muted">
                    Company Type
                  </label>
                  <input
                    id="f-company"
                    value={draft.companyType}
                    onChange={(e) => setField("companyType", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="f-deadline" className="mb-1.5 block text-xs text-muted">
                    Deadline
                  </label>
                  <input
                    id="f-deadline"
                    value={draft.deadline}
                    onChange={(e) => setField("deadline", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="f-resp" className="mb-1.5 block text-xs text-muted">
                    Responsibilities <span className="text-faint">(one per line)</span>
                  </label>
                  <textarea
                    id="f-resp"
                    value={draft.responsibilities.join("\n")}
                    onChange={(e) => setField("responsibilities", e.target.value.split("\n"))}
                    rows={6}
                    spellCheck={false}
                    className={`${inputClass} resize-y font-mono text-[13px]`}
                  />
                </div>
                <div>
                  <label htmlFor="f-req" className="mb-1.5 block text-xs text-muted">
                    Requirements <span className="text-faint">(one per line)</span>
                  </label>
                  <textarea
                    id="f-req"
                    value={draft.requirements.join("\n")}
                    onChange={(e) => setField("requirements", e.target.value.split("\n"))}
                    rows={6}
                    spellCheck={false}
                    className={`${inputClass} resize-y font-mono text-[13px]`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: live preview ─── */}
        <div className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Live Preview</h2>
            <span className="rounded-full border border-border-glass bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] text-muted">
              {POSTER_WIDTH} × {POSTER_HEIGHT} px · 4:5
            </span>
          </div>

          <div
            ref={previewBoxRef}
            className="glass-card flex h-[72vh] min-h-[540px] items-center justify-center overflow-hidden p-4 lg:h-[calc(100vh-21rem)]"
          >
            <div style={{ width: POSTER_WIDTH * scale, height: POSTER_HEIGHT * scale }} className="relative shrink-0">
              <div
                style={{
                  width: POSTER_WIDTH,
                  height: POSTER_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <PosterCanvas ref={posterRef} data={posterData} brandName={site.name} brandEmail={site.email} />
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-muted">
            Preview is scaled to fit your screen. The downloaded PNG is full-resolution.
          </p>
        </div>
      </div>
    </div>
  );
}
