"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }
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

        {/* User avatar with dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-primary/10 text-primary text-xs font-bold",
              "transition-colors hover:bg-primary/20",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
            aria-label={`Benutzermenue: ${userName}`}
          >
            {userInitials}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{tenantName}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-2 h-4 w-4">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/my-results")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-2 h-4 w-4">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Meine Ergebnisse
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-2 h-4 w-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
