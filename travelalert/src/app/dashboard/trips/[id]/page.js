"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { RequireAuth } from "@/components/dashboard/RequireAuth";
import { TripBriefing } from "@/components/trips/TripBriefing";
import { TripLocked } from "@/components/trips/TripLocked";
import { TripExportButtons } from "@/components/trips/TripExportButtons";
import { TripBuilder } from "@/components/trips/TripBuilder";
import UpgradeModal from "@/components/UpgradeModal";
import { supabase } from "@/lib/supabase";

async function token() {
  const { data } = await supabase?.auth.getSession();
  return data?.session?.access_token || null;
}

function TripDetailContent() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [sections, setSections] = useState([]);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const t = await token();
      const h = t ? { Authorization: `Bearer ${t}` } : {};
      const [tr, br] = await Promise.all([
        fetch(`/api/trips/${id}`, { headers: h }).then((r) => r.json()),
        fetch(`/api/trips/${id}/briefing`, { headers: h }).then((r) => r.json()),
      ]);
      if (tr.error) throw new Error(tr.error);
      setTrip(tr.trip); setPlan(tr.plan || br.plan || "free");
      setSections(br.sections || []);
    } catch (e) { setError(e.message || "Could not load trip."); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (id) load(); }, [id]);

  async function saveEdit({ name, destinations }) {
    setSaving(true); setError("");
    try {
      const t = await token();
      const r = await fetch(`/api/trips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        body: JSON.stringify({ name, destinations }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 403 && j.upgradeRequired) { setShowUpgrade(true); return; }
      if (!r.ok) throw new Error(j.error || "Could not save trip.");
      setEditing(false); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const paid = plan !== "free";
  return (
    <div className="min-h-screen bg-[#f7f6f2] pb-16 text-zinc-900 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/trips" aria-label="Back to trips" className="flex size-9 items-center justify-center rounded-full bg-zinc-200/70 dark:bg-[#1c1c24]"><ChevronLeft className="size-4" /></Link>
            <h1 className="text-xl font-black sm:text-2xl">{trip?.name || "Trip"}</h1>
          </div>
          {paid && trip && !editing && <button type="button" onClick={() => setEditing(true)} className="h-9 rounded-full border px-4 text-xs font-bold border-zinc-200 dark:border-white/10">Edit</button>}
        </div>
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}
        {loading ? <p className="mt-6 text-sm text-zinc-500">Loading briefing…</p> : !paid ? (
          <div className="mt-6"><TripLocked city={trip?.destinations?.[0]?.city || ""} /></div>
        ) : editing ? (
          <div className="mt-6"><TripBuilder initialName={trip?.name || ""} initialDestinations={trip?.destinations || []} onSubmit={saveEdit} saving={saving} submitLabel="Save changes" /></div>
        ) : (
          <div className="mt-6 space-y-5">
            <TripExportButtons tripId={id} getToken={token} onUpgrade={() => setShowUpgrade(true)} />
            <TripBriefing sections={sections} plan={plan} onUpgrade={() => setShowUpgrade(true)} />
          </div>
        )}
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          highlight="trip_mode"
        />
      </div>
    </div>
  );
}

export default function TripDetailPage() {
  return (<Suspense fallback={<div className="p-8 text-sm text-zinc-500">Loading trip…</div>}><RequireAuth><TripDetailContent /></RequireAuth></Suspense>);
}