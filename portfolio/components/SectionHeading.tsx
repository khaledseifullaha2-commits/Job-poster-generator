import Reveal from "./Reveal";

export default function SectionHeading({
  index,
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  return (
    <Reveal className={`flex flex-col ${alignCls} mb-14 max-w-2xl`}>
      {index ? <p className="section-index">{index}</p> : null}
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
    </Reveal>
  );
}
