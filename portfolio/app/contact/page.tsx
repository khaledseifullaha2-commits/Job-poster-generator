import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import WaveDivider from "@/components/WaveDivider";
import MagneticButton from "@/components/MagneticButton";
import { site, contactLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}, ${site.role}. Email, phone, LinkedIn, and location in Dhaka, Bangladesh.`,
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-orb hero-orb-2" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-24">
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Let&apos;s <span className="gradient-text">Connect</span>
            </h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-muted">
              Open to talent acquisition opportunities, HR collaborations, and networking. Reach out through any
              channel below, and I usually respond quickly.
            </p>
          </Reveal>
        </div>
        <WaveDivider />
      </section>

      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 md:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              title="Contact Options"
              subtitle="Pick whichever channel works best for you."
            />
            <div className="contact-links">
              {contactLinks.map((link, i) => (
                <Reveal key={link.label} delay={i * 80} as="div">
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="contact-link"
                  >
                    <span className="contact-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              align="left"
              title="Send a Direct Message"
              subtitle="I'll get back to you as soon as I can."
            />
            <Reveal delay={80}>
              <div className="glass-card p-8">
                <p className="mb-6 leading-relaxed text-muted">
                  The fastest way to reach me is a direct email. Tell me about your hiring needs, an opportunity,
                  or just say hello.
                </p>
                <div className="flex flex-wrap gap-4">
                  <MagneticButton>
                    <a href={`mailto:${site.email}`} className="btn btn-primary">
                      ✉️ {site.email}
                    </a>
                  </MagneticButton>
                  <MagneticButton>
                    <a
                      href={site.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      💼 LinkedIn
                    </a>
                  </MagneticButton>
                </div>
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="eyebrow">📍 Location</p>
                  <p className="mt-2 leading-relaxed text-muted">{site.location}</p>
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-accent-light transition-colors hover:text-white"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
