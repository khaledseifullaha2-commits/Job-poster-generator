import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ThreeDCard from "@/components/ThreeDCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import WaveDivider from "@/components/WaveDivider";
import MagneticButton from "@/components/MagneticButton";
import RoleTypewriter from "@/components/RoleTypewriter";
import { site, about, services } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} | ${site.role}`,
  description: site.description,
};

const highlights = [
  {
    icon: "🧭",
    title: about.highlights[0].title,
    value: about.highlights[0].description,
    href: "/about",
    label: "See career highlights",
  },
  {
    icon: "💼",
    title: "Career Journey",
    value: "Enroute International",
    href: "/experience",
    label: "See the timeline",
  },
  {
    icon: "🛠️",
    title: "Skills & Services",
    value: "Bento grid of competencies",
    href: "/skills-services",
    label: "Explore services",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden" aria-label="Introduction">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-20 lg:grid-cols-2 lg:pt-24">
          <div className="relative">
            <Reveal>
              <p className="hero-badge">
                <span className="status-dot" aria-hidden="true" />
                Executive Talent Specialist · Dhaka
              </p>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="hero-title mt-6">
                <span className="gradient-text">{site.name}</span>
                <br />
                Executive talent, sourced with intelligence.
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="hero-role mt-5">
                <RoleTypewriter />
              </p>
            </Reveal>
            <Reveal delay={210}>
              <p className="hero-sub mt-6">{site.heroSub}</p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <MagneticButton>
                  <Link href="/contact" className="btn btn-primary">
                    Let&apos;s Talk
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link href="/experience" className="btn btn-secondary">
                    View Experience
                  </Link>
                </MagneticButton>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <ThreeDCard />
          </Reveal>
        </div>
        <WaveDivider />
      </section>

      {/* ─── Quick about teaser ─── */}
      <section className="section" id="about-teaser">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            index="01"
            title="Talent Specialist with an AI Edge"
            subtitle={about.paragraphs[0]}
          />
          <Reveal delay={100}>
            <div className="highlight-strip mx-auto max-w-4xl">
              {about.highlights.map((h) => (
                <div key={h.title}>
                  <p className="text-sm font-semibold text-foreground">{h.title}</p>
                  <p className="mt-1.5 text-sm text-muted">{h.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-10 text-center">
              <Link
                href="/about"
                className="nav-link inline-flex items-center gap-2 text-accent-light hover:text-foreground"
              >
                Read the full story →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Quick highlights / services teaser ─── */}
      <section className="section pt-0">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            index="02"
            title="What I Offer"
            subtitle="Three core services delivered end-to-end, plus a full competency map on the Skills & Services page."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.title} delay={i * 90}>
                <div className="glass-card h-full p-8">
                  <span className="service-icon">{service.icon}</span>
                  <h3 className="mb-2.5 font-semibold text-foreground">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{service.text}</p>
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
            <div className="mt-16 text-center">
              <p className="section-index">03</p>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-0 grid gap-4 sm:grid-cols-3">
              {highlights.map((h) => (
                <Link
                  key={h.href}
                  href={h.href}
                  className="glass-card flex items-center justify-between gap-4 p-5 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{h.icon}</span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">{h.title}</p>
                      <p className="font-semibold text-foreground">{h.value}</p>
                    </div>
                  </div>
                  <span className="text-accent-light">{h.label} →</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── About photo band ─── */}
      <section className="relative overflow-hidden pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
          <Reveal>
            <div className="hero-photo-frame">
              <Image
                src="/about-photo.jpg"
                alt={`${site.name}, ${site.role}`}
                width={880}
                height={660}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="section-index">04</p>
            <h2 className="section-title">Human-first hiring, powered by AI tools</h2>
            <p className="mt-5 leading-relaxed text-muted">{about.paragraphs[1]}</p>
            <p className="mt-4 leading-relaxed text-muted">{about.paragraphs[2]}</p>
            <div className="mt-8">
              <MagneticButton>
                <Link href="/about" className="btn btn-primary">
                  More About Me
                </Link>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
