"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ThreeDCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<NodeListOf<HTMLElement> | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    if (!itemsRef.current) itemsRef.current = card.querySelectorAll<HTMLElement>("[data-z]");
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateX(${(y * -14).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg)`;
    itemsRef.current.forEach((el) => {
      el.style.transform = `translateZ(${el.getAttribute("data-z")}px)`;
    });
  };

  const onLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "rotateX(0deg) rotateY(0deg)";
    card.querySelectorAll<HTMLElement>("[data-z]").forEach((el) => {
      el.style.transform = "translateZ(0px)";
    });
  };

  return (
    <div className="td-scene w-full max-w-[440px] mx-auto">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="td-card"
        style={{ transformStyle: "preserve-3d" }}
      >
        <p className="td-eyebrow" data-z="40">
          Khaled Seifullaha · Portfolio
        </p>
        <div className="td-media" data-z="100">
          <Image src="/about-photo.jpg" alt="Khaled at work" width={880} height={660} priority />
        </div>
        <div className="td-actions">
          <Link href="/skills-services" className="btn btn-primary" data-z="20">
            View Services
          </Link>
          <Link href="/contact" className="btn btn-secondary" data-z="20">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
