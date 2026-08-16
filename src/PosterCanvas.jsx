import React, { forwardRef, useEffect, useRef } from "react";
import { buildPalette } from "./templates.js";

/**
 * Fixed 1080×1350 poster canvas (4:5).
 *
 * Generic path (all non-corporate templates): eco-save icons (top-left) +
 * company logo cluster (top-right) + centered "WE ARE HIRING" badge + optional
 * intro phrase + job title + info bar + two content cards + CTA + footer.
 *
 * Corporate path ("Corporate EMC Flyer"): EMC reference style — crisp white bg
 * with simultaneous navy/red/green grading, red-bordered badge, green chevron
 * deadline ribbon, navy pill section headers, navy footer with red PLEASE NOTE
 * pill, two-tone navy/red title, and an optional recruitment illustration.
 *
 * Every element can be toggled off via data.show* flags, and the main colors
 * (title, deadline ribbon, card backgrounds, footer banner) can be overridden
 * per part via data.titleColor / data.ribbonColor / data.cardBg /
 * data.footerColor. Headings are editable in place (contentEditable) and
 * reported through `onHeadingChange`. All styling is inline so html-to-image
 * captures it pixel-perfectly.
 */

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1350;

const SERIF = `"Playfair Display", Georgia, serif`;
const SANS = `"Inter", system-ui, -apple-system, sans-serif`;

/* ── Tiny inline icons (no dependency) ── */

const Icon = ({ size = 24, color = "#fff", children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const PaperIcon = (p) => (
  <Icon {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
    <path d="M14 2v6h6M16 13H8M16 17H8" />
  </Icon>
);
const TreeIcon = (p) => (
  <Icon {...p}>
    <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 5 5 0 0 0-9.6-1.6A4 4 0 0 0 6 16.5" />
    <path d="M12 9v13M9 22h6" />
  </Icon>
);
const WaterIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2.7 6.3 8.4a6 6 0 1 0 11.4 0L12 2.7Z" />
  </Icon>
);
const BoltIcon = (p) => (
  <Icon {...p}>
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
  </Icon>
);
const BriefcaseIcon = (p) => (
  <Icon {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);
const CalendarIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Icon>
);
const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);
const ListIcon = (p) => (
  <Icon {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </Icon>
);
const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </Icon>
);
const SendIcon = (p) => (
  <Icon {...p}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </Icon>
);
const InfoIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </Icon>
);
const ClipboardIcon = (p) => (
  <Icon {...p}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6M9 16h4" />
  </Icon>
);
const UsersIcon = (p) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);
const PencilIcon = (p) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
);

/* ── Recruitment illustration graphics (inline SVG) ── */

const G_NAVY = "#1b3167";
const G_RED = "#e63946";
const G_GREEN = "#16a34a";
const G_BLUE = "#2563eb";
const G_LINE = "#cbd5e1";

