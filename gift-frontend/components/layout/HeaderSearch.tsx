"use client";

import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

type Suggestion = {
  _id: string;
  name: string;
  price?: number;
  salePrice?: number;
  images?: { url: string }[];
  categoryName?: string;
};

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // keyboard navigation
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Abort controller to cancel previous requests
  const abortRef = useRef<AbortController | null>(null);

  // Debounced fetch suggestions
  const fetchSuggestions = useCallback(
    async (q: string) => {
      // cancel previous
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const ac = new AbortController();
      abortRef.current = ac;

      const trimmed = q.trim();
      if (!trimmed) {
        setSuggestions([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // endpoint expects ?q=...
        const res = await apiClient.get(`/products/suggest?q=${encodeURIComponent(trimmed)}&limit=8`, {
          signal: ac.signal as any,
        });
        // backend returns { success..., data: { suggestions: [...] } }
        const root = res.data;
        const payload = root?.data ?? root;
        const list = payload?.suggestions ?? payload?.suggestionsList ?? payload ?? [];
        setSuggestions(Array.isArray(list) ? list : []);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.message === "canceled") {
          // aborted -> ignore
          return;
        }
        if (err?.response?.status === 404) {
          setSuggestions([]);
          setIsOpen(false);
        } else {
          console.error("search error", err);
          setError("Failed to fetch suggestions");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // debounce effect
  useEffect(() => {
    const id = setTimeout(() => {
      // ALWAYS fetch for any non-empty query (no min length)
      if (query.trim().length > 0) fetchSuggestions(query);
      else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [query, fetchSuggestions]);

  // keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (query.trim()) {
          router.push(`/products?search=${encodeURIComponent(query.trim())}`);
          setIsOpen(false);
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = activeIndex >= 0 ? suggestions[activeIndex] : null;
      if (sel) {
        router.push(`/products/${sel._id}`); // if product page exists
      } else if (query.trim()) {
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // click outside to close
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (!listRef.current) return;
      if (
        ev.target instanceof Node &&
        !listRef.current.contains(ev.target) &&
        ev.target !== inputRef.current
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
  };

  const onSuggestionClick = (s: Suggestion) => {
    // Prefer product detail if product route exists; otherwise go to product list with search
    router.push(`/products/${s._id}`);
    setIsOpen(false);
  };

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    try {
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(${esc})`, "ig");
      return text.split(re).map((part, i) =>
        re.test(part) ? (
          <mark key={i} className="rounded bg-yellow-200 px-0.5 py-0 font-semibold">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="relative w-full max-w-2xl" ref={listRef}>
      <form onSubmit={onSubmit} className="flex w-full items-center">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          placeholder="Search for products, brands and more"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 w-full rounded-l-md border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-blue-400 md:h-10 md:text-sm"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-9 items-center justify-center rounded-r-md bg-brand-secondary px-3 text-white hover:bg-brand-secondary/90 md:h-10 md:px-4"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && (suggestions.length > 0 || loading || error) && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg"
        >
          {loading && (
            <div className="px-3 py-2 text-xs text-slate-500">Searching...</div>
          )}

          {error && (
            <div className="px-3 py-2 text-xs text-red-600">{error}</div>
          )}

          {!loading && suggestions.length === 0 && !error && (
            <div className="px-3 py-2 text-xs text-slate-500">No results</div>
          )}

          <ul className="divide-y divide-slate-100">
            {suggestions.map((s, idx) => {
              const thumbnail = s.images?.[0]?.url || "/placeholder-80.png";
              const isActive = idx === activeIndex;
              return (
                <li
                  key={s._id}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    // prevent input blur before click
                    e.preventDefault();
                  }}
                  onClick={() => onSuggestionClick(s)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition hover:bg-slate-50 ${
                    isActive ? "bg-slate-100" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-slate-50">
                    <img src={thumbnail} alt={s.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {highlight(s.name, query)}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                      {s.categoryName && <span>{s.categoryName}</span>}
                      <span className="ml-auto font-semibold text-slate-900">
                        {typeof s.salePrice === "number" ? (
                          <>
                            <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(s.salePrice)}</span>
                            <span className="ml-2 text-xs text-slate-400 line-through">
                              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(s.price ?? 0)}
                            </span>
                          </>
                        ) : (
                          <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(s.price ?? 0)}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
