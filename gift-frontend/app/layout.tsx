import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "GiftWalah 365 - Online Shopping",
  description: "Flipkart-style e-commerce frontend for GiftWalah 365",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
