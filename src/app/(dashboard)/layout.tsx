"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import type { UserRole } from "@/lib/navigation";

/**
 * Dashboard Layout — Shell with sidebar, header, and content area
 *
 * TODO: Replace hardcoded role with actual auth context
 * TODO: Replace hardcoded user data with session data
 */

// Temporary: hardcoded role for development. Will come from auth session.
const DEV_ROLE: UserRole = "admin";
const DEV_USER = { name: "Demo User", initials: "DU" };
const DEV_TENANT = { name: "Demo Firma" };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = useCallback(() => setSidebarCollapsed((prev) => !prev), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          role={DEV_ROLE}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileOpen} onClose={closeMobile}>
        <Sidebar role={DEV_ROLE} />
      </MobileSidebar>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          tenantName={DEV_TENANT.name}
          userName={DEV_USER.name}
          userInitials={DEV_USER.initials}
          onMenuClick={openMobile}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
