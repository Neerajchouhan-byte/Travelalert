'use client';

import {
  Bell,
  ChartNoAxesCombined,
  MapPinned,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Overview", icon: ChartNoAxesCombined, active: true },
  { label: "Search Destinations", icon: Search },
  { label: "Scam Alerts", icon: ShieldAlert },
  { label: "Travel Planner", icon: MapPinned },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-white/10 bg-[#0b0f1a] text-slate-100">
      <SidebarHeader className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-sm font-bold text-emerald-400 ring-1 ring-emerald-500/20">
            T
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">
              Travel<span className="text-emerald-400">Wise</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Safety radar
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-slate-400">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, icon: Icon, active }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    isActive={active}
                    className={active ? "bg-white/5 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-2 text-slate-400">Quick tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-slate-300 hover:bg-white/5 hover:text-white">
                  <Sparkles className="h-4 w-4" />
                  <span>Trip insights</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-slate-300 hover:bg-white/5 hover:text-white">
                  <Bell className="h-4 w-4" />
                  <span>Alerts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-slate-300 hover:bg-white/5 hover:text-white">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-3">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div>
            <div className="text-sm font-medium text-white">Free plan</div>
            <div className="text-xs text-slate-400">2/3 searches left</div>
          </div>
          <div className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
            Live
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
