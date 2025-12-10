// app/admin/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import {
  Loader2,
  ShieldCheck,
  PackageSearch,
  Boxes,
  LayoutDashboard,
} from "lucide-react";

type AdminLayoutProps = {
  children: ReactNode;
};

interface MeUser {
  name?: string;
  email?: string;
  roles?: string[];
}

interface MeResponse {
  success: boolean;
  data?: {
    user?: MeUser;
  };
  message?: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---------- auth guard ----------
useEffect(() => {
  const checkAdmin = async () => {
    try {
      setIsChecking(true);
      setError(null);

      const res = await apiClient.get("/auth/me");

      // ✅ Normalize API response
      const data = res.data;
      let userData: MeUser | undefined;

      // Case 1: { success, data: { user } }
      if (data?.data?.user) {
        userData = data.data.user;
      }
      // Case 2: { user }
      else if (data?.user) {
        userData = data.user;
      }
      // Case 3: response directly user object
      else if (data?.name || data?.email) {
        userData = data;
      }

      if (!userData) {
        throw new Error("Invalid auth response");
      }

      const roles: string[] = userData.roles || [];
      const isAdmin = roles.includes("admin") || roles.includes("ADMIN");

      if (!isAdmin) {
        setIsAllowed(false);
        setError("You are not authorized to access admin panel.");
      } else {
        setIsAllowed(true);
        setUser(userData);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError("Please login as admin to access this panel.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to verify admin access. Please try again."
        );
      }
      setIsAllowed(false);
    } finally {
      setIsChecking(false);
    }
  };

  checkAdmin();
}, []);


  const navItems = [
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
  ];

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking admin access...
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-red-500" />
          <p className="text-sm font-semibold text-slate-800">
            Admin access required
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {error || "You are not allowed to view this area."}
          </p>
          <Link
            href="/"
            className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 md:px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-primary" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Admin Panel
              </p>
              <p className="text-[11px] text-slate-500 md:text-xs">
                Manage orders, products & inventory
              </p>
            </div>
          </div>
          {user && (
            <div className="hidden text-right text-xs text-slate-600 md:block">
              <p className="font-semibold">{user.name || "Admin"}</p>
              {user.email && <p className="text-[11px]">{user.email}</p>}
            </div>
          )}
        </div>
      </header>

      {/* Layout with sidebar */}
      <div className="mx-auto flex max-w-6xl gap-3 px-3 py-3 md:px-4 md:py-4">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm md:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs md:text-sm ${
                    active
                      ? "bg-blue-50 font-semibold text-brand-primary"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* For mobile: small top nav */}
        <div className="mb-2 flex w-full gap-1 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-[11px] ${
                  active
                    ? "bg-blue-50 font-semibold text-brand-primary"
                    : "bg-white text-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Main content */}
        <main className="w-full rounded-md bg-white p-3 text-sm text-slate-800 shadow-sm md:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
