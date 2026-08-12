"use client";

import { useEffect, useRef, useState } from "react";

export default function Counter({
  value,
  suffix = "",
  duration = 1600,
  delay = 150,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    let safety = 0;
    const t = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) raf = requestAnimationFrame(tick);
        else setDisplay(value);
      };
      raf = requestAnimationFrame(tick);
      // Safety net: if rAF is throttled/paused (hidden tab, preview webview),
      // snap to the final value so the stat never stays stuck at 0.
      safety = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        setDisplay(value);
      }, duration + 1200);
    }, delay);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [value, duration, delay]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
