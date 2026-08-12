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
    const current = ROLES[index % ROLES.length];
    let delay = deleting ? 45 : 85;
    if (!deleting && text === current) delay = 1800;
    else if (deleting && text === "") delay = 350;

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
    <span aria-label="Executive Talent Specialist">
      {text}
      <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-accent-light" aria-hidden="true">
        &nbsp;
      </span>
    </span>
  );
}
