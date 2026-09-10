import Link from "next/link";
import { Radar } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 bg-white py-12 text-zinc-500 dark:border-white/5 dark:bg-[#09090c] dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-base font-black text-zinc-900 dark:text-white">
              <span className="flex size-6 items-center justify-center rounded-md bg-[#e5283b] text-white">
                <Radar className="size-3.5" />
              </span>
              <span>TravelRadar</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              Know before you go.
            </p>
          </div>

          {/* Column: Product */}
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-zinc-900 transition dark:hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-zinc-900 transition dark:hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-zinc-900 transition dark:hover:text-white">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Company */}
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Company
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="#how" className="hover:text-zinc-900 transition dark:hover:text-white">
                  How it works
                </a>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-zinc-900 transition dark:hover:text-white">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Legal */}
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Legal
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-zinc-900 transition dark:hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-900 transition dark:hover:text-white">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between border-t border-zinc-100 pt-6 text-[11px] text-zinc-400 dark:border-white/5 dark:text-zinc-600">
          <span>© 2026 TravelRadar. All rights reserved.</span>
          <span>Travel smarter.</span>
        </div>
      </div>
    </footer>
  );
}