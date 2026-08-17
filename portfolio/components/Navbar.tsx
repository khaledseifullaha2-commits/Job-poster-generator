"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/data/site";
import { MenuIcon, CloseIcon } from "./Icons";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="nav-shell">
        <nav
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5"
          aria-label="Primary"
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="brand"
            aria-label={`${site.name}, home`}
          >
            Khaled<span className="brand-dot">.</span>
          </Link>
          <div className="nav-links-desktop items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link ${active ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <button
            className="menu-btn md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      <div id="mobile-menu" className={`mobile-menu md:hidden ${open ? "open" : ""}`}>
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={active ? "active" : ""}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="mobile-cta">
          <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary w-full">
            Let&apos;s Talk
          </Link>
        </div>
      </div>
    </>
  );
}
