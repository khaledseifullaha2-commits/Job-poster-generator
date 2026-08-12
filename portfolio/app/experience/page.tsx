import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import WaveDivider from "@/components/WaveDivider";
import { site, experience } from "@/data/site";

export const metadata: Metadata = {
  title: "Experience",
  description: `Career timeline of ${site.name}, ${site.role} at Enroute International Limited, Dhaka.`,
};

export default function ExperiencePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-orb hero-orb-1" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-24">
          <Reveal>
            <p className="section-index">02 / Experience</p>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
              My <span className="gradient-text">Journey</span>
            </h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-muted">
              A focused, growing career in talent acquisition, currently supporting end-to-end recruitment at
              Enroute International Limited.
            </p>
          </Reveal>
        </div>
        <WaveDivider />
      </section>

      <section className="section">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading index="01" title="Professional Experience" />
          <div className="timeline">
            {experience.map((job, i) => (
              <Reveal key={job.role} delay={i * 100} className="timeline-item">
                <span className="timeline-dot" aria-hidden="true" />
                <div className="timeline-card">
                  <p className="timeline-date">{job.date}</p>
                  <h3>{job.role}</h3>
                  <p className="timeline-company">
                    {job.company} · {job.location}
                  </p>
                  <ul>
                    {job.responsibilities.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
