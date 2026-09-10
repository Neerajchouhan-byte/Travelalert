import { MotionConfig } from "framer-motion";
import { CommandMenu } from "@/components/ui/command-menu";

export default function DashboardLayout({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-svh bg-[#f7f6f2] text-zinc-900 transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
        {children}
        {/* Global ⌘K command palette */}
        <CommandMenu />
      </main>
    </MotionConfig>
  );
}