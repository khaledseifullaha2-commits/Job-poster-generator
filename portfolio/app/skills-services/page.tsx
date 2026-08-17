import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import WaveDivider from "@/components/WaveDivider";
import MagneticButton from "@/components/MagneticButton";
import BentoTile from "@/components/BentoTile";
import Link from "next/link";
import { site, bento, services, projects, stackStrip } from "@/data/site";

export const metadata: Metadata = {
  title: "Skills & Services",
  description: `Core competencies, AI tools, and talent research services from ${site.name}, ${site.role}.`,
};

/* 12-column spans: 8+4 / 4+4+4 / 6+6 */
const tileSpans: Record<string, number> = {
  "Talent Acquisition & Candidate Sourcing": 8,
  "Vibe Coder": 4,
  "AI-Assisted Research Tools": 4,
  "Stakeholder Management": 4,
  "HR Compliance & Documentation": 4,
  "Technical & Digital Tools": 6,
  "Professional Skills": 6,
};

export default function SkillsServicesPage() {
  const project = projects[0];
  const parts = [
    { k: "The Bottleneck", t: project.bottleneck },
    { k: "The Engineering Choice", t: project.choice },
    { k: "The Deliverable", t: project.deliverable },
    { k: "The Impact", t: project.impact },
  ];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-orb hero-orb-3" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-24">
          <Reveal>
            <p className="section-index">03 / Skills &amp; Services</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Skills &amp; <span className="gradient-text">Services</span>
            </h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-muted">
              A bento grid of core competencies, from full-cycle recruitment and stakeholder management to
              AI-assisted research tools.
            </p>
          </Reveal>
        </div>
        <WaveDivider />
      </section>

      {/* ─── Bento: Skills ─── */}
      <section className="section">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            index="01"
            title="What I Bring"
            subtitle="A 12-column bento of the competencies behind the work: sourcing, compliance, tools, and the AI-native habits I lean on daily."
          />
          <div className="bento12">
            {bento.map((card, i) => {
              const span = tileSpans[card.title] ?? 4;
              const isHero = card.span;
              return (
                <Reveal key={card.title} delay={i * 60} className={`span-${span}`}>
                  <BentoTile hero={isHero}>
                    {isHero && <div className="dot-grid" aria-hidden="true" />}
                    <div>
                      <span className="bento-icon">{card.icon}</span>
                      {isHero ? <p className="tile-meta">Core competency</p> : null}
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                    </div>
                    {card.title === "Technical & Digital Tools" ? (
                      <div className="stack-chips">
                        {stackStrip.map((t) => (
                          <span key={t} className="stack-chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </BentoTile>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Featured Work: case study ─── */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            index="02"
            title="Featured Work"
            subtitle="One shipped product, built to solve a real recruiting problem and used in Khaled's own workflow."
          />
          <Reveal>
            <article className="case-card" aria-label={project.name}>
              <div className="dot-grid" aria-hidden="true" />
              <div className="relative flex flex-wrap items-start justify-between gap-6">
                <div className="max-w-xl">
                  <p className="case-label">
                    {project.index} · Selected Project · Live at /job-poster
                  </p>
                  <h3 className="case-title">{project.name}</h3>
                  <p className="case-tagline">{project.tagline}</p>
                </div>
                <MagneticButton>
                  <Link href={project.href} className="btn btn-primary">
                    {project.cta} →
                  </Link>
                </MagneticButton>
              </div>

              <div className="case-parts">
                {parts.map((part, i) => (
                  <div key={part.k} className="case-part">
                    <p className="case-part-k">
                      {String(i + 1).padStart(2, "0")} · {part.k}
                    </p>
                    <p className="case-part-t">{part.t}</p>
                  </div>
                ))}
              </div>

              <div className="trust-strip marquee" aria-label="Stack and tools">
                <div className="marquee-track">
                  {[...stackStrip, ...stackStrip].map((t, i) => (
                    <span key={`${t}-${i}`} aria-hidden={i >= stackStrip.length}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            index="03"
            title="How I Can Help"
            subtitle="Clean, focused service offerings for hiring teams, delivered end-to-end."
          />
          <div className="services-grid">
            {services.map((service, i) => (
              <Reveal key={service.title} delay={i * 90}>
                <div className="glass-card service-card h-full">
                  <span className="service-icon">{service.icon}</span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="offer-callout">
              <p className="offer-callout-label">When to bring me in</p>
              <p className="offer-callout-text">
                High-volume sourcing, executive talent search, or modernizing HR workflows.
              </p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-14 text-center">
              <MagneticButton>
                <Link href="/contact" className="btn btn-primary">
                  Hire Me for Your Next Role
                </Link>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
