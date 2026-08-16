import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import PosterCanvas, { POSTER_WIDTH, POSTER_HEIGHT } from "./PosterCanvas.jsx";
import { TEMPLATES, THEMES, DEFAULT_TEMPLATE_ID, DEFAULT_THEME_ID, getTemplate, getTheme, buildPalette } from "./templates.js";
import { extractJob, geminiExtract, SAMPLE_JD } from "./lib/extractLocal.js";

const SAMPLE = {
  title: "Executive — Talent Acquisition",
  companyType: "A Renowned Educational Institution",
  deadline: "URGENT — Apply by 15 September 2026",
  responsibilities: [
    "Manage end-to-end recruitment from sourcing to onboarding",
    "Screen resumes and coordinate interviews with hiring managers",
    "Maintain candidate database and recruitment documentation",
    "Ensure a positive candidate experience throughout the hiring lifecycle",
  ],
  requirements: [
    "MBA / BBA in Human Resource Management",
    "1-2 years of experience in recruitment or HR operations",
    "Strong communication and stakeholder management skills",
    "Familiarity with ATS platforms and AI-powered sourcing tools",
  ],
  emails: "farhana@enroute.com.bd, support@enroute.com.bd",
  logoText: "Enroute",
  logoImage: "",
  logoPreset: "enroute",
  logoSecondaryText: "",
  logoSecondaryImage: "",
  graphic: "magnifier",
  introText: "A renowned educational institution is looking for",
  badgeText: "We Are Hiring",
  respHeading: "Key Responsibilities",
  reqHeading: "Requirements",
  noteText: "Please mention the position applied for in the subject line.",
  templateId: DEFAULT_TEMPLATE_ID,
  themeId: DEFAULT_THEME_ID,
  layout: "split",
  // Element toggles (default on)
  showEco: true,
  showLogos: true,
  showBadge: true,
  showIntro: true,
  showChip: true,
  showDeadline: true,
  showGraphic: true,
  showCTA: true,
  showFooter: true,
  // Per-part custom colors (empty = template default)
  titleColor: "",
  ribbonColor: "",
  cardBg: "",
  footerColor: "",
};

const inputClass = "jp-input";

