import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { CommandMenu } from "@/components/ui/command-menu";

export default function DashboardLayout({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-svh flex-col bg-[#f7f6f2] text-zinc-900 transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
        <div className="flex-1">{children}</div>

        {/* Dashboard-wide legal footer. The landing page has its own richer
            footer; this is a minimal strip so the legal links are reachable
            from every dashboard route (dashboard, trips list, trip detail)
            without importing the landing Footer's anchor links, which only
            resolve on the landing page. */}
        <footer className="border-t border-zinc-200/80 px-4 py-6 text-center text-[11px] text-zinc-500 sm:px-6 dark:border-white/5 dark:text-zinc-400">
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
          >
            <Link
              href="/terms"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Terms
            </Link>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">
              ·
            </span>
            <Link
              href="/privacy"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Privacy
            </Link>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">
              ·
            </span>
            <Link
              href="/disclaimer"
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Disclaimer
            </Link>
          </nav>
          <p className="mt-2 text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} TravelRadar
          </p>
        </footer>

        {/* Global ⌘K command palette */}
        <CommandMenu />
      </main>
    </MotionConfig>
  );
}