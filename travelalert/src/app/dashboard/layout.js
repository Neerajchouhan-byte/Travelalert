import { MotionConfig } from "framer-motion";
import { CommandMenu } from "@/components/ui/command-menu";

export default function DashboardLayout({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-svh bg-[#0a0a0c] text-[#f3f3f2]">
        {children}
        {/* Global ⌘K command palette — mounted once per dashboard session */}
        <CommandMenu />
      </main>
    </MotionConfig>
  );
}