function parseEmails(raw) {
  return raw
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default function App() {
  const [mode, setMode] = useState("manual");
  const [form, setForm] = useState(SAMPLE);
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(0.4);

  // AI mode state
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem("jpa_gemini_key") || "";
    } catch {
      return "";
    }
  });
  const [aiJd, setAiJd] = useState("");
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [localStatus, setLocalStatus] = useState(null);
  const lastAutoJd = useRef("");

  const posterRef = useRef(null);
  const previewBoxRef = useRef(null);
  const fileRef = useRef(null);
  const secondaryFileRef = useRef(null);

  const templateId = form.templateId ?? DEFAULT_TEMPLATE_ID;
  const themeId = form.themeId ?? DEFAULT_THEME_ID;
  const palette = buildPalette(themeId, templateId);

  useEffect(() => {
    try {
      localStorage.setItem("jpa_gemini_key", apiKey);
    } catch {
      /* ignore */
    }
  }, [apiKey]);

  const posterData = useMemo(
    () => ({
      title: form.title.trim(),
      companyType: form.companyType.trim(),
      deadline: form.deadline.trim(),
      responsibilities: form.responsibilities.map((r) => r.trim()).filter(Boolean),
      requirements: form.requirements.map((r) => r.trim()).filter(Boolean),
      emails: parseEmails(form.emails),
      logoText: form.logoText.trim(),
      logoImage: form.logoImage,
      logoSecondaryText: (form.logoSecondaryText || "").trim(),
      logoSecondaryImage: form.logoSecondaryImage || "",
      graphic: form.graphic || "none",
      introText: (form.introText || "").trim(),
      badgeText: form.badgeText.trim(),
      respHeading: form.respHeading.trim(),
      reqHeading: form.reqHeading.trim(),
      noteText: form.noteText.trim(),
      showEco: form.showEco !== false,
      showLogos: form.showLogos !== false,
      showBadge: form.showBadge !== false,
      showIntro: form.showIntro !== false,
      showChip: form.showChip !== false,
      showDeadline: form.showDeadline !== false,
      showGraphic: form.showGraphic !== false,
      showCTA: form.showCTA !== false,
      showFooter: form.showFooter !== false,
      titleColor: (form.titleColor || "").trim(),
      ribbonColor: (form.ribbonColor || "").trim(),
      cardBg: (form.cardBg || "").trim(),
      footerColor: (form.footerColor || "").trim(),
    }),
    [form]
  );

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateListItem = (key, index, value) =>
    setForm((prev) => ({ ...prev, [key]: prev[key].map((item, i) => (i === index ? value : item)) }));

  const addListItem = (key) => setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));

  const removeListItem = (key, index) =>
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

  const clearAll = () =>
    setForm({
      ...SAMPLE,
      title: "",
      companyType: "",
      deadline: "",
      responsibilities: [""],
      requirements: [""],
      emails: "",
      logoText: "",
      badgeText: "We Are Hiring",
      respHeading: "Key Responsibilities",
      reqHeading: "Requirements",
      noteText: "Please mention the position applied for in the subject line.",
      templateId,
      themeId,
      layout: "split",
      logoPreset: "custom",
      logoSecondaryText: "",
      logoSecondaryImage: "",
      graphic: "magnifier",
      introText: "",
      showEco: true,
      showLogos: true,
      showBadge: true,
      showIntro: true,
      showChip: true,
      showDeadline: true,
      showGraphic: true,
      showCTA: true,
      showFooter: true,
      titleColor: "",
      ribbonColor: "",
      cardBg: "",
      footerColor: "",
    });

  const onLogoPreset = (preset) => {
    if (preset === "emc") setForm((p) => ({ ...p, logoPreset: "emc", logoText: "EMC", logoImage: "" }));
    else if (preset === "enroute") setForm((p) => ({ ...p, logoPreset: "enroute", logoText: "Enroute", logoImage: "" }));
    else if (preset === "image") setForm((p) => ({ ...p, logoPreset: "image" }));
    else setForm((p) => ({ ...p, logoPreset: "custom" }));
  };

  const onLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, logoImage: String(reader.result), logoPreset: "image" }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onSecondaryLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, logoSecondaryImage: String(reader.result) }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const applyExtract = (result, prev) => ({
    ...prev,
    title: result.title || prev.title,
    companyType: result.companyType || prev.companyType,
    deadline: result.deadline || prev.deadline,
    responsibilities: result.responsibilities.length ? result.responsibilities : prev.responsibilities,
    requirements: result.requirements.length ? result.requirements : prev.requirements,
    emails: result.emails.length ? result.emails.join(", ") : prev.emails,
    respHeading: result.respHeading || prev.respHeading,
    reqHeading: result.reqHeading || prev.reqHeading,
    introText: result.introText || prev.introText,
  });

  /* ── Live zero-API local parse: instantly populates fields as JD text changes ── */
  useEffect(() => {
    if (mode !== "ai") return;
    const jd = aiJd.trim();
    if (!jd) {
      setLocalStatus(null);
      return;
    }
    const timer = setTimeout(() => {
      if (jd === lastAutoJd.current) return; // already applied for this text
      lastAutoJd.current = jd;
      const result = extractJob(jd); // pure browser regex engine — no network, no rate limits
      setForm((prev) => applyExtract(result, prev));
      setLocalStatus({
        title: result.title || "—",
        bullets: result.responsibilities.length + result.requirements.length,
        emails: result.emails.length,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, aiJd]);

  /* ── AI extraction (optional Gemini, local parser fallback) ── */
  const runAiExtract = async () => {
    const jd = aiJd.trim();
    if (!jd) {
      setAiStatus({ kind: "error", text: "Paste a job description first." });
      return;
    }
    setAiBusy(true);
    setAiStatus(null);
    try {
      let result = null;
      let geminiErr = null;
      if (apiKey.trim()) {
        try {
          result = await geminiExtract(jd, apiKey.trim(), aiModel.trim() || "gemini-2.0-flash");
        } catch (err) {
          geminiErr = err.message;
        }
      }
      if (!result) result = extractJob(jd);

      if (!result || (!result.title && result.emails.length === 0 && result.responsibilities.length === 0)) {
        setAiStatus({ kind: "error", text: "Could not extract anything from that text." });
        return;
      }

      lastAutoJd.current = jd;
      setForm((prev) => applyExtract(result, prev));

      setAiStatus(
        result && !geminiErr && apiKey.trim()
          ? { kind: "ok", text: "Extracted with Gemini — switch to Manual mode to review and tweak." }
          : geminiErr
            ? { kind: "warn", text: `Gemini unavailable (${geminiErr}). Filled from the local parser instead.` }
            : { kind: "ok", text: "Filled from the local parser — add a Gemini API key for AI refinement." }
      );
    } catch (err) {
      setAiStatus({ kind: "error", text: `Extraction failed: ${err.message}` });
    } finally {
      setAiBusy(false);
    }
  };

  /* ── Preview scaling ── */
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(el.clientWidth / POSTER_WIDTH, el.clientHeight / POSTER_HEIGHT));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Export ── */
  const exportPng = useCallback(async () => {
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
        backgroundColor: palette.bgColor,
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
      alert("Export failed — please try again (see console for details).");
    } finally {
      setExporting(false);
    }
  }, [exporting, palette.bgColor, posterData.title]);

  const onHeadingChange = (kind, text) => set(kind === "resp" ? "respHeading" : "reqHeading", text);

  const listField = (key, label, placeholderPrefix) => (
    <div className="jp-field">
      <label>{label}</label>
      <div className="jp-list">
        {form[key].map((item, i) => (
          <div key={i} className="jp-list-row">
            <input
              type="text"
              value={item}
              onChange={(e) => updateListItem(key, i, e.target.value)}
              placeholder={`${placeholderPrefix} ${i + 1}`}
              className={inputClass}
            />
            <button
              type="button"
              className="jp-remove"
              onClick={() => removeListItem(key, i)}
              aria-label={`Remove ${placeholderPrefix.toLowerCase()} ${i + 1}`}
              disabled={form[key].length <= 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="jp-add" onClick={() => addListItem(key)}>
        + Add {placeholderPrefix}
      </button>
    </div>
  );

  return (
    <div className="jp-shell">
      <header className="jp-header">
        <div>
          <p className="jp-eyebrow">Free Tool · Manual + AI · Zero-API Local Parser</p>
          <h1 className="jp-title">Job Poster Generator</h1>
          <p className="jp-subtitle">
            Build a 1080×1350 recruitment poster — type it manually, or paste a JD and let the on-device parser
            instantly fill the fields (no API needed). Optional Gemini refinement, 4 accent themes, 6 templates, a
            side-by-side or stacked layout, then download a high-res PNG.
          </p>
        </div>
        <button className="jp-btn jp-btn-primary" onClick={exportPng} disabled={exporting}>
          {exporting ? "Rendering…" : "Download Poster PNG"}
        </button>
      </header>

      <div className="jp-layout">
        <aside className="jp-panel">
          {/* ── Mode toggle ── */}
          <div className="jp-mode-toggle" role="tablist" aria-label="Input mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "manual"}
              className={mode === "manual" ? "jp-mode-btn active" : "jp-mode-btn"}
              onClick={() => setMode("manual")}
            >
              Manual Form Mode
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "ai"}
              className={mode === "ai" ? "jp-mode-btn active" : "jp-mode-btn"}
              onClick={() => setMode("ai")}
            >
              AI Paste &amp; Extract Mode
            </button>
          </div>

          {mode === "ai" ? (
            /* ── AI mode ── */
            <div className="jp-form">
              <div className="jp-field">
                <label htmlFor="ai-jd">Paste Raw Job Description</label>
                <textarea
                  id="ai-jd"
                  value={aiJd}
                  onChange={(e) => setAiJd(e.target.value)}
                  rows={10}
                  spellCheck={false}
                  placeholder="Paste the raw job description here — the local parser fills the poster instantly as you paste…"
                  className={`${inputClass} jp-textarea`}
                />
                <button type="button" className="jp-sample" onClick={() => setAiJd(SAMPLE_JD)}>
                  Load sample JD
                </button>
              </div>

              {localStatus ? (
                <p className="jp-status ok">
                  Local parser applied instantly — title “{localStatus.title}” · {localStatus.bullets} bullet
                  points · {localStatus.emails} email{localStatus.emails === 1 ? "" : "s"} · 0 API calls
                </p>
              ) : null}

              <div className="jp-field">
                <label htmlFor="ai-key">
                  Gemini API Key <span className="jp-hint-inline">(optional)</span>
                </label>
                <input
                  id="ai-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza…  (stored only in your browser)"
                  className={inputClass}
                />
              </div>
              <div className="jp-field">
                <label htmlFor="ai-model">Model</label>
                <input
                  id="ai-model"
                  type="text"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  placeholder="gemini-2.0-flash"
                  className={inputClass}
                />
              </div>
              <button type="button" className="jp-btn jp-btn-primary jp-block" onClick={runAiExtract} disabled={aiBusy}>
                {aiBusy ? "Extracting…" : apiKey.trim() ? "Extract with Gemini" : "Re-parse with Local Engine"}
              </button>
              {aiStatus ? (
                <p className={`jp-status ${aiStatus.kind}`}>{aiStatus.text}</p>
              ) : (
                <p className="jp-hint">
                  The on-device parser never touches the network — no rate limits, no keys required. Add a key only if
                  you want Gemini refinement.
                </p>
              )}
            </div>
          ) : (
            /* ── Manual mode ── */
            <div className="jp-form">
              {/* Theme switcher */}
              <div className="jp-field">
                <label>Theme (accent color)</label>
                <div className="jp-themes">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      className={`jp-theme ${themeId === th.id ? "active" : ""}`}
                      onClick={() => set("themeId", th.id)}
                      aria-pressed={themeId === th.id}
                    >
                      <span className="jp-theme-dot" style={{ background: th.accent }} />
                      {th.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="jp-field">
                <label htmlFor="template">Template</label>
                <select
                  id="template"
                  value={templateId}
                  onChange={(e) => set("templateId", e.target.value)}
                  className={inputClass}
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="jp-field">
                <label>Card Layout</label>
                <div className="jp-layout-toggle" role="group" aria-label="Card layout">
                  <button
                    type="button"
                    className={form.layout === "split" ? "active" : ""}
                    onClick={() => set("layout", "split")}
                    aria-pressed={form.layout === "split"}
                  >
                    Side-by-Side 2-Column
                  </button>
                  <button
                    type="button"
                    className={form.layout === "stacked" ? "active" : ""}
                    onClick={() => set("layout", "stacked")}
                    aria-pressed={form.layout === "stacked"}
                  >
                    Stacked Full-Width Rows
                  </button>
                </div>
                <p className="jp-hint">Side-by-side suits short JDs; stacked rows fit long lists of bullets.</p>
              </div>

              {/* Company logo */}
              {/* ── Element toggles ── */}
              <div className="jp-field">
                <label>Elements on Poster</label>
                <div className="jp-checks">
                  {[
                    ["showEco", "Eco save block (top-left)"],
                    ["showLogos", "Company logos (top-right)"],
                    ["showBadge", "WE ARE HIRING badge"],
                    ["showIntro", "Intro phrase"],
                    ["showChip", "Company type chip"],
                    ["showDeadline", "Deadline ribbon / tile"],
                    ["showGraphic", "Recruitment graphic"],
                    ["showFooter", "PLEASE NOTE footer"],
                  ].map(([key, label]) => (
                    <label key={key} className="jp-check">
                      <input
                        type="checkbox"
                        checked={form[key] !== false}
                        onChange={(e) => set(key, e.target.checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <p className="jp-hint">Untick any element to remove it from the poster — nothing is locked.</p>
              </div>

              {/* ── Per-part custom colors ── */}
              <div className="jp-field">
                <label>
                  Custom Colors <span className="jp-hint-inline">(empty = template default)</span>
                </label>
                <div className="jp-color-grid">
                  {[
                    ["titleColor", "Title text"],
                    ["ribbonColor", "Deadline ribbon"],
                    ["cardBg", "Card backgrounds"],
                    ["footerColor", "Footer banner"],
                  ].map(([key, label]) => (
                    <div key={key} className="jp-color-row">
                      <input
                        type="color"
                        value={form[key] || "#1b3167"}
                        onChange={(e) => set(key, e.target.value)}
                        aria-label={label}
                      />
                      <span className="jp-color-label">{label}</span>
                      {form[key] ? (
                        <button type="button" className="jp-remove-sm" onClick={() => set(key, "")}>
                          ✕ reset
                        </button>
                      ) : (
                        <span className="jp-hint-inline">auto</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="jp-field">
                <label htmlFor="logo-preset">Company Logo (top-right)</label>
                <select
                  id="logo-preset"
                  value={form.logoPreset}
                  onChange={(e) => onLogoPreset(e.target.value)}
                  className={inputClass}
                >
                  <option value="enroute">Enroute</option>
                  <option value="emc">EMC</option>
                  <option value="custom">Custom text…</option>
                  <option value="image">Upload image…</option>
                </select>
                {form.logoPreset === "custom" ? (
                  <input
                    type="text"
                    value={form.logoText}
                    onChange={(e) => set("logoText", e.target.value)}
                    placeholder="Logo text, e.g. Your Brand"
                    className={inputClass}
                  />
                ) : null}
                {form.logoPreset === "image" ? (
                  <div className="jp-logo-row">
                    <button type="button" className="jp-btn jp-btn-ghost" onClick={() => fileRef.current?.click()}>
                      Choose Image
                    </button>
                    <span className="jp-hint-inline">PNG / JPG — image wins over text</span>
                  </div>
                ) : null}
                <input ref={fileRef} type="file" accept="image/*" onChange={onLogoUpload} hidden />
                {form.logoImage ? (
                  <div className="jp-logo-preview">
                    <img src={form.logoImage} alt="Logo preview" />
                    <button type="button" className="jp-remove-sm" onClick={() => set("logoImage", "")}>
                      ✕ Remove logo image
                    </button>
                  </div>
                ) : null}

                {/* Secondary / partner logo — displayed next to the primary logo */}
                <div className="jp-logo-row" style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    value={form.logoSecondaryText}
                    onChange={(e) => set("logoSecondaryText", e.target.value)}
                    placeholder="Partner logo text (optional, shown beside primary)"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    className="jp-btn jp-btn-ghost"
                    onClick={() => secondaryFileRef.current?.click()}
                  >
                    Upload Image
                  </button>
                  <input ref={secondaryFileRef} type="file" accept="image/*" onChange={onSecondaryLogoUpload} hidden />
                </div>
                {form.logoSecondaryImage ? (
                  <div className="jp-logo-preview">
                    <img src={form.logoSecondaryImage} alt="Partner logo preview" />
                    <button type="button" className="jp-remove-sm" onClick={() => set("logoSecondaryImage", "")}>
                      ✕ Remove partner logo image
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Recruitment graphic illustration */}
              <div className="jp-field">
                <label htmlFor="graphic">Recruitment Graphic</label>
                <select id="graphic" value={form.graphic} onChange={(e) => set("graphic", e.target.value)} className={inputClass}>
                  <option value="none">None</option>
                  <option value="magnifier">Magnifying Glass &amp; Candidate</option>
                  <option value="pen">Hand &amp; Pen (signature)</option>
                  <option value="desk">Professional Desk Setup</option>
                </select>
                <p className="jp-hint">Rendered beside the job title on the Corporate EMC Flyer template.</p>
              </div>

              <div className="jp-field">
                <label htmlFor="intro">Intro Phrase (above title)</label>
                <textarea
                  id="intro"
                  value={form.introText}
                  onChange={(e) => set("introText", e.target.value)}
                  rows={2}
                  placeholder="One of the country's leading conglomerates in the healthcare and education sectors is looking for"
                  className={`${inputClass} jp-textarea`}
                />
              </div>

              <div className="jp-field">
                <label htmlFor="title">Job Title</label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Executive — Talent Acquisition"
                  className={inputClass}
                />
              </div>

              <div className="jp-field">
                <label htmlFor="company">Company Type</label>
                <input
                  id="company"
                  type="text"
                  value={form.companyType}
                  onChange={(e) => set("companyType", e.target.value)}
                  placeholder="e.g. A Renowned Educational Institution"
                  className={inputClass}
                />
              </div>

              <div className="jp-field">
                <label htmlFor="deadline">Deadline</label>
                <input
                  id="deadline"
                  type="text"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  placeholder="e.g. URGENT or 15 September 2026"
                  className={inputClass}
                />
              </div>

              <div className="jp-field">
                <label htmlFor="badge">Header Badge Text</label>
                <input
                  id="badge"
                  type="text"
                  value={form.badgeText}
                  onChange={(e) => set("badgeText", e.target.value)}
                  placeholder="We Are Hiring"
                  className={inputClass}
                />
              </div>

              <div className="jp-grid-2">
                <div className="jp-field">
                  <label htmlFor="resp-heading">Responsibilities Heading</label>
                  <input
                    id="resp-heading"
                    type="text"
                    value={form.respHeading}
                    onChange={(e) => set("respHeading", e.target.value)}
                    placeholder="Key Responsibilities"
                    className={inputClass}
                  />
                </div>
                <div className="jp-field">
                  <label htmlFor="req-heading">Requirements Heading</label>
                  <input
                    id="req-heading"
                    type="text"
                    value={form.reqHeading}
                    onChange={(e) => set("reqHeading", e.target.value)}
                    placeholder="Requirements"
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="jp-hint">Tip: you can also click the section headings directly on the poster to edit them.</p>

              {listField("responsibilities", "Responsibilities", "Responsibility")}
              {listField("requirements", "Requirements", "Requirement")}

              <div className="jp-field">
                <label htmlFor="emails">Submission Emails</label>
                <input
                  id="emails"
                  type="text"
                  value={form.emails}
                  onChange={(e) => set("emails", e.target.value)}
                  placeholder="farhana@enroute.com.bd, support@enroute.com.bd"
                  className={inputClass}
                />
                <p className="jp-hint">Comma-separated. Shown in the info bar, CTA and PLEASE NOTE footer.</p>
              </div>

              <div className="jp-field">
                <label htmlFor="note">Submission Note (PLEASE NOTE section)</label>
                <textarea
                  id="note"
                  value={form.noteText}
                  onChange={(e) => set("noteText", e.target.value)}
                  rows={2}
                  placeholder="Please mention the position applied for in the subject line."
                  className={`${inputClass} jp-textarea`}
                />
              </div>

              <button type="button" className="jp-clear" onClick={clearAll}>
                Clear all fields
              </button>
            </div>
          )}
        </aside>

        {/* ── Right: preview + export ── */}
        <section className="jp-preview-col">
          <div className="jp-preview-head">
            <h2>Live Preview</h2>
            <div className="jp-meta">
              <span className="jp-badge">{getTheme(themeId).name}</span>
              <span className="jp-badge jp-badge-2">{getTemplate(templateId).name}</span>
              <span className="jp-badge jp-badge-2">
                {form.layout === "stacked" ? "Stacked Rows" : "2-Column Grid"}
              </span>
              <span className="jp-size">{POSTER_WIDTH} × {POSTER_HEIGHT} px · 4:5</span>
            </div>
          </div>

          <div ref={previewBoxRef} className="jp-preview-box">
            <div style={{ width: POSTER_WIDTH * scale, height: POSTER_HEIGHT * scale }} className="jp-canvas-wrap">
              <div
                style={{
                  width: POSTER_WIDTH,
                  height: POSTER_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <PosterCanvas
                  ref={posterRef}
                  data={posterData}
                  themeId={themeId}
                  templateId={templateId}
                  layout={form.layout ?? "split"}
                  onHeadingChange={onHeadingChange}
                />
              </div>
            </div>
          </div>

          <p className="jp-hint jp-center">
            Preview is scaled to fit your screen — the downloaded PNG is full-resolution (1080 × 1350).
          </p>
        </section>
      </div>
    </div>
  );
}
