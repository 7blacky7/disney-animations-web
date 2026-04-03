"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import type { UserRole } from "@/lib/navigation";

/**
 * Dashboard Shell — Client Component with sidebar, header, and content area.
 * Receives session data from Server Component layout.
 */

interface DashboardShellProps {
  role: UserRole;
  userName: string;
  userInitials: string;
  tenantName: string;
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  userName,
  userInitials,
  tenantName,
  children,
}: DashboardShellProps) {
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
          role={role}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileOpen} onClose={closeMobile}>
        <Sidebar role={role} />
      </MobileSidebar>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          tenantName={tenantName}
          userName={userName}
          userInitials={userInitials}
          onMenuClick={openMobile}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
