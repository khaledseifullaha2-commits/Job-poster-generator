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
      <section className="relative overflow-hidden">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:py-24">
          <Reveal>
            <p className="hero-greeting">
              Hello, I&apos;m<span className="wave-hand">👋</span>
            </p>
            <h1 className="mt-3 font-serif text-5xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
              <span className="gradient-text">{site.name}</span>
            </h1>
            <p className="mt-5 min-h-[2rem] font-mono text-base text-accent-light sm:text-lg">
              <RoleTypewriter />
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">{site.heroSub}</p>
            <div className="mt-9 flex flex-wrap gap-4">
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
                  <p className="text-sm font-semibold text-white">{h.title}</p>
                  <p className="mt-1.5 text-sm text-muted">{h.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-10 text-center">
              <Link href="/about" className="nav-link inline-flex items-center gap-2 text-accent-light hover:text-white">
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
                  <h3 className="mb-2.5 font-semibold text-white">{service.title}</h3>
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
                      <p className="font-semibold text-white">{h.value}</p>
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
              <Image src="/about-photo.jpg" alt={`${site.name}, ${site.role}`} width={880} height={660} className="h-full w-full object-cover" />
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
