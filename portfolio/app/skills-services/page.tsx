import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import WaveDivider from "@/components/WaveDivider";
import MagneticButton from "@/components/MagneticButton";
import Link from "next/link";
import { site, bento, services } from "@/data/site";

export const metadata: Metadata = {
  title: "Skills & Services",
  description: `Core competencies, AI tools, and talent research services from ${site.name}, ${site.role}.`,
};

export default function SkillsServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-orb hero-orb-3" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-24">
          <Reveal>
            <p className="eyebrow">Capabilities</p>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
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

      {/* ─── Bento grid ─── */}
      <section className="section">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading title="What I Bring" />
          <div className="bento-grid">
            {bento.map((card, i) => (
              <Reveal key={card.title} delay={i * 60} className={`bento-card ${card.span ? "span-2" : ""}`}>
                <span className="bento-icon">{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
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
