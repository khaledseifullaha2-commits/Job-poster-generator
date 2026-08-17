import Link from "next/link";
import FooterYear from "./FooterYear";
import { site, nav } from "@/data/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 md:flex-row md:justify-between">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Khaled<span className="text-accent">.</span>
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="footer-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-center font-mono text-xs text-muted md:text-right">
          © <FooterYear /> {site.name} · {site.role}
        </p>
      </div>
    </footer>
  );
}
