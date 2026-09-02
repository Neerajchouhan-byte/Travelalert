"use client";

import {
  Bell,
  Earth,
  LayoutGrid,
  Luggage,
  Search,
  Settings,
  TriangleAlert,
  ArrowLeftRight,
  Users,
  Radar,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const main = [
  { label: "Dashboard", icon: LayoutGrid, href: "/dashboard", active: true },
  { label: "Search destinations", icon: Search, href: "/" },
  {
    label: "Scam alerts",
    icon: TriangleAlert,
    href: "/dashboard",
    badge: "12",
  },
  { label: "My trips", icon: Luggage, href: "/dashboard" },
];

const discover = [
  { label: "Destinations", icon: Earth, href: "/" },
  { label: "Currency rates", icon: ArrowLeftRight, href: "/dashboard" },
  { label: "Community", icon: Users, href: "/dashboard" },
];

const account = [
  { label: "Settings", icon: Settings, href: "/dashboard" },
  { label: "Notifications", icon: Bell, href: "/dashboard" },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-white/10 bg-[#0d0d10] text-[#f3f3f2]">
      <SidebarHeader className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2 text-[1.05rem] font-bold">
          <Radar className="size-4 text-[#e5484a]" />
          TravelRadar
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.09em] text-[#68686f]">
          Live scam intel
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Main" items={main} />
        <NavGroup label="Discover" items={discover} />
        <NavGroup label="Account" items={account} />
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="size-8 border border-white/16">
            <AvatarFallback className="bg-[#141418] font-mono text-[11px] font-bold text-[#e5484a]">
              NR
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[13px] font-bold">Neeraj</div>
            <div className="text-[11px] text-[#68686f]">
              Free plan · 2/3 searches
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavGroup({ label, items }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#68686f]">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild isActive={item.active}>
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
              {item.badge && (
                <SidebarMenuBadge className="bg-[#e5484a]/15 text-[#e5484a]">
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
