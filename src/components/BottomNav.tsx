"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/scan", label: "Scanner", icon: "📷" },
  { href: "/history", label: "Historique", icon: "📋" },
  { href: "/favorites", label: "Favoris", icon: "⭐" },
  { href: "/goals", label: "Objectifs", icon: "🎯" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-800 bg-slate-900/95 backdrop-blur">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`nav-link ${active ? "nav-link-active" : ""}`}>
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
