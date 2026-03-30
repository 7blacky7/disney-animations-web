"use client";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";

/**
 * Dashboard Header — Top bar with user info and actions
 */

interface DashboardHeaderProps {
  /** Tenant name for branding */
  tenantName?: string;
  /** User display name */
  userName?: string;
  /** User initials for avatar */
  userInitials?: string;
  /** Toggle mobile sidebar */
  onMenuClick?: () => void;
}

export function DashboardHeader({
  tenantName = "Quiz Platform",
  userName = "Benutzer",
  userInitials = "U",
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
      {/* Left: Mobile menu + Breadcrumb area */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg lg:hidden",
            "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          )}
          aria-label="Menue oeffnen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-5 w-5">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Tenant name / breadcrumb placeholder */}
        <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
          {tenantName}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher />

        {/* User avatar */}
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            "bg-primary/10 text-primary text-xs font-bold",
            "transition-colors hover:bg-primary/20",
          )}
          aria-label={`Benutzermenue: ${userName}`}
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}
