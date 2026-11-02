import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/Cart";
import { CurrencyProvider } from "@/components/Currency";
import DeskBar from "@/components/DeskBar";
import { LangProvider } from "@/components/Lang";
import { loadStorefront } from "@/lib/server/catalog";
import { loadPricing } from "@/lib/server/pricing";
import { loadSite } from "@/lib/server/site";
import { applyPricing } from "@/lib/pricing-config";
import { PricingProvider } from "@/lib/usePricing";
import { CatalogProvider } from "@/lib/useCatalog";
import { SiteProvider } from "@/lib/useSite";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"], display: "swap" });

export const metadata: Metadata = {
  title: "RamzIx — техникаи хона бо нархи оптов",
  description: "Фурӯши оптовии маҳсулот барои мағозаҳо: Тоҷикистон, UAE ва тамоми ҷаҳон.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Нархгузорӣ аввал: каталог бо ҳамин қурб ҳисоб мешавад
  const pricing = await loadPricing();
  applyPricing(pricing);
  const [products, site] = await Promise.all([loadStorefront(), loadSite()]);
  return (
    <html lang="tg">
      <body className={inter.className}>
        <LangProvider>
          <CurrencyProvider>
            <PricingProvider initial={pricing}>
            <SiteProvider initial={site}>
              <CatalogProvider initial={products}>
                <CartProvider>
                  <DeskBar />
                  <div className="app">{children}</div>
                </CartProvider>
              </CatalogProvider>
            </SiteProvider>
            </PricingProvider>
          </CurrencyProvider>
        </LangProvider>
      </body>
    </html>
  );
}
