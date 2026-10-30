import type { Metadata } from "next";
import PageTop from "@/components/PageTop";
import RequestView from "@/components/RequestView";

export const metadata: Metadata = { title: "Дархости мол — RamzIx" };

export default function RequestPage() {
  return (
    <>
      <PageTop title="Дархости мол" />
      <main className="ck-main">
        <RequestView />
      </main>
    </>
  );
}
