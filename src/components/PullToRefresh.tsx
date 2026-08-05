"use client";

import { useRef, useState, type ReactNode, type TouchEvent } from "react";
import { hapticTap } from "@/lib/haptics";

const TRIGGER_DISTANCE = 64;
const MAX_PULL = 100;

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

/** Native-feeling pull-to-refresh: only arms when the page is scrolled to the top. */
export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const armed = useRef(false);

  function handleTouchStart(e: TouchEvent) {
    if (refreshing) return;
    armed.current = window.scrollY <= 0;
    startY.current = armed.current ? e.touches[0].clientY : null;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!armed.current || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) {
      setPull(0);
      return;
    }
    setPull(Math.min(MAX_PULL, delta * 0.5));
  }

  async function handleTouchEnd() {
    if (!armed.current) return;
    armed.current = false;
    startY.current = null;
    if (pull >= TRIGGER_DISTANCE && !refreshing) {
      hapticTap();
      setRefreshing(true);
      setPull(TRIGGER_DISTANCE);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pull }}
        aria-hidden
      >
        <div
          className={`h-5 w-5 rounded-full border-2 border-slate-500 border-t-green-400 ${
            refreshing ? "animate-spin" : ""
          }`}
          style={{ opacity: Math.min(1, pull / TRIGGER_DISTANCE), transform: `rotate(${pull * 3}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
