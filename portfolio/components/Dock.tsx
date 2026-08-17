"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserIcon,
  BriefcaseIcon,
  StarIcon,
  MailIcon,
  type IconProps,
} from "./Icons";

const items: { href: string; label: string; Icon: (p: IconProps) => React.JSX.Element }[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/about", label: "About", Icon: UserIcon },
  { href: "/experience", label: "Experience", Icon: BriefcaseIcon },
  { href: "/skills-services", label: "Skills", Icon: StarIcon },
  { href: "/contact", label: "Contact", Icon: MailIcon },
];

export default function Dock() {
  const pathname = usePathname();
  const rowRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const row = rowRef.current;
    if (!row) return;
    const items = row.querySelectorAll<HTMLElement>(".dock-item");
    items.forEach((item) => {
      const r = item.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const dist = Math.abs(e.clientX - center);
      const max = 180;
      const scale = Math.max(1, 1.45 - (dist / max) * 0.55);
      item.style.transform = `scale(${scale.toFixed(3)})`;
      const label = item.querySelector<HTMLElement>(".dock-label");
      if (label) label.style.transform = `translateX(-50%) translateY(${(scale - 1) * -18}px)`;
    });
  };

  const onLeave = () => {
    const row = rowRef.current;
    if (!row) return;
    row.querySelectorAll<HTMLElement>(".dock-item").forEach((item) => {
      item.style.transform = "";
      const label = item.querySelector<HTMLElement>(".dock-label");
      if (label) label.style.transform = "";
    });
  };

  return (
    <div className="apple-dock" aria-label="Quick navigation">
      <div ref={rowRef} className="dock-row" onMouseMove={onMove} onMouseLeave={onLeave}>
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`dock-item ${active ? "active" : ""}`} aria-label={label}>
              <span className="dock-label">{label}</span>
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
