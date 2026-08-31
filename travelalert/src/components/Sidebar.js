"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const item = (href, icon, label, badge) => (
    <Link
      href={href}
      className={"nav-item" + (pathname === href ? " active" : "")}
    >
      <i className={icon}></i>
      {label}
      {badge ? <span className="nav-badge">{badge}</span> : null}
    </Link>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-row">
          <i className="fa-solid fa-tower-broadcast"></i>
          TravelRadar
        </div>
        <div className="logo-sub">
          <span className="live-dot"></span>
          Live intel
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Main</div>
        {item("/dashboard", "fa-solid fa-table-columns", "Dashboard")}
        {item("/dashboard", "fa-solid fa-triangle-exclamation", "Alerts", "12")}
        {item("/dashboard", "fa-solid fa-suitcase", "Trips")}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Discover</div>
        {item("/dashboard", "fa-solid fa-earth-asia", "Destinations")}
        {item("/dashboard", "fa-solid fa-comments", "Community")}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Account</div>
        {item("/dashboard", "fa-solid fa-gear", "Settings")}
      </div>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">TW</div>
          <div>
            <div className="user-name">You</div>
            <div className="user-plan">Free plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}