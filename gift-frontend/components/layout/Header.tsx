"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useCallback } from "react";
import HeaderSearch from "./HeaderSearch";
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  ChevronDown,
  LogOut,
  Package,
  User2,
} from "lucide-react";
import apiClient from "@/lib/apiClient";

interface LoggedInUser {
  name?: string;
  phone?: string;
  email?: string;
}

export default function Header() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // counts
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  const pathname = usePathname() || "";
  const router = useRouter();

  // read user info from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("access_token");
      const userJson = localStorage.getItem("user");
      if (token && userJson) {
        setUser(JSON.parse(userJson));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // safe parsers (handle multiple response shapes)
  const parseCountFromCart = (respData: any) => {
    const root = respData;
    const payload = root?.data ?? root;
    // prefer count field
    if (typeof payload?.count === "number") return payload.count;
    // cart object with totalItems
    if (payload?.cart && typeof payload.cart.totalItems === "number")
      return payload.cart.totalItems;
    // direct cart object
    if (typeof payload?.totalItems === "number") return payload.totalItems;
    // fallback: sum items quantities
    const items = payload?.cart?.items ?? payload?.items ?? payload;
    if (Array.isArray(items)) {
      return items.reduce(
        (s: number, it: any) => s + (Number(it.quantity) || 0),
        0
      );
    }
    return 0;
  };

  const parseCountFromWishlist = (respData: any) => {
    const root = respData;
    const payload = root?.data ?? root;
    if (typeof payload?.count === "number") return payload.count;
    const list = payload?.wishlist ?? payload?.items ?? payload;
    if (Array.isArray(list)) return list.length;
    return 0;
  };

  // fetch counts (tries /cart/count and /wishlist/count first; falls back to heavier endpoints)
  const fetchCounts = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    let mounted = true;

    try {
      // CART COUNT
      try {
        const r = await apiClient.get("/cart/count");
        if (!mounted) return;
        const c =
          r?.data?.data?.count ?? r?.data?.count ?? parseCountFromCart(r?.data);
        setCartCount(Number(c) || 0);
      } catch {
        // fallback to /cart
        try {
          const r2 = await apiClient.get("/cart");
          if (!mounted) return;
          const c2 = parseCountFromCart(r2?.data);
          setCartCount(Number(c2) || 0);
        } catch {
          // keep previous or zero
          setCartCount((c) => c);
        }
      }

      // WISHLIST COUNT
      try {
        const w = await apiClient.get("/wishlist/count");
        if (!mounted) return;
        const wc =
          w?.data?.data?.count ??
          w?.data?.count ??
          parseCountFromWishlist(w?.data);
        setWishlistCount(Number(wc) || 0);
      } catch {
        // fallback to /wishlist
        try {
          const w2 = await apiClient.get("/wishlist");
          if (!mounted) return;
          const wc2 = parseCountFromWishlist(w2?.data);
          setWishlistCount(Number(wc2) || 0);
        } catch {
          setWishlistCount((w) => w);
        }
      }
    } finally {
      // nothing
    }

    return () => {
      mounted = false;
    };
  }, []);

  // initial fetch + when user object changes
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts, user]);

  // listen to localStorage changes across tabs
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (!ev.key) {
        fetchCounts();
        return;
      }
      if (ev.key === "access_token" || ev.key === "user") {
        try {
          const token = localStorage.getItem("access_token");
          const userJson = localStorage.getItem("user");
          if (token && userJson) setUser(JSON.parse(userJson));
          else setUser(null);
        } catch {
          setUser(null);
        }
        fetchCounts();
      }
      if (ev.key === "cart" || ev.key === "wishlist") {
        fetchCounts();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchCounts]);

  // listen to custom events dispatched by app after cart/wishlist updates
  useEffect(() => {
    const onCartUpdated = () => fetchCounts();
    const onWishlistUpdated = () => fetchCounts();
    window.addEventListener("cart-updated", onCartUpdated as EventListener);
    window.addEventListener(
      "wishlist-updated",
      onWishlistUpdated as EventListener
    );
    return () => {
      window.removeEventListener(
        "cart-updated",
        onCartUpdated as EventListener
      );
      window.removeEventListener(
        "wishlist-updated",
        onWishlistUpdated as EventListener
      );
    };
  }, [fetchCounts]);

  const isActive = (path: string) => pathname.startsWith(path);

  const displayName =
    user?.name || (user?.phone ? `+91 ${user.phone.slice(-4)}` : "Account");

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAccountOpen(false);
    setCartCount(0);
    setWishlistCount(0);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-sky-200 bg-linear-to-r from-brand-primary via-sky-700 to-brand-primary shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
      <div className="container mx-auto max-w-6xl px-2 sm:px-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2 py-2 md:gap-4 md:py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 rounded-md px-1 py-0.5 transition hover:bg-white/5"
          >
            <span className="rounded-sm bg-orange-300 px-2 py-1 text-sm font-extrabold text-brand-primary shadow-sm md:text-base">
              Gift
            </span>
            <span className="text-sm font-semibold text-white md:text-lg">
              Walah 365
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 sm:flex">
            <HeaderSearch />
          </div>

          {/* Right actions */}
          <nav className="flex items-center gap-1 text-[11px] text-black md:gap-3 md:text-sm">
            {/* Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen((o) => !o)}
                  className="flex items-center hover:cursor-pointer gap-1 rounded-sm bg-white/5 px-2 py-1 text-xs font-medium transition hover:bg-orange-300 hover:shadow-xl md:px-3 md:text-sm"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden max-w-[110px] truncate sm:inline">
                    Hi, {displayName}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform sm:h-4 sm:w-4 ${
                      isAccountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-2 text-xs text-slate-700 shadow-xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95">
                    <div className="px-3 pb-2 text-[11px] text-slate-500">
                      Logged in as
                      <div className="truncate font-semibold text-slate-800">
                        {displayName}
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-1.5 transition hover:bg-slate-100"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <User2 className="h-3.5 w-3.5" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-3 py-1.5 transition hover:bg-slate-100"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-red-600 transition hover:bg-red-50"
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
                className="flex items-center gap-1 rounded-sm bg-white text-[11px] font-semibold text-brand-primary px-2 py-1 shadow-sm transition hover:-translate-y-px hover:bg-slate-100 md:px-3 md:text-sm"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login / Signup</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className={`relative flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium transition hover:bg-white/15 hover:shadow-sm md:px-3 md:text-sm ${
                isActive("/wishlist") ? "bg-white/20" : ""
              }`}
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>

              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium transition hover:bg-white/15 hover:shadow-sm md:px-3 md:text-sm ${
                isActive("/cart") ? "bg-white/20" : ""
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-400 px-1 text-[9px] font-bold text-slate-900">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Mobile search (second row) */}
        <div className="sm:hidden mb-2">
          <HeaderSearch />
        </div>
      </div>
    </header>
  );
}
