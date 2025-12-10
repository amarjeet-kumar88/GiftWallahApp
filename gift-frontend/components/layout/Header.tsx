"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  ChevronDown,
  LogOut,
  Package,
} from "lucide-react";

interface LoggedInUser {
  name?: string;
  phone?: string;
  email?: string;
}

export default function Header() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // read user info from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("access_token");
      const userJson = localStorage.getItem("user");
      if (token && userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const isActive = (path: string) => pathname.startsWith(path);

  const displayName =
    user?.name || (user?.phone ? `+91 ${user.phone.slice(-4)}` : "Account");

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAccountOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-primary shadow-md">
      <div className="container py-2">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="rounded-sm bg-orange-400 px-2 py-1 text-base font-bold text-brand-primary md:text-lg">
              Gift
            </span>
            <span className="text-base font-semibold md:text-lg">
              Walah 365
            </span>
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center overflow-hidden rounded-sm bg-white sm:flex"
          >
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="h-9 flex-1 px-3 text-xs text-slate-900 outline-none md:h-10 md:text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="flex h-9 w-10 items-center justify-center bg-brand-secondary md:h-10 md:w-12"
            >
              <Search className="h-4 w-4 text-white md:h-5 md:w-5" />
            </button>
          </form>

          {/* Right actions */}
          <nav className="flex items-center gap-2 text-[11px] md:gap-4 md:text-sm">
            {/* Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen((o) => !o)}
                  className="flex items-center gap-1 rounded-sm bg-transparent px-2 py-1 text-xs hover:bg-blue-600 md:px-3 md:text-sm"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[90px] truncate">
                    Hi, {displayName}
                  </span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 mt-1 w-44 rounded-md bg-white py-2 text-xs text-slate-700 shadow-lg">
                    <div className="px-3 pb-2 text-[11px] text-slate-500">
                      Logged in as
                      <div className="font-semibold text-slate-800">
                        {displayName}
                      </div>
                    </div>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-100"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login-otp"
                className="flex items-center gap-1 rounded-sm bg-transparent px-2 py-1 text-xs hover:bg-blue-600 md:px-3 md:text-sm"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className={`flex items-center gap-1 rounded-sm px-2 py-1 text-xs hover:bg-blue-600 md:px-3 md:text-sm ${
                isActive("/wishlist") ? "bg-blue-700" : ""
              }`}
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`flex items-center gap-1 rounded-sm px-2 py-1 text-xs hover:bg-blue-600 md:px-3 md:text-sm ${
                isActive("/cart") ? "bg-blue-700" : ""
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </nav>
        </div>

        {/* Mobile search */}
        <form
          onSubmit={handleSearch}
          className="mt-2 flex items-center overflow-hidden rounded-sm bg-white sm:hidden"
        >
          <input
            type="text"
            placeholder="Search for products, brands and more"
            className="h-9 flex-1 px-3 text-xs text-slate-900 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="flex h-9 w-10 items-center justify-center bg-brand-secondary"
          >
            <Search className="h-4 w-4 text-white" />
          </button>
        </form>
      </div>
    </header>
  );
}
