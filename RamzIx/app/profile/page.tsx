import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import PageTop from "@/components/PageTop";
import ProfileView from "@/components/ProfileView";

export const metadata: Metadata = { title: "Профил — RamzIx" };

export default function ProfilePage() {
  return (
    <>
      <PageTop title="Профил" />
      <main className="pf-main">
        <ProfileView />
      </main>
      <BottomNav />
    </>
  );
}
