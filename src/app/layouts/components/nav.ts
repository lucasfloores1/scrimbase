import { LayoutDashboard, Swords, Map, Users, Settings, type LucideIcon } from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

export const navItems: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/scrims", label: "Scrims", icon: Swords },
  { to: "/app/strats", label: "Strats", icon: Map },
  { to: "/app/team", label: "Equipo", icon: Users },
  { to: "/app/settings", label: "Configuración", icon: Settings },
];