/** Magnifying glass scanning a candidate with floating icons (EMC reference). */
const MagnifierGraphic = ({ width = 300 }) => (
  <svg width={width} height={width * 0.92} viewBox="0 0 330 304" fill="none" aria-hidden="true">
    <path d="M38 252 A 138 138 0 0 1 292 66" stroke={G_LINE} strokeWidth="2.5" strokeDasharray="6 7" />
    <g>
      <circle cx="52" cy="228" r="24" fill={G_GREEN} opacity="0.14" />
      <path d="M52 218c-3 0-5 2-5 4v1h10v-1c0-2-2-4-5-4Z" fill={G_GREEN} />
      <circle cx="47" cy="211" r="3.2" fill={G_GREEN} />
      <circle cx="57" cy="211" r="3.2" fill={G_GREEN} />
    </g>
    <g>
      <circle cx="96" cy="58" r="24" fill={G_RED} opacity="0.14" />
      <path d="M96 49c4 0 7 3 7 6 3 1 5 4 5 7l-2 4h-20l-2-4c0-3 2-6 5-7 0-3 3-6 7-6Z" fill={G_RED} />
      <path d="M96 38v4" stroke={G_RED} strokeWidth="3" strokeLinecap="round" />
    </g>
    <g>
      <circle cx="278" cy="110" r="24" fill={G_BLUE} opacity="0.14" />
      <circle cx="278" cy="110" r="9" stroke={G_BLUE} strokeWidth="3.5" />
      <circle cx="278" cy="110" r="3" fill={G_BLUE} />
    </g>
    <g>
      <circle cx="214" cy="40" r="24" fill="#eab308" opacity="0.16" />
      <path d="M214 28v24M202 40h24M205 33l18 18M223 33l-18 18" stroke="#ca8a04" strokeWidth="3.5" strokeLinecap="round" />
    </g>
    <g>
      <circle cx="30" cy="96" r="24" fill={G_BLUE} opacity="0.14" />
      <path d="M20 108h20M24 104l6-7 5 4 7-9 6 6" stroke={G_BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
    <circle cx="158" cy="150" r="70" stroke={G_NAVY} strokeWidth="12" fill="#ffffff" />
    <circle cx="158" cy="150" r="58" stroke={G_NAVY} strokeWidth="2" opacity="0.18" fill="none" />
    <circle cx="158" cy="128" r="22" fill={G_NAVY} />
    <path d="M112 200c0-36 20-52 46-52s46 16 46 52" fill={G_NAVY} />
    <path d="M118 196c0-30 17-44 40-44s40 14 40 44" fill={G_BLUE} opacity="0.28" />
    {[126, 142, 158, 174, 190].map((x) => (
      <path key={x} d={`M${x} 224l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z`} fill="#f59e0b" />
    ))}
    <rect x="112" y="240" width="92" height="6" rx="3" fill={G_LINE} />
    <rect x="130" y="252" width="56" height="5" rx="2.5" fill="#e2e8f0" />
    <line x1="210" y1="202" x2="252" y2="244" stroke={G_NAVY} strokeWidth="16" strokeLinecap="round" />
    <line x1="224" y1="216" x2="248" y2="240" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
  </svg>
);

/** Hand holding a pen drawing a signature / checkmark. */
const PenHandGraphic = ({ width = 280 }) => (
  <svg width={width} height={width * 0.72} viewBox="0 0 300 216" fill="none" aria-hidden="true">
    <path d="M66 162 L196 32 L228 64 L98 194 Z" fill={G_NAVY} />
    <rect x="120" y="130" width="36" height="70" rx="9" transform="rotate(-45 120 130)" fill={G_RED} />
    <path d="M52 186 q44 30 92 6" stroke={G_NAVY} strokeWidth="9" strokeLinecap="round" fill="none" />
    <path d="M128 208c-6-22 2-46 24-58 14 16 30 24 40 38 8 12 6 22-4 26-16 6-42 6-60-6Z" fill={G_BLUE} opacity="0.9" />
    <path d="M20 190 q40 -14 70 -4 t70 -4" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M226 60 l-16 18 12 10 26 -30" stroke={G_GREEN} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="268" cy="74" r="20" stroke={G_GREEN} strokeWidth="5" fill="none" />
  </svg>
);

/** Professional desk setup (monitor, keyboard, plant, mug). */
const DeskGraphic = ({ width = 300 }) => (
  <svg width={width} height={width * 0.62} viewBox="0 0 320 198" fill="none" aria-hidden="true">
    <rect x="24" y="22" width="168" height="104" rx="10" fill={G_NAVY} />
    <rect x="34" y="32" width="148" height="84" rx="4" fill="#0f1f4d" />
    <rect x="30" y="20" width="64" height="6" rx="3" fill={G_LINE} />
    <rect x="102" y="126" width="12" height="18" fill={G_NAVY} />
    <rect x="78" y="144" width="60" height="8" rx="4" fill={G_NAVY} />
    <circle cx="78" cy="66" r="12" fill={G_GREEN} />
    <rect x="100" y="52" width="64" height="8" rx="4" fill={G_RED} opacity="0.85" />
    <rect x="100" y="68" width="48" height="8" rx="4" fill={G_BLUE} opacity="0.8" />
    <rect x="100" y="84" width="56" height="8" rx="4" fill={G_LINE} />
    <rect x="16" y="162" width="150" height="24" rx="6" fill="#e2e8f0" stroke={G_LINE} strokeWidth="2" />
    <g fill={G_NAVY} opacity="0.55">
      <rect x="24" y="167" width="8" height="6" rx="1" />
      <rect x="36" y="167" width="8" height="6" rx="1" />
      <rect x="48" y="167" width="8" height="6" rx="1" />
      <rect x="60" y="167" width="8" height="6" rx="1" />
      <rect x="72" y="167" width="8" height="6" rx="1" />
      <rect x="84" y="167" width="8" height="6" rx="1" />
      <rect x="96" y="167" width="8" height="6" rx="1" />
      <rect x="108" y="167" width="8" height="6" rx="1" />
      <rect x="122" y="167" width="36" height="6" rx="1" />
    </g>
    <rect x="212" y="120" width="40" height="44" rx="8" fill={G_RED} opacity="0.9" />
    <path d="M252 130h10a8 8 0 0 1 0 24h-10" stroke={G_RED} strokeWidth="6" fill="none" />
    <path d="M222 136h20" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    <path d="M282 164 q-4 -28 4 -44 M282 164 q8 -24 22 -34 M282 164 q-12 -18 -20 -30" stroke={G_GREEN} strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M282 164 l-26 4 M282 164 l26 4" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
    <rect x="262" y="162" width="40" height="16" rx="6" fill="#f59e0b" />
    <rect x="10" y="186" width="300" height="8" rx="4" fill={G_NAVY} />
  </svg>
);

/* ── Helpers ── */

const EditableText = ({ value, onCommit, style }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);
  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Editable section heading"
      tabIndex={0}
      spellCheck={false}
      onInput={(e) => onCommit?.(e.currentTarget.textContent)}
      style={{ outline: "none", cursor: "text", ...style }}
    />
  );
};

