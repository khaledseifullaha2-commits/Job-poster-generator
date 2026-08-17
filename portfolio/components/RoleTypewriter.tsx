"use client";

import { useEffect, useState } from "react";

const ROLES = [
  "Executive Talent Specialist",
  "AI-Powered Recruitment",
  "Data-Driven Decisions",
  "Talent Acquisition & HR",
];

export default function RoleTypewriter() {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Reduced motion: show the primary role statically, no typing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setText(ROLES[0]), 0);
      return () => clearTimeout(t);
    }

    const current = ROLES[index % ROLES.length];
    let delay = deleting ? 40 : 75;
    if (!deleting && text === current) delay = 2000;
    else if (deleting && text === "") delay = 300;

    const t = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) setDeleting(true);
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDeleting(false);
          setIndex((i) => i + 1);
        }
      }
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, index]);

  return (
    <span className="role-text" aria-label="Executive Talent Specialist">
      {text}
      <span className="caret" aria-hidden="true" />
    </span>
  );
}
