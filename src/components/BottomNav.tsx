"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClock, IconHome, IconCamera, IconStar, IconTarget } from "@/components/icons";

const ITEMS = [
  { href: "/", label: "Accueil", Icon: IconHome },
  { href: "/scan", label: "Scanner", Icon: IconCamera },
  { href: "/history", label: "Historique", Icon: IconClock },
  { href: "/favorites", label: "Favoris", Icon: IconStar },
  { href: "/goals", label: "Objectifs", Icon: IconTarget },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`nav-link ${active ? "nav-link-active" : ""}`}>
            <Icon className="h-6 w-6" strokeWidth={active ? 2 : 1.7} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
