import type { Metadata } from "next";
import PageTop from "@/components/PageTop";
import CheckoutView from "@/components/CheckoutView";

export const metadata: Metadata = { title: "Расмӣ кардани фармоиш — RamzIx" };

export default function CheckoutPage() {
  return (
    <>
      <PageTop title="Расмӣ кардани фармоиш" />
      <main className="ck-main">
        <CheckoutView />
      </main>
    </>
  );
}
