"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Megaphone, Activity, Users, Reply, Settings, Image as ImageIcon, LayoutTemplate, LogOut } from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") {
    return null;
  }

  const navItems = [
    { href: "/chat", icon: MessageCircle, label: "Live Chat" },
    { href: "/replies", icon: Reply, label: "All Replies" },
    { href: "/contacts", icon: Users, label: "Contact Lists" },
    { href: "/campaigns", icon: Megaphone, label: "Campaigns" },
    { href: "/media", icon: ImageIcon, label: "Media Library" },
    { href: "/templates", icon: LayoutTemplate, label: "Templates" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="sidebar-nav">
      <img src="/logo.png" alt="Maa Aainath Logo" className="nav-logo object-contain" style={{ background: 'white', padding: '4px' }} />

      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} title={item.label}>
            <div className={`nav-item ${isActive ? "active" : ""}`}>
              <item.icon size={22} />
            </div>
          </Link>
        );
      })}

      <Link href="/settings" title="Settings">
        <div className={`nav-item ${pathname === "/settings" ? "active" : ""}`}>
          <Settings size={22} />
        </div>
      </Link>

      <div className="nav-spacer" />

      <div className="nav-item" title="API Health">
        <Activity size={20} />
      </div>

      <div className="nav-item text-red-500 hover:text-red-700" title="Logout" onClick={handleLogout} style={{ color: "var(--warning-text)", cursor: "pointer", marginTop: "8px" }}>
        <LogOut size={22} />
      </div>
    </nav>
  );
}
