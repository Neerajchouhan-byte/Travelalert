"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { TripBuilder } from "@/components/trips/TripBuilder";
import { TripLocked } from "@/components/trips/TripLocked";
import UpgradeModal from "@/components/UpgradeModal";
import { supabase } from "@/lib/supabase";

async function token() {
  const { data } = await supabase?.auth.getSession();
  return data?.session?.access_token || null;
}

function TripsContent() {
  const [trips, setTrips] = useState([]);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const t = await token();
      const r = await fetch("/api/trips", { headers: t ? { Authorization: `Bearer ${t}` } : {} });
      const j = await r.json();
      if (r.ok) { setTrips(j.trips || []); setPlan(j.plan || "free"); }
      else setError(j.error || "Could not load trips.");
    } catch { setError("Could not load trips."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const paid = plan !== "free";

  async function createTrip({ name, destinations }) {
    setSaving(true); setError("");
    try {
      const t = await token();
      const r = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        body: JSON.stringify({ name, destinations }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 403 && j.upgradeRequired) { setShowUpgrade(true); return; }
      if (!r.ok) throw new Error(j.error || "Could not create trip.");
      setTrips((list) => [{ ...j.trip, destinationCount: (j.trip.destinations || []).length }, ...list]);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function deleteTrip(id) {
    if (!window.confirm("Delete this trip?")) return;
    const t = await token();
    await fetch(`/api/trips/${id}`, { method: "DELETE", headers: t ? { Authorization: `Bearer ${t}` } : {} });
    setTrips((list) => list.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] pb-16 text-zinc-900 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" aria-label="Back to dashboard" className="flex size-9 items-center justify-center rounded-full bg-zinc-200/70 dark:bg-[#1c1c24]"><ChevronLeft className="size-4" /></Link>
          <div><h1 className="text-xl font-black sm:text-2xl">Trip Mode</h1>
            <p className="text-xs text-zinc-500">One briefing across 3–6 destinations.</p></div>
        </div>
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}
        {loading ? <p className="mt-6 text-sm text-zinc-500">Loading trips…</p> : !paid ? (
          <div className="mt-6 space-y-4">
            <TripLocked />
            {trips.length > 0 && (
              <div className="rounded-[28px] border p-5 dark:border-white/10">
                <p className="text-sm font-bold">Your trips ({trips.length})</p>
                <p className="text-xs text-zinc-500">Upgrade to open and export them.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <TripBuilder onSubmit={createTrip} saving={saving} submitLabel="Create trip briefing" />
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Your trips</p>
              {trips.length === 0 ? <p className="mt-2 text-sm text-zinc-500">No trips yet — build your first above.</p> : (
                <ul className="mt-2 space-y-2">
                  {trips.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#16161b]">
                      <MapPin className="size-4 shrink-0 text-[#e5283b]" />
                      <Link href={`/dashboard/trips/${t.id}`} className="min-w-0 flex-1"><span className="block truncate text-sm font-bold hover:underline">{t.name}</span>
                        <span className="text-[11px] text-zinc-400">{t.destinationCount} stops</span></Link>
                      <button type="button" onClick={() => deleteTrip(t.id)} aria-label={`Delete ${t.name}`} className="text-zinc-400 hover:text-red-500"><Trash2 className="size-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    </div>
  );
}

export default function TripsPage() {
  return (<Suspense fallback={<div className="p-8 text-sm text-zinc-500">Loading trips…</div>}><RequireAuth><TripsContent /></RequireAuth></Suspense>);
}
