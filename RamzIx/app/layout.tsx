import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/Cart";
import { CurrencyProvider } from "@/components/Currency";
import { LangProvider } from "@/components/Lang";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"], display: "swap" });

export const metadata: Metadata = {
  title: "RamzIx — маҳсулоти оптовӣ аз Дубай, Чин ва Туркия",
  description: "Таъмини мағозаҳо ва фурӯшандагон бо маҳсулот аз Аморат, Чин, Туркия ва Тоҷикистон. Нархи оптовӣ аз 4 дона.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tg">
      <body className={inter.className}>
        <LangProvider>
          <CurrencyProvider>
            <CartProvider>
              <div className="app">{children}</div>
            </CartProvider>
          </CurrencyProvider>
        </LangProvider>
      </body>
    </html>
  );
}
