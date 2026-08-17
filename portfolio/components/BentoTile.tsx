"use client";

import { useRef, type ReactNode } from "react";

/**
 * A bento tile that exposes the cursor position as CSS custom properties
 * (--mx / --my) so the ::before spotlight overlay can follow the mouse.
 * Only transforms/opacity are animated; no layout properties are touched.
 */
export default function BentoTile({
  children,
  hero = false,
  className = "",
  style,
}: {
  children: ReactNode;
  hero?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`bento-tile ${hero ? "hero" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
