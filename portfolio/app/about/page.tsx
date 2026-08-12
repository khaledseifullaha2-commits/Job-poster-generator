import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import SectionHeading from "@/components/SectionHeading";
import WaveDivider from "@/components/WaveDivider";
import { site, about, education, certifications } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `Full bio, stats, and education of ${site.name}, ${site.role} in Dhaka, Bangladesh.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-orb hero-orb-2" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-24 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow">About Me</p>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Full bio &amp; <span className="gradient-text">credentials</span>
            </h1>
            {about.paragraphs.map((p, i) => (
              <p key={i} className="mt-5 leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal delay={120}>
            <div className="hero-photo-frame">
              <Image
                src="/hero-photo.jpg"
                alt={`${site.name}, ${site.role}`}
                width={880}
                height={660}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
        <WaveDivider />
      </section>

      {/* ─── Stats ─── */}
      <section className="section">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading title="Career Highlights" />
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {about.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="glass-card p-10 text-center">
                  <p className="font-mono text-5xl font-semibold text-accent-light">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-4 text-sm text-muted">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Education ─── */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            title="Academic Background"
            subtitle="A strong foundation in human resource management and business administration."
          />
          <div className="edu-grid">
            {education.map((edu, i) => (
              <Reveal key={edu.badge} delay={i * 80}>
                <div className="edu-card h-full">
                  <span className="edu-badge">{edu.badge}</span>
                  <h3>{edu.degree}</h3>
                  <p className="edu-school">{edu.school}</p>
                  <p className="edu-detail">{edu.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Certifications ─── */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            title="Certifications & Training"
            subtitle="Committed to staying sharp through professional training and AI-era skills."
          />
          <div className="cert-list">
            {certifications.map((cert, i) => (
              <Reveal key={cert} delay={i * 70} className="cert-item">
                <span className="cert-icon">✓</span>
                <span>{cert}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
