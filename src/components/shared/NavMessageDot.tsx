"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Silently refreshes the layout every 15s so the message dot stays current
export default function NavRefresher() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
