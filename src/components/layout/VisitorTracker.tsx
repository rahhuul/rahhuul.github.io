"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const WORKER_URL = "https://silent-queen-2a7b.rahul-patel786.workers.dev/";
const COOLDOWN_MS = 30 * 60 * 1000; // 30 min — don't spam on quick refreshes

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const key = `vt_${pathname}`;
      const last = Number(localStorage.getItem(key) || 0);
      if (Date.now() - last < COOLDOWN_MS) return;
      localStorage.setItem(key, String(Date.now()));
    } catch {
      // localStorage unavailable — still fire
    }

    const device = /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
    const referrer = document.referrer
      ? new URL(document.referrer).hostname
      : "Direct";

    fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname, referrer, device }),
    }).catch(() => {/* silent fail */});
  }, [pathname]);

  return null;
}
