"use client";

import { forwardRef } from "react";
import { Briefcase, CalendarDays, CheckCircle2, ListChecks, Mail, Send } from "lucide-react";
import type { ExtractedJob } from "@/lib/job-poster";

/**
 * The poster is a fixed 1080×1350 canvas (4:5, ready for LinkedIn / Facebook)
 * in a clean white + navy corporate palette. All styling is inline so
 * html-to-image captures it pixel-perfectly at export time — no Tailwind
 * utilities, no color-mix, no backdrop-filter.
 */

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1350;

const SERIF = `var(--font-serif), Georgia, serif`;
const SANS = `var(--font-sans), system-ui, sans-serif`;

interface PosterCanvasProps {
  data: ExtractedJob;
  brandName?: string;
  brandEmail?: string;
}

function titleSize(title: string): number {
  if (title.length > 46) return 42;
  if (title.length > 34) return 48;
  return 56;
}

function bulletSize(items: string[]): number {
  if (items.length <= 4) return 23;
  if (items.length <= 6) return 21;
  return 19;
}

const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(function PosterCanvas(
  { data, brandName = "Khaled Seifullaha", brandEmail = "khaledseifullaha@gmail.com" },
  ref
) {
  const { title, companyType, deadline, responsibilities, requirements } = data;
  const emails = data.emails.length > 0 ? data.emails : [brandEmail];
  const primaryEmail = emails[0];
  const extraEmails = emails.length - 1;

  const shownRespons = responsibilities.slice(0, 7);
  const shownReqs = requirements.slice(0, 7);
  const respExtra = responsibilities.length - shownRespons.length;
  const reqExtra = requirements.length - shownReqs.length;

  const bulletLines = Math.max(shownRespons.length, shownReqs.length);
  const bSize = bulletSize([...responsibilities, ...requirements]);

  return (
    <div
      ref={ref}
      style={{
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #ffffff 0%, #f2f6fc 100%)",
        fontFamily: SANS,
        boxShadow: "inset 0 0 0 1px rgba(30,58,138,0.08)",
      }}
    >
      {/* ── Decorative layers ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "linear-gradient(90deg, #1e3a8a, #2563eb 50%, #60a5fa)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -180,
          right: -140,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -220,
          left: -180,
          width: 540,
          height: 540,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(30,58,138,0.08), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(30,58,138,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          padding: "64px 72px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 12,
            padding: "12px 22px",
            borderRadius: 999,
            background: "#1e3a8a",
            boxShadow: "0 6px 18px rgba(30,58,138,0.28)",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#93c5fd",
              boxShadow: "0 0 12px rgba(147,197,253,0.9)",
            }}
          />
          <span
            style={{
              fontSize: 19,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            We Are Hiring
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            marginTop: 30,
            fontFamily: SERIF,
            fontSize: titleSize(title || "Job Title"),
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            color: "#0f2a5c",
          }}
        >
          {title || "Job Title"}
        </h1>

        {/* Company type chip */}
        {companyType ? (
          <div
            style={{
              marginTop: 24,
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 10,
              padding: "13px 22px",
              borderRadius: 16,
              background: "#eef2ff",
              border: "1px solid #c7d2fe",
            }}
          >
            <Briefcase size={20} color="#2563eb" />
            <span style={{ fontSize: 23, color: "#1e40af", fontWeight: 600 }}>{companyType}</span>
          </div>
        ) : null}

        {/* Info bar */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            alignItems: "center",
            padding: "24px 30px",
            borderRadius: 24,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 24px rgba(15,42,92,0.06)",
          }}
        >
          {deadline ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                    flexShrink: 0,
                  }}
                >
                  <CalendarDays size={26} color="#ffffff" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    Deadline
                  </div>
                  <div style={{ marginTop: 5, fontSize: 23, fontWeight: 700, color: "#0f2a5c" }}>{deadline}</div>
                </div>
              </div>
              <div style={{ width: 1, height: 52, background: "#e2e8f0", margin: "0 32px", flexShrink: 0 }} />
            </>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                flexShrink: 0,
              }}
            >
              <Mail size={26} color="#2563eb" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Apply Via
              </div>
              <div style={{ marginTop: 5, fontSize: 22, fontWeight: 700, color: "#0f2a5c", wordBreak: "break-all" }}>
                {primaryEmail}
                {extraEmails > 0 ? <span style={{ color: "#2563eb" }}> +{extraEmails} more</span> : null}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column sections */}
        <div
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
            flexGrow: 1,
            alignItems: "stretch",
          }}
        >
          {/* Responsibilities */}
          <div
            style={{
              borderRadius: 28,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(15,42,92,0.06)",
              padding: "34px 34px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#eef2ff",
                  border: "1px solid #c7d2fe",
                  flexShrink: 0,
                }}
              >
                <ListChecks size={25} color="#2563eb" />
              </div>
              <div style={{ fontSize: 17, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 800, color: "#0f2a5c" }}>
                Key Responsibilities
              </div>
            </div>
            {shownRespons.length === 0 ? (
              <div style={{ fontSize: 20, color: "#94a3b8", fontStyle: "italic" }}>Not provided in the JD</div>
            ) : (
              <div>
                {shownRespons.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#2563eb",
                        boxShadow: "0 0 8px rgba(37,99,235,0.45)",
                        marginTop: bulletLines > 6 ? 9 : 11,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: bSize, lineHeight: 1.5, color: "#475569" }}>{item}</span>
                  </div>
                ))}
                {respExtra > 0 ? (
                  <div style={{ fontSize: 17, color: "#2563eb", fontWeight: 700, marginTop: 2 }}>
                    … and {respExtra} more in the full JD
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div
            style={{
              borderRadius: 28,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(15,42,92,0.06)",
              padding: "34px 34px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#eef2ff",
                  border: "1px solid #c7d2fe",
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={25} color="#2563eb" />
              </div>
              <div style={{ fontSize: 17, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 800, color: "#0f2a5c" }}>
                Requirements
              </div>
            </div>
            {shownReqs.length === 0 ? (
              <div style={{ fontSize: 20, color: "#94a3b8", fontStyle: "italic" }}>Not provided in the JD</div>
            ) : (
              <div>
                {shownReqs.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#1e3a8a",
                        boxShadow: "0 0 8px rgba(30,58,138,0.45)",
                        marginTop: bulletLines > 6 ? 9 : 11,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: bSize, lineHeight: 1.5, color: "#475569" }}>{item}</span>
                  </div>
                ))}
                {reqExtra > 0 ? (
                  <div style={{ fontSize: 17, color: "#2563eb", fontWeight: 700, marginTop: 2 }}>
                    … and {reqExtra} more in the full JD
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA — emails shown prominently with an envelope icon */}
        <div style={{ marginTop: "auto", paddingTop: 40 }}>
          <div
            style={{
              borderRadius: 26,
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              padding: "30px 36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Ready to join us?
              </div>
              <div style={{ marginTop: 6, fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: "#ffffff" }}>
                Send your CV today
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 28px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.4)",
                }}
              >
                <Send size={22} color="#ffffff" />
                <span style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>Apply Now</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Mail size={18} color="#bfdbfe" />
                <span style={{ fontSize: 17, color: "#e0e7ff", fontWeight: 600, wordBreak: "break-all", textAlign: "right" }}>
                  {primaryEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 16, color: "#64748b" }}>
              {brandName} · Talent Acquisition
            </span>
            <span style={{ fontSize: 16, color: "#1d4ed8", fontWeight: 600 }}>AI-Powered Recruitment</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PosterCanvas;