function titleSize(title) {
  if (title.length > 46) return 40;
  if (title.length > 34) return 46;
  return 54;
}

function bulletSize(items) {
  if (items.length <= 4) return 22;
  if (items.length <= 6) return 20;
  return 18;
}

/** Split a title into two color spans: first half navy, second half red. */
function splitTitle(title) {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length < 2) return { a: title, b: "" };
  const mid = Math.ceil(words.length / 2);
  return { a: words.slice(0, mid).join(" "), b: words.slice(mid).join(" ") };
}

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb color. */
function shade(hex, amt) {
  const h = String(hex || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return hex;
  const num = parseInt(h, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${(((r << 16) | (g << 8) | b).toString(16)).padStart(6, "0")}`;
}

const ECO_ITEMS = [
  { key: "paper", label: "Save Paper", Icon: PaperIcon, tile: "#16a34a", text: "#15803d" },
  { key: "tree", label: "Save Tree", Icon: TreeIcon, tile: "#22c55e", text: "#16a34a" },
  { key: "water", label: "Save Water", Icon: WaterIcon, tile: "#0ea5e9", text: "#0284c7" },
  { key: "electricity", label: "Save Electricity", Icon: BoltIcon, tile: "#eab308", text: "#a16207" },
];

const GRAPHICS = {
  magnifier: MagnifierGraphic,
  pen: PenHandGraphic,
  desk: DeskGraphic,
};

const CORP = {
  navy: "#1b3167",
  navyDark: "#0a1128",
  red: "#e63946",
  redDark: "#b91c1c",
  green: "#16a34a",
  greenDark: "#14532d",
  blue: "#2563eb",
  light: "#f4f7fb",
  border: "#dbe1ea",
  body: "#2b2f36",
  label: "#64748b",
  white: "#ffffff",
};

const PosterCanvas = forwardRef(function PosterCanvas(
  { data, themeId, templateId, layout = "split", onHeadingChange },
  ref
) {
  const t = buildPalette(themeId, templateId);
  const inBanner = !!t.banner;
  const serifTitle = !!t.serifTitle;
  const stacked = layout === "stacked";
  const corp = !!t.corporate;
  const tHiring = !!t.hiring;
  const tDarkCard = !!t.darkCard;
  const tSplitDark = !!t.splitDark;
  const C = corp ? CORP : null;

  const title = (data.title || "").trim() || "Job Title";
  const introText = (data.introText || "").trim();
  const companyType = (data.companyType || "").trim();
  const deadline = (data.deadline || "").trim();
  const responsibilities = data.responsibilities || [];
  const requirements = data.requirements || [];
  const emails = data.emails || [];
  const primaryEmail = emails[0];
  const extraEmails = emails.length - 1;

  // Per-part toggles (default on) + per-part color overrides (default: template)
  const show = {
    eco: data.showEco !== false,
    logos: data.showLogos !== false,
    leftLogo: data.showLeftLogo !== false,
    badge: data.showBadge !== false,
    intro: data.showIntro !== false && !!introText,
    chip: data.showChip !== false,
    deadline: data.showDeadline !== false,
    graphic: data.showGraphic !== false,
    cta: data.showCTA !== false,
    footer: data.showFooter !== false,
  };
  const titleColor = (data.titleColor || "").trim();
  const ribbonColor = (data.ribbonColor || "").trim() || (C ? C.green : "#16a34a");
  const cardBgColor = (data.cardBg || "").trim();
  const footerColor = (data.footerColor || "").trim();

  // Stacked full-width rows have less vertical room per card — cap bullets lower.
  const maxPerCard = stacked ? 4 : 6;
  const rawSections =
    data.sections && data.sections.length
      ? data.sections
      : [
          { id: "resp", heading: data.respHeading || "Key Responsibilities", showHeading: true, fontSize: 0, bold: false, italic: false, bullets: responsibilities },
          { id: "req", heading: data.reqHeading || "Requirements", showHeading: true, fontSize: 0, bold: false, italic: false, bullets: requirements },
        ];
  const sections = rawSections.map((s) => ({
    id: s.id,
    heading: (s.heading || "").trim() || "Section",
    showHeading: s.showHeading !== false,
    fontSize: Math.max(8, Math.min(60, Number(s.fontSize) || 0)),
    bold: !!s.bold,
    italic: !!s.italic,
    bullets: (s.bullets || []).map((b) => String(b).trim()).filter(Boolean),
  }));
  const shownSections = sections.map((s) => ({
    ...s,
    shown: s.bullets.slice(0, maxPerCard),
    extra: Math.max(0, s.bullets.length - maxPerCard),
  }));
  const bulletLines = Math.max(0, ...shownSections.map((s) => s.shown.length));
  const bSize = bulletSize(sections.flatMap((s) => s.bullets));

  const markerGlow = (color) => (t.neon ? `0 0 12px ${color}` : `0 0 8px ${color}66`);

  const graphicType = GRAPHICS[data.graphic] ? data.graphic : null;
  const Graphic = graphicType ? GRAPHICS[graphicType] : null;

  /* ── Header pieces ── */

  const ecoBlock = corp ? (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {ECO_ITEMS.map(({ key, Icon: EIcon, tile }) => (
          <div
            key={key}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: tile,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35)",
            }}
          >
            <EIcon size={16} color="#ffffff" />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
        {ECO_ITEMS.map(({ key, label, text }) => (
          <span key={key} style={{ fontSize: 10.5, fontWeight: 800, color: text, lineHeight: 1.15, whiteSpace: "nowrap" }}>
            {label.toUpperCase()}
          </span>
        ))}
        <span style={{ fontSize: 8.5, fontWeight: 700, color: C.label, letterSpacing: "0.02em", marginTop: 1 }}>
          FOR BETTER TOMORROW!
        </span>
      </div>
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 16,
        background: t.banner ? "rgba(255,255,255,0.14)" : t.cardBg,
        border: t.banner ? "1px solid rgba(255,255,255,0.35)" : `1px solid ${t.cardBorder}`,
        boxShadow: t.banner ? "none" : "0 4px 14px rgba(15,23,42,0.05)",
      }}
    >
      {ECO_ITEMS.map(({ key, label, Icon: EIcon }) => (
        <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: t.banner ? "rgba(255,255,255,0.18)" : t.ecoIconBg,
              border: t.banner ? "none" : `1px solid ${t.accentBorder}`,
            }}
          >
            <EIcon size={18} color={t.banner ? "#ffffff" : t.ecoIcon} />
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: t.banner ? "rgba(255,255,255,0.92)" : t.ecoLabel,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );

  const singleLogo = (text, image, fontSize, maxW, maxH, color, align = "flex-end") => {
    if (image) {
      return (
        <img
          src={image}
          alt="Company logo"
          style={{ maxWidth: maxW, maxHeight: maxH, objectFit: "contain", display: "block" }}
        />
      );
    }
    if (!(text || "").trim()) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: align }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
            color: corp ? C.navy : tSplitDark || tDarkCard ? "#ffffff" : color,
            letterSpacing: "0.02em",
          }}
        >
          {text.trim()}
        </div>
        <div
          style={{
            width: "100%",
            height: 3,
            marginTop: 6,
            borderRadius: 2,
            background: corp ? C.red : tSplitDark || tDarkCard ? "rgba(255,255,255,0.5)" : t.ctaGradient,
          }}
        />
      </div>
    );
  };

  const logoCluster = (() => {
    const primary = singleLogo(data.logoText, data.logoImage, 34, 220, 72, t.accent);
    const secondary = singleLogo(data.logoSecondaryText, data.logoSecondaryImage, 24, 170, 52, t.label);
    if (!primary && !secondary) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {primary ? <div>{primary}</div> : null}
        {primary && secondary ? (
          <div style={{ width: 1, height: 46, background: corp ? "rgba(27,49,103,0.2)" : t.cardBorder }} />
        ) : null}
        {secondary ? <div>{secondary}</div> : null}
      </div>
    );
  })();

  const leftLogo =
    show.leftLogo && (data.leftLogoText || data.leftLogoImage)
      ? singleLogo(data.leftLogoText, data.leftLogoImage, 32, 200, 66, t.accent, "flex-start")
      : null;

  const headerRow = (() => {
    const left = show.eco ? ecoBlock : null;
    const right = show.logos ? logoCluster : null;
    if (!leftLogo && !left && !right) return null;
    const leftCluster =
      leftLogo || left ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {leftLogo ? <div>{leftLogo}</div> : null}
          {leftLogo && left ? (
            <div style={{ width: 1, height: 46, background: corp ? "rgba(27,49,103,0.2)" : t.cardBorder }} />
          ) : null}
          {left ? left : null}
        </div>
      ) : null;
    return (
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        {leftCluster || <span />}
        {right ? (
          <div style={{ minWidth: 180, minHeight: 58, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            {right}
          </div>
        ) : null}
      </div>
    );
  })();

  const badge = corp ? (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 30px",
          borderRadius: 999,
          background: C.white,
          border: `2.5px solid ${C.red}`,
          boxShadow: `0 8px 24px rgba(230,57,70,0.16)`,
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: C.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BriefcaseIcon size={20} color="#ffffff" />
        </span>
        <span
          style={{
            fontSize: 21,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 800,
            color: C.navyDark,
          }}
        >
          {(data.badgeText || "").trim() || "We Are Hiring"}
        </span>
      </div>
    </div>
  ) : tHiring ? (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
      <div
        style={{
          transform: "rotate(-2deg)",
          background: "linear-gradient(135deg, #111827, #1f2937)",
          borderRadius: 14,
          padding: "13px 42px",
          boxShadow: "0 12px 30px rgba(17,24,39,0.28)",
          border: "2px solid rgba(255,255,255,0.6)",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#f59e0b",
            boxShadow: "0 0 10px #f59e0b",
          }}
        />
        <span
          style={{
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          {(data.badgeText || "").trim() || "We're Hiring"}
        </span>
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 34px",
          borderRadius: 999,
          background: t.banner ? "rgba(255,255,255,0.94)" : t.badgeBg,
          border: t.banner ? "2px solid rgba(255,255,255,0.9)" : "2px solid rgba(255,255,255,0.35)",
          boxShadow: `0 8px 24px ${t.accent}30`,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: t.banner ? t.accent : "#ffffff",
            boxShadow: t.banner ? "none" : "0 0 10px rgba(255,255,255,0.9)",
          }}
        />
        <span
          style={{
            fontSize: 21,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            fontWeight: 800,
            color: t.banner ? t.accent : t.badgeText,
          }}
        >
          {(data.badgeText || "").trim() || "We Are Hiring"}
        </span>
      </div>
    </div>
  );

  const introBlock = show.intro ? (
    <p
      style={{
        marginTop: 24,
        textAlign: "center",
        fontSize: 17,
        fontWeight: 600,
        lineHeight: 1.5,
        color: corp ? C.label : t.banner ? "rgba(255,255,255,0.85)" : t.label,
        maxWidth: 780,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {introText}
    </p>
  ) : null;

  const titleBlock = corp
    ? titleColor
      ? (
          <h1
            style={{
              marginTop: 20,
              textAlign: "center",
              fontFamily: SANS,
              fontSize: titleSize(title),
              fontWeight: 800,
              lineHeight: 1.14,
              letterSpacing: "-0.01em",
              color: titleColor,
            }}
          >
            {title}
          </h1>
        )
      : (() => {
          const { a, b } = splitTitle(title);
          return (
            <h1
              style={{
                marginTop: 20,
                textAlign: "center",
                fontFamily: SANS,
                fontSize: titleSize(title),
                fontWeight: 800,
                lineHeight: 1.14,
                letterSpacing: "-0.01em",
              }}
            >
              <span style={{ color: C.navyDark }}>{a}</span>
              {b ? <span style={{ color: C.red }}> {b}</span> : null}
            </h1>
          );
        })()
    : (
        <h1
          style={{
            marginTop: 24,
            textAlign: "center",
            fontFamily: serifTitle ? SERIF : SANS,
            fontSize: titleSize(title),
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            color: titleColor || (t.banner ? "#ffffff" : t.title),
          }}
        >
          {title}
        </h1>
      );

  const chipBlock = companyType ? (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 24px",
          borderRadius: 16,
          background: corp ? C.light : t.banner ? "rgba(255,255,255,0.16)" : t.chipBg,
          border: corp ? `1px solid ${C.border}` : t.banner ? "1px solid rgba(255,255,255,0.45)" : t.borderless ? "none" : `1px solid ${t.chipBorder}`,
        }}
      >
        <BriefcaseIcon size={20} color={corp ? C.navy : t.banner ? "#ffffff" : t.tileBIcon} />
        <span style={{ fontSize: 22, color: corp ? C.navy : t.banner ? "#ffffff" : t.chipText, fontWeight: 700 }}>
          {companyType}
        </span>
      </div>
    </div>
  ) : null;

  /* ── Deadline: green chevron ribbon (corporate only) ── */
  const deadlineRibbon = corp && show.deadline ? (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "0 26px 0 10px",
          borderRadius: 14,
          background: `linear-gradient(90deg, ${shade(ribbonColor, -42)}, ${ribbonColor})`,
          clipPath: "polygon(0 0, 100% 0, calc(100% - 20px) 50%, 100% 100%, 0 100%)",
          boxShadow: `0 10px 26px ${shade(ribbonColor, -42)}38`,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: shade(ribbonColor, -55),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "8px 0",
          }}
        >
          <CalendarIcon size={22} color="#ffffff" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", letterSpacing: "0.14em", textTransform: "uppercase", paddingTop: 8 }}>
          {deadline ? `Deadline: ${deadline}` : "Deadline: URGENT"}
        </span>
        <span style={{ width: 20, height: 1 }} />
      </div>
    </div>
  ) : null;

  const infoBar = (
    <div
      style={{
        marginTop: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "20px 40px",
        padding: "22px 30px",
        borderRadius: 24,
        background: t.infoBg,
        border: t.infoBorder === "none" ? "none" : `1px solid ${t.infoBorder}`,
        boxShadow: t.infoShadow === "none" ? "none" : t.infoShadow,
      }}
    >
      {show.deadline && deadline ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: t.tileA,
              flexShrink: 0,
            }}
          >
            <CalendarIcon size={24} color={t.tileAIcon} />
          </div>
          <div>
            <div style={{ fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: t.label }}>
              Deadline
            </div>
            <div style={{ marginTop: 4, fontSize: 21, fontWeight: 800, color: t.value }}>{deadline}</div>
          </div>
        </div>
      ) : null}
      {show.deadline && deadline && emails.length > 0 ? (
        <div style={{ width: 1, height: 44, background: t.infoBorder === "none" ? "#e2e8f0" : t.infoBorder }} />
      ) : null}
      {emails.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: t.tileB,
              border: t.tileBBorder === "none" ? "none" : `1px solid ${t.tileBBorder}`,
              flexShrink: 0,
            }}
          >
            <MailIcon size={24} color={t.tileBIcon} />
          </div>
          <div>
            <div style={{ fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: t.label }}>
              Apply Via
            </div>
            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 800, color: t.value, wordBreak: "break-all" }}>
              {primaryEmail}
              {extraEmails > 0 ? <span style={{ color: t.tileBIcon }}> +{extraEmails} more</span> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  /* ── Section cards ── */
  const cardBase = {
    borderRadius: t.borderless ? 24 : 26,
    background: cardBgColor || t.cardBg,
    border: t.borderless ? "none" : `1px solid ${t.cardBorder}`,
    boxShadow: t.borderless ? "none" : t.cardShadow,
    padding: stacked ? "24px 28px" : t.borderless ? "26px 26px" : "30px 30px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const sectionKind = (idx) => (idx === 0 ? "resp" : idx === 1 ? "req" : idx % 2 === 0 ? "resp" : "req");

  const sectionHeader = (s, idx) => {
    if (s.showHeading === false) return null;
    const kind = sectionKind(idx);
    return corp ? (
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: stacked ? 16 : 22 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: C.navy,
            borderRadius: 999,
            padding: "11px 24px",
            boxShadow: "0 8px 20px rgba(27,49,103,0.28)",
          }}
        >
          {kind === "resp" ? <ClipboardIcon size={19} color="#ffffff" /> : <UsersIcon size={19} color="#ffffff" />}
          <EditableText
            value={s.heading}
            onCommit={(text) => onHeadingChange?.(s.id, text)}
            style={{
              fontSize: 15.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.2,
            }}
          />
        </div>
        <div style={{ flex: 1, height: 2, background: C.border, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              right: 0,
              top: -3,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.red,
            }}
          />
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: stacked ? 16 : 22 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: t.tileB,
            border: t.tileBBorder === "none" ? "none" : `1px solid ${t.tileBBorder}`,
            flexShrink: 0,
          }}
        >
          {kind === "resp" ? <ListIcon size={23} color={t.tileBIcon} /> : <CheckIcon size={23} color={t.tileBIcon} />}
        </div>
        <EditableText
          value={s.heading}
          onCommit={(text) => onHeadingChange?.(s.id, text)}
          style={{
            fontSize: 16,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 800,
            color: t.sectionHeader,
            lineHeight: 1.2,
          }}
        />
      </div>
    );
  };

  const bulletList = (items, kind, extra, s) => (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 14 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: kind === "resp" ? t.markerA : t.markerB,
              boxShadow: markerGlow(kind === "resp" ? t.markerA : t.markerB),
              marginTop: bulletLines > 5 ? 9 : 11,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: s && s.fontSize > 0 ? s.fontSize : bSize,
              lineHeight: 1.5,
              color: t.body,
              fontWeight: s && s.bold ? 700 : 400,
              fontStyle: s && s.italic ? "italic" : "normal",
            }}
          >
            {item}
          </span>
        </div>
      ))}
      {extra > 0 ? (
        <div style={{ fontSize: 16, color: t.tileBIcon, fontWeight: 700, marginTop: 2 }}>
          … and {extra} more in the full JD
        </div>
      ) : null}
    </div>
  );

  const sectionCard = (s, idx) => (
    <div key={s.id} style={cardBase}>
      {sectionHeader(s, idx)}
      {s.shown.length === 0 ? (
        <div style={{ fontSize: 19, color: t.label, fontStyle: "italic" }}>Not provided</div>
      ) : (
        bulletList(s.shown, sectionKind(idx), s.extra, s)
      )}
    </div>
  );

  /* ── Footer: navy bar with red PLEASE NOTE (corporate) vs white box (generic) ── */
  const pleaseNote = corp ? (
    <div
      style={{
        marginTop: 20,
        borderRadius: 22,
        background: footerColor
          ? `linear-gradient(90deg, ${shade(footerColor, -35)}, ${footerColor})`
          : `linear-gradient(90deg, ${C.navyDark}, ${C.navy})`,
        padding: "24px 30px",
        display: "flex",
        alignItems: "center",
        gap: 26,
        boxShadow: "0 14px 34px rgba(10,17,40,0.28)",
      }}
    >
      <div style={{ minWidth: 210 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: C.red,
            color: "#ffffff",
            padding: "9px 20px",
            borderRadius: 999,
            fontSize: 15,
            letterSpacing: "0.18em",
            fontWeight: 800,
            boxShadow: "0 6px 16px rgba(230,57,70,0.4)",
          }}
        >
          <InfoIcon size={16} color="#ffffff" />
          Please Note
        </span>
        <p style={{ margin: "12px 0 0", fontSize: 15.5, lineHeight: 1.45, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
          Email your updated resume at:
        </p>
      </div>
      <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.22)" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {emails.slice(0, 3).map((email, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MailIcon size={15} color="#ffffff" />
            </span>
            <span style={{ fontSize: 18.5, fontWeight: 800, color: "#ffffff", wordBreak: "break-all" }}>{email}</span>
          </span>
        ))}
        {emails.length === 0 ? (
          <span style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>No submission email set</span>
        ) : null}
      </div>
      <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.22)" }} />
      <div style={{ maxWidth: 300 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: "rgba(255,255,255,0.92)",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: C.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PencilIcon size={17} color="#ffffff" />
          </span>
          {data.noteText || "Mention applied position in MAIL SUBJECT."}
        </span>
      </div>
    </div>
  ) : (
    <div
      style={{
        marginTop: 20,
        borderRadius: 22,
        border: `1px solid ${t.cardBorder}`,
        background: footerColor || t.cardBg,
        padding: "20px 28px",
        boxShadow: t.borderless ? "none" : "0 6px 20px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: t.pleaseNoteBg,
            color: t.pleaseNoteText,
            border: `1px solid ${t.accentBorder}`,
            padding: "7px 16px",
            borderRadius: 999,
            fontSize: 15,
            letterSpacing: "0.2em",
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          <InfoIcon size={16} color={t.pleaseNoteText} />
          Please Note
        </span>
        <div style={{ flex: 1, height: 1, background: t.cardBorder }} />
      </div>
      <p style={{ margin: "13px 0 0", fontSize: 18, lineHeight: 1.55, color: t.body }}>
        {data.noteText || "Please mention the position applied for in the subject line."}
      </p>
      {emails.length > 0 ? (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: "10px 28px" }}>
          {emails.slice(0, 4).map((email, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <MailIcon size={17} color={t.accent} />
              <span style={{ fontSize: 18, fontWeight: 700, color: t.accent, wordBreak: "break-all" }}>{email}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );

  const cta = (
    <div
      style={{
        borderRadius: 24,
        background: t.ctaGradient,
        padding: "26px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        boxShadow: t.neon ? `0 0 44px ${t.accentLight}38` : "0 10px 30px rgba(0,0,0,0.12)",
      }}
    >
      <div>
        <div style={{ fontSize: 14, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 800, color: "rgba(255,255,255,0.78)" }}>
          Ready to join us?
        </div>
        <div style={{ marginTop: 5, fontFamily: serifTitle ? SERIF : SANS, fontSize: 27, fontWeight: 800, color: t.ctaText }}>
          Send your CV today
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 26px",
            borderRadius: 15,
            background: t.ctaSoft,
            border: `1px solid ${t.ctaSoftBorder}`,
          }}
        >
          <SendIcon size={20} color={t.ctaText} />
          <span style={{ fontSize: 20, fontWeight: 800, color: t.ctaText }}>Apply Now</span>
        </div>
        {primaryEmail ? (
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.88)", fontWeight: 600, wordBreak: "break-all", textAlign: "right" }}>
            {primaryEmail}
          </span>
        ) : null}
      </div>
    </div>
  );

  /* ── Corporate layout: centered header, badge, intro, title, ribbon+graphic row ── */
  const corporateContent = (
    <>
      {headerRow}
      {show.badge ? badge : null}
      {introBlock}
      {titleBlock}
      {show.chip ? chipBlock : null}
      <div
        style={{
          marginTop: 26,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 44,
          flexWrap: "wrap",
        }}
      >
        {deadlineRibbon}
        {show.graphic && Graphic ? (
          <div style={{ flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <Graphic width={graphicType === "desk" ? 300 : 280} />
          </div>
        ) : null}
      </div>
      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: stacked ? "1fr" : "1fr 1fr",
          gap: stacked ? 18 : 26,
          flexGrow: 1,
          alignItems: "stretch",
        }}
      >
        {shownSections.length === 0 ? (
          <div style={cardBase}>
            <div style={{ fontSize: 19, color: t.label, fontStyle: "italic" }}>
              Add sections in the left panel to build the poster.
            </div>
          </div>
        ) : (
          shownSections.map((s, idx) => sectionCard(s, idx))
        )}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 30 }}>{show.footer ? pleaseNote : null}</div>
    </>
  );

  /* ── Generic layout (all other templates) ── */
  const genericContent = (() => {
    const cardsGrid = (
      <div
        style={{
          marginTop: 34,
          display: "grid",
          gridTemplateColumns: stacked ? "1fr" : "1fr 1fr",
          gap: stacked ? 18 : t.borderless ? 16 : 26,
          flexGrow: 1,
          alignItems: "stretch",
        }}
      >
        {shownSections.length === 0 ? (
          <div style={cardBase}>
            <div style={{ fontSize: 19, color: t.label, fontStyle: "italic" }}>
              Add sections in the left panel to build the poster.
            </div>
          </div>
        ) : (
          shownSections.map((s, idx) => sectionCard(s, idx))
        )}
      </div>
    );

    const bottom = (
      <div style={{ marginTop: "auto", paddingTop: 30 }}>
        {show.cta ? cta : null}
        {show.footer ? pleaseNote : null}
      </div>
    );

    const head = (
      <>
        {show.badge ? badge : null}
        {introBlock}
        {titleBlock}
        {show.chip ? chipBlock : null}
        {infoBar}
      </>
    );

    if (tDarkCard) {
      // Flyer 6 style: everything sits on a centered white card over a dark page.
      return (
        <>
          {headerRow}
          <div
            style={{
              background: cardBgColor || "#ffffff",
              borderRadius: 30,
              padding: "36px 40px 34px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
              marginTop: 30,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {head}
            {cardsGrid}
            {bottom}
          </div>
        </>
      );
    }

    if (inBanner) {
      return (
        <>
          <div
            style={{
              margin: "-54px -64px 0",
              padding: "46px 64px 54px",
              borderRadius: "0 0 44px 44px",
              background: t.bandGradient,
              boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
            }}
          >
            {headerRow}
            {show.badge ? badge : null}
            {introBlock}
            {titleBlock}
            {show.chip ? chipBlock : null}
          </div>
          {infoBar}
          {cardsGrid}
          {bottom}
        </>
      );
    }

    return (
      <>
        {headerRow}
        {head}
        {cardsGrid}
        {bottom}
      </>
    );
  })();

  return (
    <div
      ref={ref}
      style={{
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        position: "relative",
        overflow: "hidden",
        background: t.bg,
        fontFamily: SANS,
        boxShadow: "inset 0 0 0 1px rgba(15,42,92,0.06)",
      }}
    >
      {t.showTopBar ? (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: t.bandGradient, zIndex: 2 }} />
      ) : null}

      {t.glowA !== "transparent" ? (
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${t.glowA}, transparent 70%)`,
            filter: "blur(70px)",
          }}
        />
      ) : null}
      {t.glowB !== "transparent" ? (
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -180,
            width: 540,
            height: 540,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${t.glowB}, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
      ) : null}

      {t.gridLines ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)",
            backgroundSize: "90px 90px",
          }}
        />
      ) : null}

      {tSplitDark ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "40%",
            background: "linear-gradient(165deg, #16244d 0%, #0f1b3d 100%)",
            clipPath: "polygon(26% 0, 100% 0, 100% 100%, 8% 100%)",
            zIndex: 0,
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${t.dots} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          padding: "54px 64px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {corp ? corporateContent : genericContent}
      </div>
    </div>
  );
});

export default PosterCanvas;
