"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import type { UserRole } from "@/lib/navigation";

interface DashboardShellProps {
  role: UserRole;
  userName: string;
  userInitials: string;
  tenantName: string;
  tenantLogoUrl: string | null;
  departmentName: string | null;
  departmentLogoUrl: string | null;
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  userName,
  userInitials,
  tenantName,
  tenantLogoUrl,
  departmentName,
  departmentLogoUrl,
  children,
}: DashboardShellProps) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = useCallback(() => setSidebarCollapsed((prev) => !prev), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <Sidebar
          role={role}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleCollapse}
          tenantName={tenantName}
          tenantLogoUrl={tenantLogoUrl}
          departmentName={departmentName}
          departmentLogoUrl={departmentLogoUrl}
        />
      </div>

      <MobileSidebar isOpen={isMobileOpen} onClose={closeMobile}>
        <Sidebar
          role={role}
          tenantName={tenantName}
          tenantLogoUrl={tenantLogoUrl}
          departmentName={departmentName}
          departmentLogoUrl={departmentLogoUrl}
        />
      </MobileSidebar>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          tenantName={tenantName}
          tenantLogoUrl={tenantLogoUrl}
          userName={userName}
          userInitials={userInitials}
          onMenuClick={openMobile}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
