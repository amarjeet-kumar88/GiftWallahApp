import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-slate-200 bg-white">
      <div className="container py-5 text-xs text-slate-600 md:text-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div>
            <p className="text-sm font-semibold text-slate-800 md:text-base">
              GiftWalah 365
            </p>
            <p className="mt-1 text-[11px] md:text-xs">
              GiftWallah365 shopping experience for gifts and more.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-[11px] md:text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Help</p>
              <Link href="#" className="block hover:text-brand-primary">
                Payments
              </Link>
              <Link href="#" className="block hover:text-brand-primary">
                Shipping
              </Link>
              <Link href="#" className="block hover:text-brand-primary">
                Cancellation
              </Link>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Policy</p>
              <Link href="#" className="block hover:text-brand-primary">
                Return Policy
              </Link>
              <Link href="#" className="block hover:text-brand-primary">
                Terms of Use
              </Link>
              <Link href="#" className="block hover:text-brand-primary">
                Privacy
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-500 md:text-xs">
          © {new Date().getFullYear()} GiftWalah 365. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
