import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Bell,
  Boxes,
  ChevronRight,
  History,
  LayoutDashboard,
  RefreshCcw,
  Search,
  Shield,
  Upload,
  Users,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const NAV: Array<{ group: string; items: NavItem[] }> = [
  {
    group: "Geral",
    items: [{ label: "Dashboard", to: "/", icon: LayoutDashboard }],
  },
  {
    group: "Identity",
    items: [
      { label: "Utilizadores", to: "/identity/users", icon: Users },
      { label: "Utilizador ↔ Plataformas", to: "/identity/access", icon: ArrowLeftRight },
    ],
  },
  {
    group: "Plataformas",
    items: [
      { label: "Todas as Plataformas", to: "/platforms", icon: Boxes },
      { label: "Utilizadores por Plataforma", to: "/platforms/users", icon: UsersRound },
    ],
  },
  {
    group: "Migração",
    items: [
      { label: "Utilizadores Pendentes", to: "/migration/pending", icon: Shield },
      { label: "Importar Utilizadores", to: "/migration/import", icon: Upload },
      { label: "Sincronização", to: "/migration/sync", icon: RefreshCcw },
      { label: "Histórico de Migrações", to: "/migration/history", icon: History },
    ],
  },
];

const CRUMB_LABELS: Record<string, string> = {
  identity: "Identity",
  users: "Utilizadores",
  access: "Utilizador ↔ Plataformas",
  platforms: "Plataformas",
  migration: "Migração",
  pending: "Utilizadores Pendentes",
  import: "Importar Utilizadores",
  history: "Histórico",
  sync: "Sincronização",
};

function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <>
      {NAV.map((section, idx) => (
        <SidebarGroup key={section.group}>
          {idx > 0 && <SidebarSeparator />}
          <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                    <Link
                      to={item.to}
                      onClick={() => {
                        if (isMobile) toggleSidebar();
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

function Brand() {
  const { open } = useSidebar();
  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <Link
        to="/"
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5",
          !open ? "justify-center px-0" : "px-2",
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary font-mono text-sm font-bold text-sidebar-primary-foreground">
          IA
        </div>
        {open && (
          <div className="min-w-25 leading-tight animate-in fade-in slide-in-from-left-2 duration-300">
            <p className="text-sm font-semibold text-sidebar-foreground">Identity Access</p>
            <p className="text-xs text-sidebar-primary font-medium opacity-80">Admin Console</p>
          </div>
        )}
      </Link>
    </SidebarHeader>
  );
}

function AppHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        <SidebarTrigger className="-ml-1" />

        <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm md:flex">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Início
          </Link>
          {segments.map((segment, index) => (
            <span key={`${segment}-${index}`} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span
                className={cn(
                  "text-muted-foreground",
                  index === segments.length - 1 && "font-medium text-foreground",
                )}
              >
                {CRUMB_LABELS[segment] ?? segment}
              </span>
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisa global..." className="h-9 w-56 pl-8" />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="size-4" />
          </Button>
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              AD
            </div>
            <div className="hidden text-xs leading-tight sm:block">
              <p className="font-medium text-foreground">Admin</p>
              <p className="text-muted-foreground">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side="left">
        <Brand />
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <div className="w-full px-4 py-4 md:px-6 md:py-6 lg:px-8 @container/main">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
