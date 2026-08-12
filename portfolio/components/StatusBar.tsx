"use client";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="status-bar">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4 px-5">
        <p className="status-meta">
          <span className="status-dot" aria-hidden="true" />
          <span>
            Dhaka<span className="hidden sm:inline">, Bangladesh</span>
          </span>
          <span className="status-sep" aria-hidden="true">
            ·
          </span>
          <span>GMT+6</span>
        </p>
        <p className="status-clock hidden sm:inline-flex">
          <span>{time ?? "—:—"}</span>
          <span className="status-sep" aria-hidden="true">
            ·
          </span>
          <span>Local time</span>
        </p>
        <span className="status-badge">Open to opportunities</span>
      </div>
    </div>
  );
}
