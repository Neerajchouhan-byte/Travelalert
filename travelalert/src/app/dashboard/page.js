"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function DashboardContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "your destination";

  return (
    <main className="min-h-screen p-8" style={{ background: "#060810", color: "#e2e8f0" }}>
      <Link href="/" className="text-sm text-zinc-400">← Home</Link>
      <h1 className="mt-6 text-3xl font-bold">Welcome</h1>
      <p className="mt-2 text-zinc-400">Results for {city}</p>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-8 text-zinc-300">Loading dashboard...</main>}>
      <DashboardContent />
    </Suspense>
  );
}