import {
  BellRing,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  ListChecks,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavKey =
  | "dashboard"
  | "calendar"
  | "bookings"
  | "clients"
  | "reminders"
  | "invoices"
  | "waitlist"
  | "settings";

export interface NavItem {
  href: string;
  key: NavKey;
  icon: LucideIcon;
  adminOnly?: boolean;
}

/** التنقّل السفلي على الجوال — أهم ٥. */
export const NAV_PRIMARY: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutGrid },
  { href: "/calendar", key: "calendar", icon: CalendarDays },
  { href: "/clients", key: "clients", icon: Users },
  { href: "/reminders", key: "reminders", icon: BellRing },
  { href: "/invoices", key: "invoices", icon: Receipt },
];

/** الشريط الجانبي على الكمبيوتر — كل المسارات. */
export const NAV_SIDEBAR: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutGrid },
  { href: "/calendar", key: "calendar", icon: CalendarDays },
  { href: "/bookings", key: "bookings", icon: ClipboardList },
  { href: "/clients", key: "clients", icon: Users },
  { href: "/reminders", key: "reminders", icon: BellRing },
  { href: "/invoices", key: "invoices", icon: Receipt },
  { href: "/waitlist", key: "waitlist", icon: ListChecks },
  { href: "/settings", key: "settings", icon: Settings, adminOnly: true },
];
