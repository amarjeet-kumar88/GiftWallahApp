"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  Boxes,
  Tags,
  BarChart3,
} from "lucide-react";
import { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: PackageSearch,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Boxes,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tags,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
];

function AdminSidebarLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive =
    pathname === item.href ||
    (pathname?.startsWith(item.href) && item.href !== "/admin");

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors md:text-sm ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${
          isActive ? "text-blue-600" : "text-slate-400"
        }`}
      />
      <span>{item.label}</span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 md:px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white md:h-9 md:w-9">
              GW
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 md:text-sm">
                Giftwalah Admin
              </p>
              <p className="text-[10px] text-slate-500 md:text-[11px]">
                Orders • Products • Analytics
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto flex max-w-6xl gap-3 px-3 py-3 md:px-4 md:py-4">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {navItems.map((item) => (
              <AdminSidebarLink key={item.href} item={item} />
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="mb-2 block md:hidden">
          <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 text-[11px] shadow-sm">
            {navItems.map((item) => (
              <AdminSidebarLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
