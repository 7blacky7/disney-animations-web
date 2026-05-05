"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getNavForRole, type UserRole } from "@/lib/navigation";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  tenantName?: string;
  tenantLogoUrl?: string | null;
  departmentName?: string | null;
  departmentLogoUrl?: string | null;
}

export function Sidebar({
  role,
  isCollapsed = false,
  onToggleCollapse,
  tenantName = "Quiz Studio",
  tenantLogoUrl = null,
  departmentName = null,
  departmentLogoUrl = null,
}: SidebarProps) {
  const { prefersReducedMotion } = useAccessibility();
  const pathname = usePathname();
  const navGroups = getNavForRole(role);

  const tenantInitial = tenantName.charAt(0).toUpperCase() || "Q";

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/50 bg-sidebar",
        "transition-[width] duration-300 ease-out",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center border-b border-border/50 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            {tenantLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenantLogoUrl} alt="" className="h-full w-full object-contain bg-card" />
            ) : (
              tenantInitial
            )}
          </span>
          {!isCollapsed && (
            <span className="font-heading text-sm font-semibold truncate" title={tenantName}>
              {tenantName}
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard Navigation">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {!isCollapsed && (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-2.5 py-2",
                        "text-sm transition-colors duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        isCollapsed && "justify-center px-2",
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <motion.div
                          layoutId={prefersReducedMotion ? undefined : "sidebar-active"}
                          className="absolute inset-0 rounded-lg bg-sidebar-accent"
                          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
                          style={{ zIndex: -1 }}
                        />
                      )}

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 shrink-0"
                      >
                        <path d={item.iconPath} />
                      </svg>

                      {!isCollapsed && <span className="truncate">{item.label}</span>}

                      {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Department-Indikator (nur wenn User einer Abteilung zugeordnet) */}
      {departmentName && (
        <div className="border-t border-border/50 px-3 py-3">
          {isCollapsed ? (
            <div
              className="mx-auto flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground"
              title={departmentName}
              aria-label={`Abteilung: ${departmentName}`}
            >
              {departmentLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={departmentLogoUrl} alt="" className="h-full w-full object-contain bg-card" />
              ) : (
                departmentName.charAt(0).toUpperCase()
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
                {departmentLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={departmentLogoUrl} alt="" className="h-full w-full object-contain bg-card" />
                ) : (
                  departmentName.charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">Abteilung</p>
                <p className="truncate text-xs font-medium text-sidebar-foreground/80" title={departmentName}>
                  {departmentName}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-border/50 p-3">
        <button
          onClick={onToggleCollapse}
          className={cn(
            "flex w-full items-center justify-center rounded-lg p-2",
            "text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
          )}
          aria-label={isCollapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-4 w-4 transition-transform duration-200", isCollapsed && "rotate-180")}
          >
            <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
