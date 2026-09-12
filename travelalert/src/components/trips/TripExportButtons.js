"use client";
import { useState } from "react";
import { Mail, Printer, LoaderCircle } from "lucide-react";

// Export actions: PDF via print-ready HTML, email via mailto compose.
// No new dependency. Gated server-side; 403 opens upgrade modal.
export function TripExportButtons({ tripId, getToken, onUpgrade }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function token() { return getToken ? getToken() : null; }
  async function doEmail() {
    setBusy("email"); setError("");
    try {
      const t = await token();
      const r = await fetch(`/api/trips/${tripId}/export?format=email`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
      const j = await r.json().catch(() => ({}));
      if (r.status === 403 && j.upgradeRequired) { onUpgrade?.(); return; }
      if (!r.ok) throw new Error(j.error || "Export failed.");
      const href = `mailto:?subject=${encodeURIComponent(j.subject)}&body=${encodeURIComponent(j.body)}`;
      window.location.assign(href);
    } catch (e) { setError(e.message || "Export failed."); }
    finally { setBusy(""); }
  }
  async function doPrint() {
    setBusy("print"); setError("");
    try {
      const t = await token();
      const r = await fetch(`/api/trips/${tripId}/export?format=print`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
      if (r.status === 403) { onUpgrade?.(); return; }
      if (!r.ok) throw new Error("Export failed.");
      const html = await r.text();
      const w = window.open("", "_blank");
      if (!w) throw new Error("Allow popups to export PDF.");
      w.document.write(html); w.document.close();
    } catch (e) { setError(e.message || "Export failed."); }
    finally { setBusy(""); }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={doPrint} disabled={!!busy} className="inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-xs font-bold text-white disabled:opacity-60">
          {busy === "print" ? <LoaderCircle className="size-4 animate-spin" /> : <Printer className="size-4" />} PDF (print)
        </button>
        <button type="button" onClick={doEmail} disabled={!!busy} className="inline-flex h-10 items-center gap-2 rounded-full border px-5 text-xs font-bold disabled:opacity-60 border-zinc-200 dark:border-white/10">
          {busy === "email" ? <LoaderCircle className="size-4 animate-spin" /> : <Mail className="size-4" />} Email
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
